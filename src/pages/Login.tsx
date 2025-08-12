import React, { useState } from 'react';
import { 
  IonAvatar,
  IonButton,
  IonContent, 
  IonIcon, 
  IonInput, 
  IonInputPasswordToggle, 
  IonItem, 
  IonPage, 
  IonText, 
  IonToolbar, 
  IonTitle, 
  useIonRouter, 
  IonAlert, 
  IonModal, 
  IonToast
} from '@ionic/react';
import { logoTwitter } from 'ionicons/icons';

const Login: React.FC = () => {
  const navigation = useIonRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const validUsername = 'user123';
  const validPassword = 'password123';

  const doLogin = () => {
    if (!username || !password) {
      setShowAlert(true);
    } else {
      if (username === validUsername && password === validPassword) {
        setShowSuccessModal(true);
        setShowToast(true);
      } else {
        setLoginError(true);
      }
    }
  };

  const handleAlertConfirm = () => {
    setShowAlert(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.push('/it35-lab/app', 'forward', 'replace');
  };

  return (
    <IonPage>
      <IonContent style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <IonAvatar style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            marginBottom: '10px'
          }}>
            <IonIcon
              icon={logoTwitter}
              color="primary"
              style={{
                fontSize: '50px',
                color: '#1da1f2'
              }}
            />
          </IonAvatar>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            USER LOGIN
          </h1>
        </div>

        <IonItem style={{ marginBottom: '15px', width: '100%' }}>
          <IonInput
            labelPlacement="floating"
            value={username}
            onIonChange={(e) => setUsername(e.detail.value!)}
            placeholder="Enter username"
            style={{ backgroundColor: '#ffffff' }}
          />
        </IonItem>
        <IonItem style={{ marginBottom: '15px', width: '100%' }}>
          <IonInput
            labelPlacement="floating"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            style={{ backgroundColor: '#ffffff' }}
          >
            <IonInputPasswordToggle slot="end" onClick={() => setShowPassword(!showPassword)} />
          </IonInput>
        </IonItem>
        {loginError && (
          <IonText color="danger">
            <p style={{
              color: '#e74c3c',
              marginBottom: '10px'
            }}>
              Incorrect username or password. Please try again.
            </p>
          </IonText>
        )}
        <IonButton 
          onClick={doLogin} 
          expand="full" 
          style={{
            backgroundColor: '#1da1f2',
            color: 'white',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          Login
        </IonButton>

        <IonButton 
          onClick={() => navigation.push('/EmergTrack/register', 'forward', 'replace')}
          expand="full" 
          color="secondary"
          style={{
            marginTop: '10px',
            width: '100%'
          }}
        >
          Create Account
        </IonButton>

        <IonModal isOpen={showSuccessModal} onDidDismiss={handleSuccessModalClose}>
          <IonContent className="ion-padding">
            <h2>Login Successful!</h2>
            <IonButton expand="full" onClick={handleSuccessModalClose}>Go to Dashboard</IonButton>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          message="Login successful! Redirecting to the dashboard..."
          onDidDismiss={() => setShowToast(false)}
          duration={3000}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Please Fill in All Fields"
          message="All fields are required. Please fill in all fields."
          buttons={[{
            text: 'OK',
            handler: handleAlertConfirm,
          }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;