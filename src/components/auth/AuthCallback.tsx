import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const [message] = useState('Signing you in…');

  useEffect(() => {
    const finishLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      let user = null;

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          window.location.replace('/auth/login');
          return;
        }
        user = data.user;
      } else {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          window.location.replace('/auth/login');
          return;
        }
        user = data.session.user;
      }

      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name:
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            null,
          avatar_url:
            (user.user_metadata?.avatar_url as string | undefined) ??
            (user.user_metadata?.picture as string | undefined) ??
            null,
        });
      }

      window.location.replace('/');
    };

    void finishLogin();
  }, []);

  return <p className="text-center text-sm text-slate-600">{message}</p>;
}
