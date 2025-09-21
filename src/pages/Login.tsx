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
  IonToast
} from '@ionic/react';
import { mailOutline, lockClosedOutline, logoGoogle, logoFacebook } from 'ionicons/icons';
import { supabase } from '../utils/supabaseClients';  // your Supabase client file
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

  const doLogin = async () => {
    if (!email || !password) {
      setShowAlert(true);
      return;
    }

    try {
      // ✅ fetch parent by email
      const { data: parent, error } = await supabase
        .from('parents')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !parent) {
        setLoginError(true);
        return;
      }

      // ✅ compare password (hashed in DB)
      const isValidPassword = await bcrypt.compare(password, parent.password);

      if (!isValidPassword) {
        setLoginError(true);
        return;
      }

      // ✅ Insert login record into logs & capture id
      const { data: log, error: logError } = await supabase
        .from('logs')
        .insert([
          {
            parent_id: parent.id,
            full_name: parent.full_name,
            email: parent.email
          }
        ])
        .select('id') // return inserted id
        .single();

      if (logError) {
        console.error("Log insert error:", logError);
      } else if (log) {
        // ✅ store log id in localStorage for logout tracking
        localStorage.setItem('log_id', log.id);
      }

      // ✅ redirect to dashboard
      setShowToast(true);
      navigation.push('/EmergTrack/app', 'forward', 'replace');

    } catch (err) {
      console.error(err);
      setLoginError(true);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-container">

        {/* Logo + Title */}
        <div className="logo">
          <img 
            src="https://scontent.fceb2-1.fna.fbcdn.net/v/t1.15752-9/538959922_3879256525543014_5947897526488506572_n.jpg"
            alt="App Logo" 
          />
          <h2>PARENT LOGIN</h2>
        </div>

        {/* FORM CONTAINER */}
        <div className="form-container">

          {/* Email Field */}
          <div className="input-group">
            <IonIcon icon={mailOutline} className="input-icon" />
            <IonInput
              placeholder="Enter email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              type="email"
            />
          </div>

          {/* Password Field */}
          <div className="input-group">
            <IonIcon icon={lockClosedOutline} className="input-icon" />
            <IonInput
              placeholder="Enter password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
              type={showPassword ? 'text' : 'password'}
            >
              <IonInputPasswordToggle 
                slot="end" 
                className="toggle-eye" 
                onClick={() => setShowPassword(!showPassword)} 
              />
            </IonInput>
          </div>

          {/* Error Message */}
          {loginError && (
            <IonText color="danger">
              <p style={{ marginBottom: '10px' }}>
                Incorrect email or password. Please try again.
              </p>
            </IonText>
          )}

          {/* Login Button */}
          <IonButton expand="block" className="login-btn" onClick={doLogin}>
            Login
          </IonButton>

          {/* Create Account Button */}
          <IonButton 
            expand="block" 
            color="secondary" 
            className="login-btn"
            onClick={() => navigation.push('/EmergTrack/register', 'forward', 'replace')}
          >
            Create Account
          </IonButton>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Social Login Buttons */}
          <IonButton expand="block" className="google-btn">
            <IonIcon slot="start" icon={logoGoogle} />
            Continue with Google
          </IonButton>

          <IonButton expand="block" className="facebook-btn">
            <IonIcon slot="start" icon={logoFacebook} />
            Continue with Facebook
          </IonButton>

        </div>

        {/* Toast on Success */}
        <IonToast
          isOpen={showToast}
          message="Login successful! Redirecting to the dashboard..."
          onDidDismiss={() => setShowToast(false)}
          duration={3000}
        />

        {/* Alert for Empty Fields */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Please Fill in All Fields"
          message="All fields are required. Please fill in all fields."
          buttons={[{
            text: 'OK',
            handler: () => setShowAlert(false),
          }]}
        />

      </IonContent>
    </IonPage>
  );
};

export default Login;
