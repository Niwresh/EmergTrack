import {
  IonAlert,
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonText,
  IonToast,
  IonLoading,
  useIonRouter,
} from '@ionic/react';
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClients';
import bcrypt from 'bcryptjs';
import '../../Assets/Login.css';

// Custom AlertBox Component
const AlertBox: React.FC<{ message: string; isOpen: boolean; onClose: () => void }> = ({
  message,
  isOpen,
  onClose,
}) => (
  <IonAlert
    isOpen={isOpen}
    onDidDismiss={onClose}
    header="Notification"
    message={message}
    buttons={['OK']}
  />
);

const PoliceLogin: React.FC = () => {
  const navigation = useIonRouter();

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const doLogin = async () => {
    setIsLoading(true);

    if (!email || !password) {
      setAlertMessage('Please enter both email and password.');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Check if police email exists
      const { data: policeData, error } = await supabase
        .from('police')
        .select('*')
        .eq('police_email', email)
        .single();

      if (error || !policeData) {
        setAlertMessage('No police account found with this email.');
        setShowAlert(true);
        setIsLoading(false);
        return;
      }

      // ✅ Compare hashed password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, policeData.police_password);
      if (!isPasswordValid) {
        setAlertMessage('Incorrect password. Please try again.');
        setShowAlert(true);
        setIsLoading(false);
        return;
      }

      // ✅ Optional: Sign in with Supabase Auth (keeps session sync)
      await supabase.auth.signInWithPassword({ email, password });

      // ✅ Success
      setShowToast(true);
      setTimeout(() => {
        navigation.push('/EmergTrack/app/police/home/dashboard', 'forward', 'replace');
      }, 1200);
    } catch (err) {
      setAlertMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="login-container">
          <IonCard>
            <IonCardContent>
              {/* Avatar */}
              <div className="login-avatar">
                <IonAvatar>
                  <img
                    src="https://ph.pinterest.com/pin/25755029113989852/"
                    alt="Avatar"
                  />
                </IonAvatar>
              </div>

              {/* Title */}
              <div className="login-title">
                <IonText>Police LOGIN</IonText>
              </div>

              {/* Form */}
              <div className="login-form">
                <IonInput
                  label="Email"
                  labelPlacement="floating"
                  fill="outline"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
                />

                <IonInput
                  label="Password"
                  labelPlacement="floating"
                  fill="outline"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value!)}
                >
                  <IonInputPasswordToggle slot="end" />
                </IonInput>

                <IonButton expand="block" className="login-btn" onClick={doLogin}>
                  Login
                </IonButton>

                <IonButton
                  routerLink="/EmergTrack/police/register"
                  expand="block"
                  fill="outline"
                  className="register-btn"
                >
                  Don’t have an account? Register here
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Alerts */}
        <AlertBox message={alertMessage} isOpen={showAlert} onClose={() => setShowAlert(false)} />

        {/* Loading Spinner */}
        <IonLoading isOpen={isLoading} message="Please wait..." spinner="circles" duration={0} />

        {/* Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Login successful! Redirecting..."
          duration={1500}
          position="top"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default PoliceLogin;
