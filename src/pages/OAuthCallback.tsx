import React, { useEffect } from 'react';
import { IonPage, IonContent, IonSpinner, IonText } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { supabase } from '../utils/supabaseClients';

const OAuthCallback: React.FC = () => {
  const navigation = useIonRouter();

  useEffect(() => {
    const handleOAuth = async () => {
      console.log('🔄 Handling OAuth callback...');

      try {
        // Get current session after redirect
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error fetching session:', error);
          navigation.push('/EmergTrack', 'forward', 'replace');
          return;
        }

        if (!session?.user) {
          console.warn('⚠ No session user found');
          navigation.push('/EmergTrack', 'forward', 'replace');
          return;
        }

        const user = session.user;
        const email = user.email!;
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          email.split('@')[0];
        const provider = user.app_metadata?.provider || 'oauth';

        console.log('✅ OAuth session user:', email, provider);

        // Check if user already exists in parents table
        const { data: existingParent } = await supabase
          .from('parents')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        let parentId;

        if (!existingParent) {
          console.log('🆕 Inserting new parent from OAuth...');
          const { data: newParent, error: insertError } = await supabase
            .from('parents')
            .insert([
              {
                full_name: fullName,
                username: email.split('@')[0],
                email: email,
                password: '', // no password for OAuth
                auth_provider: provider,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select('*')
            .single();

          if (insertError) {
            console.error('❌ Error inserting parent:', insertError);
            navigation.push('/EmergTrack', 'forward', 'replace');
            return;
          }
          parentId = newParent.parent_id;
        } else {
          parentId = existingParent.parent_id;
          console.log('✅ Parent already exists:', parentId);
        }

        // Insert into logs
        const { data: log, error: logError } = await supabase
          .from('logs')
          .insert([
            {
              parent_id: parentId,
              full_name: fullName,
              email: email,
            },
          ])
          .select('id')
          .single();

        if (!logError && log) {
          console.log('📝 OAuth log created with ID:', log.id);
          localStorage.setItem('log_id', log.id);
        }

        // Redirect to dashboard
        console.log('🚀 Redirecting to /EmergTrack/app');
        navigation.push('/EmergTrack/app', 'forward', 'replace');
      } catch (err) {
        console.error('❌ OAuth handling error:', err);
        navigation.push('/EmergTrack', 'forward', 'replace');
      }
    };

    handleOAuth();
  }, [navigation]);

  return (
    <IonPage>
      <IonContent className="ion-text-center ion-padding">
        <IonSpinner name="crescent" />
        <IonText>
          <p>Signing you in, please wait...</p>
        </IonText>
      </IonContent>
    </IonPage>
  );
};

export default OAuthCallback;
