import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonText,
  useIonRouter,
  IonAlert,
  IonToast,
} from '@ionic/react';
import {
  mailOutline,
  lockClosedOutline,
  logoGoogle,
  logoFacebook,
} from 'ionicons/icons';
import { supabase } from '../utils/supabaseClients';
import bcrypt from 'bcryptjs';
import '../Assets/Login.css';

const Login: React.FC = () => {
  const navigation = useIonRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // ✅ Manual Email + Password Login
  const doLogin = async () => {
    console.log('🔘 Login button clicked with:', email, password);

    if (!email.trim() || !password.trim()) {
      setAlertMessage('All fields are required. Please fill in all fields.');
      setShowAlert(true);
      return;
    }

    try {
      console.log('📡 Checking Supabase for email:', email);

      const { data: parent, error } = await supabase
        .from('parents')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      console.log('✅ Supabase response:', parent, 'Error:', error);

      if (error || !parent) {
        console.warn('⚠ No parent found with that email');
        setLoginError(true);
        return;
      }

      // ✅ Verify password
      let isValidPassword = false;
      try {
        isValidPassword = await bcrypt.compare(password, parent.password);
      } catch (err) {
        console.error('❌ Bcrypt error:', err);
      }

      // fallback: plaintext check
      if (!isValidPassword && password === parent.password) {
        console.warn('⚠ Password matched as plaintext (old DB entry)');
        isValidPassword = true;
      }

      console.log('🔑 Password valid?', isValidPassword);

      if (!isValidPassword) {
        setLoginError(true);
        return;
      }

      // ✅ Insert into logs
      console.log('📝 Inserting login into logs...');
      const { data: log, error: logError } = await supabase
        .from('logs')
        .insert([
          {
            parent_id: parent.parent_id,
            full_name: parent.full_name,
            email: parent.email,
          },
        ])
        .select('id')
        .single();

      if (logError) {
        console.error('❌ Log insert error:', logError);
      } else if (log) {
        console.log('✅ Log inserted with ID:', log.id);
        localStorage.setItem('log_id', log.id);
      }

      setShowToast(true);
      console.log('🚀 Redirecting to /EmergTrack/app');
      navigation.push('/EmergTrack/app');
    } catch (err) {
      console.error('❌ Login error:', err);
      setLoginError(true);
    }
  };

  // ✅ Redirect URLs for Supabase OAuth
  const redirectTo =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8100/EmergTrack/oauth-callback'
      : 'https://niwresh.github.io/EmergTrack/oauth-callback';

  // ✅ Google OAuth
  const doGoogleLogin = async () => {
    console.log('🔵 Google login clicked');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      setAlertMessage(error.message);
      setShowAlert(true);
    }
  };

  // ✅ Facebook OAuth
  const doFacebookLogin = async () => {
    console.log('🔵 Facebook login clicked');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo },
    });
    if (error) {
      setAlertMessage(error.message);
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-container">
        <div className="logo">
          <img
            src="https://scontent.fceb2-1.fna.fbcdn.net/v/t1.15752-9/538959922_3879256525543014_5947897526488506572_n.jpg"
            alt="App Logo"
          />
          <h2>PARENT LOGIN</h2>
        </div>

        <div className="form-container">
          <div className="input-group">
            <IonIcon icon={mailOutline} className="input-icon" />
            <IonInput
              placeholder="Enter email"
              value={email}
              onIonInput={(e) => setEmail(e.detail.value ?? '')}
              type="email"
              required
            />
          </div>

          <div className="input-group">
            <IonIcon icon={lockClosedOutline} className="input-icon" />
            <IonInput
              placeholder="Enter password"
              value={password}
              onIonInput={(e) => setPassword(e.detail.value ?? '')}
              type={showPassword ? 'text' : 'password'}
              required
            >
              <IonInputPasswordToggle
                slot="end"
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              />
            </IonInput>
          </div>

          {loginError && (
            <IonText color="danger">
              <p style={{ marginBottom: '10px' }}>
                Incorrect email or password. Please try again.
              </p>
            </IonText>
          )}

          <IonButton
            type="button"
            expand="block"
            className="login-btn"
            onClick={doLogin}
          >
            Login
          </IonButton>

          <IonButton
            expand="block"
            color="secondary"
            className="login-btn"
            onClick={() =>
              navigation.push('/EmergTrack/register', 'forward', 'replace')
            }
          >
            Create Account
          </IonButton>

          <div className="divider">
            <span>OR</span>
          </div>

          <IonButton expand="block" className="google-btn" onClick={doGoogleLogin}>
            <IonIcon slot="start" icon={logoGoogle} />
            Continue with Google
          </IonButton>

          <IonButton
            expand="block"
            className="facebook-btn"
            onClick={doFacebookLogin}
          >
            <IonIcon slot="start" icon={logoFacebook} />
            Continue with Facebook
          </IonButton>
        </div>

        <IonToast
          isOpen={showToast}
          message="Login successful! Redirecting to the dashboard..."
          onDidDismiss={() => setShowToast(false)}
          duration={3000}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notification"
          message={alertMessage}
          buttons={[{ text: 'OK', handler: () => setShowAlert(false) }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
