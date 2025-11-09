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
import '../../Assets/Login.css';

// 🔔 Custom AlertBox Component
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

const AdminLogin: React.FC = () => {
  const navigation = useIonRouter();

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Hardcoded admin credentials
  const ADMIN_CREDENTIALS = {
    email: 'EmergTrack@admin', // change this to your preferred admin email
    password: 'admin123', // change this to your preferred admin password
  };

  const doLogin = async () => {
    setIsLoading(true);

    if (!email || !password) {
      setAlertMessage('Please enter both email and password.');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    // ✅ Simple hardcoded validation
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setShowToast(true);

      // Save admin session (optional)
      localStorage.setItem('isAdminLoggedIn', 'true');

      // Redirect after short delay
      setTimeout(() => {
        navigation.push('/EmergTrack/app/admin/dashboard', 'forward', 'replace');
      }, 1200);
    } else {
      setAlertMessage('Invalid admin credentials.');
      setShowAlert(true);
    }

    setIsLoading(false);
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
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="Admin Avatar"
                  />
                </IonAvatar>
              </div>

              {/* Title */}
              <div className="login-title">
                <IonText>Admin LOGIN</IonText>
              </div>

              {/* Form */}
              <div className="login-form">
                <IonInput
                  label="Email"
                  labelPlacement="floating"
                  fill="outline"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
                />

                <IonInput
                  label="Password"
                  labelPlacement="floating"
                  fill="outline"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value!)}
                >
                  <IonInputPasswordToggle slot="end" />
                </IonInput>

                <IonButton expand="block" className="login-btn" onClick={doLogin}>
                  Login
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
          message="Admin login successful! Redirecting..."
          duration={1500}
          position="top"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminLogin;
