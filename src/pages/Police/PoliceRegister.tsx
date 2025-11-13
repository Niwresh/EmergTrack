import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonModal,
  IonText,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonAlert,
  IonLoading,
  IonTitle,
  useIonRouter,
} from '@ionic/react';
import { supabase } from '../../utils/supabaseClients';
import bcrypt from 'bcryptjs';
import '../../Assets/Register.css';

const PoliceRegister: React.FC = () => {
  const router = useIonRouter();

  // Form state
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Registration handler
  const doRegister = async () => {
    setIsLoading(true);

    // Validate required fields
    if (!username || !firstName || !lastName || !email || !password || !confirmPassword) {
      setAlertMessage('Please fill in all fields.');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    // Allow only nbsc.edu.ph or gmail.com emails
    if (!(email.endsWith('@nbsc.edu.ph') || email.endsWith('@gmail.com'))) {
      setAlertMessage('Only @nbsc.edu.ph or @gmail.com emails are allowed.');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setAlertMessage('Passwords do not match.');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Create Supabase Auth account (optional - keeps auth in sync)
      const { error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw new Error(authError.message);

      // ✅ Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Insert record into `police` table
      const { error: insertError } = await supabase.from('police').insert([
        {
          police_username: username,
          police_firstname: firstName,
          police_lastname: lastName,
          police_email: email,
          police_password: hashedPassword,
          created_at: new Date(), // auto timestamp
        },
      ]);

      if (insertError) throw new Error(insertError.message);

      setShowSuccessModal(true);
    } catch (err) {
      setAlertMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.push('/EmergTrack/police', 'forward', 'replace');
  };

  return (
    <IonPage>
      <IonContent>
        <div className="register-container">
          <IonCard>
            <IonCardContent>
              {/* Avatar */}
              <div className="register-avatar">
                <IonAvatar>
                  <img
                    src="https://scontent.fmnl8-1.fna.fbcdn.net/v/t1.15752-9/538959922_3879256525543014_5947897526488506572_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=108&ccb=1-7&_nc_sid=0024fc&_nc_eui2=AeGynUFrqy6HMQnXmqCjSCJeTvm_N8x3AqRO-b83zHcCpP-Ip8SXSsJd_SNQge144UGsWT4DWWHzQ59QQ_PNn0IN&_nc_ohc=_BsqKAdM-HgQ7kNvwF5roE0&_nc_oc=AdlbzXiWJFIN3Qg-ilWVaMBUqWcwmplN8kk58vjh-N0dj_2R9WP30a5NWmXdXxrXwzQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fmnl8-1.fna&oh=03_Q7cD3QEtNZL8U5k8DGW05emwfTrjy25v-PyWWGB_NU7ZIwwv8A&oe=68EAC368"
                    alt="Avatar"
                  />
                </IonAvatar>
              </div>

              {/* Title */}
              <div className="register-title">
                <IonText>Police REGISTRATION</IonText>
              </div>

              {/* Form */}
              <div className="register-form">
                <IonInput
                  label="Username"
                  labelPlacement="floating"
                  fill="outline"
                  placeholder="Enter a unique username"
                  value={username}
                  onIonChange={(e) => setUsername(e.detail.value!)}
                />
                <IonInput
                  label="First Name"
                  labelPlacement="floating"
                  fill="outline"
                  placeholder="Enter your first name"
                  value={firstName}
                  onIonChange={(e) => setFirstName(e.detail.value!)}
                />
                <IonInput
                  label="Last Name"
                  labelPlacement="floating"
                  fill="outline"
                  placeholder="Enter your last name"
                  value={lastName}
                  onIonChange={(e) => setLastName(e.detail.value!)}
                />
                <IonInput
                  label="Email"
                  labelPlacement="floating"
                  fill="outline"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onIonChange={(e) => setEmail(e.detail.value!)}
                />
                <IonInput
                  label="Password"
                  labelPlacement="floating"
                  fill="outline"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                >
                  <IonInputPasswordToggle slot="end" />
                </IonInput>
                <IonInput
                  label="Confirm Password"
                  labelPlacement="floating"
                  fill="outline"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onIonChange={(e) => setConfirmPassword(e.detail.value!)}
                >
                  <IonInputPasswordToggle slot="end" />
                </IonInput>

                {/* Buttons */}
                <IonButton expand="block" className="register-btn" onClick={doRegister}>
                  Register
                </IonButton>
                <IonButton
                  expand="block"
                  fill="outline"
                  className="login-redirect-btn"
                  onClick={goToLogin}
                >
                  Already have an account? Sign In
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Loading Spinner */}
        <IonLoading isOpen={isLoading} message="Please wait..." spinner="circles" duration={0} />

        {/* Alerts */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={[{ text: 'OK', handler: () => setShowAlert(false) }]}
        />

        {/* Success Modal */}
        <IonModal isOpen={showSuccessModal} onDidDismiss={() => setShowSuccessModal(false)}>
          <IonContent className="ion-padding ion-text-center">
            <IonTitle>🎉 Registration Successful</IonTitle>
            <IonText>Your police account has been created. Check your email for verification.</IonText>
            <IonButton expand="block" onClick={goToLogin} style={{ marginTop: '20px' }}>
              Go to Login
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default PoliceRegister;