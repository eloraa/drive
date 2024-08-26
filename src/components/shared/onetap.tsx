'use client';
import { type CredentialResponse } from 'google-one-tap';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';

export const Onetap = ({ clientId }: { clientId: string }) => {
  return (
    <SessionProvider>
      <OnetapRoot clientId={clientId} />
    </SessionProvider>
  );
};

const OnetapRoot = ({ clientId }: { clientId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const isInitialized = useRef(false);

  
  useEffect(() => {
    if (isInitialized.current) return;
    console.log(session, status);

    const callback = (response: CredentialResponse) => {
      void signIn('googleonetap', {
        credential: response.credential,
      });
      setIsLoading(false);
    };

    if (status !== 'loading' && !session && !isLoading && window.google) {
      setIsLoading(true);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback,
        cancel_on_tap_outside: true,
        context: 'signin',
        itp_support: true,
        use_fedcm_for_prompt: true,
      });
      window.google.accounts.id.prompt();
      isInitialized.current = true;
    }
  }, [session, isLoading, clientId]);

  return <div id='googleonetap' />;
};
