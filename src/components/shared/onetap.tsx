'use client';
import { useAuthStore } from '@/store';
import { type CredentialResponse } from 'google-one-tap';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

export const Onetap = ({ clientId }: { clientId: string }) => {
  return (
    <SessionProvider>
      <OnetapRoot clientId={clientId} />
    </SessionProvider>
  );
};

const OnetapRoot = ({ clientId }: { clientId: string }) => {
  const { isGoogleSignInLoading, setGoogleSignInLoading } = useAuthStore();
  const { data: session, status } = useSession();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    const callback = (response: CredentialResponse) => {
      void (async () => {
        setGoogleSignInLoading(true);
        await signIn('googleonetap', {
          credential: response.credential,
        });
        setGoogleSignInLoading(false);
      })();
    };

    if (
      status !== 'loading' &&
      !session &&
      !isGoogleSignInLoading &&
      window.google
    ) {
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
  }, [
    session,
    isGoogleSignInLoading,
    setGoogleSignInLoading,
    clientId,
    status,
  ]);

  return <div id='googleonetap' />;
};
