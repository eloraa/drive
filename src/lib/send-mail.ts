import type { SendVerificationRequestParams } from 'next-auth/providers/email';
import { createTransport } from 'nodemailer';
import { headers } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

interface Geo {
  country: string;
  city: string;
}

function IP(req?: NextRequest) {
  const FALLBACK_IP_ADDRESS = '0.0.0.0';
  const forwardedFor = headers().get('x-forwarded-for');

  if (req?.ip) return req.ip;

  if (forwardedFor) {
    return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get('x-real-ip') ?? FALLBACK_IP_ADDRESS;
}

const getLocation = async (req: NextRequest | undefined) => {
  if (!req) throw new Error('Request not found');

  const city = headers().get('X-City');
  const country = headers().get('X-Country');
  if (!city || !country || city === '' || country === '') {
    const data = await fetch(`https://ipapi.co/${IP(req)}/json/`, {
      cache: 'no-cache',
    });
    const json = (await data.json()) as Geo;
    return { city: json.city, country: json.country };
  }

  return { city, country };
};

interface EmailParams extends SendVerificationRequestParams {
  req?: NextRequest;
  res?: NextResponse;
}

export const sendMail = async (params: EmailParams) => {
  const { identifier, url, provider, req } = params;
  const { host } = new URL(url);
  const transport = createTransport(provider.server);

  const { city, country } = await getLocation(req);

  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    replyTo: env.EMAIL_REPLY_TO,
    subject: `Sign in to Aruu.me`,
    text: text({
      url,
      ip: IP(req),
      city: city ?? '',
      country: country ?? '',
      identifier,
    }),
    html: html({
      url,
      host,
      identifier,
      ip: IP(req),
      city: city ?? '',
      country: country ?? '',
    }),
    attachments: [
      {
        cid: 'drive.aruu.me',
        filename: 'drive.aruu.png',
        encoding: 'base64',
        contentType: 'image/png',
        contentDisposition: 'inline',
        content: `iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAAAXNSR0IArs4c6QAAA5dJREFUaEPt
  mV1v2zYUhl/fr1f5Iwnyr3exAsWWixZts63ogK5zmyaB4UaJayf+kEVJlEhRX5Q8nKO0CLq4c5La
  s4DxxoZgEw+PXr7nHLIDYIGWjQ5B//zL45WwrS1hUgMpQ4ynYziOg9lsCjEPEQYR4lgjz3KUpV1p
  vvv+6Av0D48e3WuO8eQSZxcfMRp+QhhICE9gNhGQYQSlE2Rpfq956U87OzvY39+H53nodDrodrs8
  14OhPxNdTS5xcnoEITxopSC8EO7MhZQJL8AkKaqquvMC9vb2sLu7i8FggMPDw+8LTbNVdYXu+z8x
  HA2gYwUVK/iC4AW0NohkDKUSLBYP20bfLdI3Q3jaO0avf4IszRBHMVSs4boe4kjzd9J+arI7R/3z
  H9YCTZP3+qc47X1AWRQsjzzLMJvMISN6A/o68upe4GuDJpqjky7OnD5sWfImpc/J2GXoKFIwJoMM
  4ztrfa3QBP7qj0PM3CmKvEAYhKirGuPLCRKTMnDOz6M72eTaobXRePb8gKNpEsOb0xYFRqMp8jxH
  GMQoyxKBL2Htau6ydmiK9tl5H0fHjcdGoUSW5Uh0gvGVy29ASgK37DSrOMtGoAn26YsDxHGEyloI
  z+cFeK5AGMZIEoNEG3YUWsC/jY1BD4bn+OvdG+YhDyfQurK4OL9CXdfX8rCs8zT9th1uDJpgnxz8
  hKLIUVcVvLngBQQihBAhSyaOFGt/7jZvYtnYKPS7o7c4H5w12pYRJ5/aWjjOqFkAb0bLyYfkshXQ
  s/kUr1439QMlG0o6NKZTFypKkJqU0zy5iDdfHu2NRrpe1Hj85MfGIRYLuLN5o3GlMBl7qOuKCy0a
  vi/ZWW4bG4UmgJe/PYMfNHoO/QBFUd4qEZIHyWQroKkKvPjkMAslGko4NIaDEfLcQivN6Z18W3jB
  dkD3nR6OT94zTGoMOwbrmmoSlbDdUW3CzyaNfL4eG5fH6GqIN29fM0fBaVzyd0o4gR+h4KqwSTC0
  GW9L7RuHvukgZUE1RyMBKpoIsqoonTcLobROmv/PI+35c/z6+3PmsFxvNNZGXQ11ODcdJAgk8uyf
  DvJ/pG/dNV89bKWmPzo9fGibe7TSp1uXEVtZe7SyymtlPd26zqWVPWLruvHWnXskRuNp206Yvn2W
  p66PxrboLK91p6atO59u1U3A0jsXV0CrLbxzWXa7FckE4QNut9bSja/zHnFZJ9TeG9tVertt+s3f
  dpRrTMoKEY0AAAAASUVORK5CYII=`,
      },
    ],
  });
  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`);
  }
};

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
/**
 * TODO: Include Real IP and User Adress
 */
function html(params: {
  url: string;
  identifier: string;
  host: string;
  ip: string;
  city: string;
  country: string;
}) {
  const { url, identifier, ip, city, country } = params;

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">

  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Your login link for Aruu.me<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
  </div>  <body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;padding: 0px 10px;">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:560px;margin:0 auto;padding:20px 0 48px">
      <tbody>
        <tr style="width:100%">
          <td>

          <div style="text-align:center;"><img src="cid:drive.aruu.me" style="display:inline-block;outline:none;border:none;text-decoration:none;width:45px;height:45px" alt="Aruu.me" width="45" height="45"  /></div>
            <h1 style="font-size:24px;text-align:center;letter-spacing:-0.5px;line-height:1.3;font-weight:400;color:#000000;padding:8px 0 0">Your magic link to log in to <span style="font-weight:500;">Aruu.me</span></h1>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding:10px 0 27px">
              <tbody>
                <tr>
                  <td><a href="${url}" style="line-height:100%;text-decoration:none;display:block;max-width:100%;background-color:#000;border-radius:3px;font-weight:600;color:#fff;font-size:15px;text-align:center;padding:11px 23px 11px 23px" target="_blank"><span><!--[if mso]><i style="mso-font-width:383.33333333333337%;mso-text-raise:16.5" hidden>&#8202;&#8202;&#8202;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:8.25px">Login to Aruu.me</span><span><!--[if mso]><i style="mso-font-width:383.33333333333337%" hidden>&#8202;&#8202;&#8202;&#8203;</i><![endif]--></span></a></td>
                </tr>
              </tbody>
            </table>
            <p style="font-size:14px;line-height:24px;margin:6px 0;color:#000000">You've requested to log in to <span style="font-weight:500;">Aruu.me</span> with the following email address (<a style="color:rgb(123, 28, 240);text-decoration:none;text-decoration-line:none" target="_blank">${identifier}</a>) </p>
            <p style="font-size:14px;line-height:1.4;margin:0 0 15px;color:#000000">This link and code will only be valid for the next 15 minutes.</p>
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-width:1px;border-style:solid;border-color:rgb(234,234,234);margin-top:26px;margin-bottom:26px;margin-left:0px;margin-right:0px" />
            <p style="font-size:12px;line-height:24px;margin:16px 0;color:rgb(102,102,102)">This code was sent from <span style="color:rgb(0,0,0)">${ip}</span>${city !== '' && country !== '' ? ` <!-- -->located in<!-- --> <span style="color:rgb(0,0,0)">${city}, ${country}</span>` : ''}. If you were not expecting this email, you can ignore this email.</p>
            <p style="font-size:12px;line-height:24px;margin:16px 0;color:rgb(102,102,102)"><a href="https://aruu.me" style="color:rgb(0, 0, 0);text-decoration:none;font-size:12px" target="_blank">aruu.me®</a> 2024</p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
/**
 * TODO: Include Real IP and User Adress
 */
function text({
  url,
  ip,
  city,
  country,
  identifier,
}: {
  url: string;
  ip: string;
  city: string;
  country: string;
  identifier: string;
}) {
  return `You've requested to Sign in to Aruu.me with the following email address (${identifier})\n${url}\n\nNote: This link and code will only be valid for the next 15 minutes.\n\nThis code was sent from ${ip} located in ${city}, ${country}. If you were not expecting this email, you can ignore this email.`;
}
