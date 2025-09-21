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
  IonModal, 
  IonToast
} from '@ionic/react';
import { personOutline, lockClosedOutline, logoGoogle, logoFacebook } from 'ionicons/icons';
import '../Assets/Login.css';  // import your CSS file

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
    navigation.push('/EmergTrack/app', 'forward', 'replace');
  };

  return (
    <IonPage>
      <IonContent className="login-container">

        {/* Logo + Title */}
        <div className="logo">
          <img 
            src="https://scontent.fceb2-1.fna.fbcdn.net/v/t1.15752-9/538959922_3879256525543014_5947897526488506572_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=108&ccb=1-7&_nc_sid=0024fc&_nc_eui2=AeGynUFrqy6HMQnXmqCjSCJeTvm_N8x3AqRO-b83zHcCpP-Ip8SXSsJd_SNQge144UGsWT4DWWHzQ59QQ_PNn0IN&_nc_ohc=8q4ht97k4bMQ7kNvwErOj_F&_nc_oc=AdnQMGnjKlcTgJF49ELRyhxBQl5fcWRc9O2DYaRWzmQrMPBUAiSt_0e3AMfp4UiqbfU&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fceb2-1.fna&oh=03_Q7cD3QFPkUCvtNcJybLzBKKnZUkPjqCJhZsZNI8tSuEwBwK_Xw&oe=68F6D928" 
            alt="App Logo" 
          />
          <h2>PARENT LOGIN</h2>
        </div>

        {/* FORM CONTAINER */}
        <div className="form-container">

          {/* Username Field */}
          <div className="input-group">
            <IonIcon icon={personOutline} className="input-icon" />
            <IonInput
              placeholder="Enter username"
              value={username}
              onIonChange={(e) => setUsername(e.detail.value!)}
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
                Incorrect username or password. Please try again.
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

        {/* Modal on Success */}
        <IonModal isOpen={showSuccessModal} onDidDismiss={handleSuccessModalClose}>
          <IonContent className="ion-padding">
            <h2>Login Successful!</h2>
            <IonButton expand="block" onClick={handleSuccessModalClose}>Go to Dashboard</IonButton>
          </IonContent>
        </IonModal>

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
            handler: handleAlertConfirm,
          }]}
        />

      </IonContent>
    </IonPage>
  );
};

export default Login;
