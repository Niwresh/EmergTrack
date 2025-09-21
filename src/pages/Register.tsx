import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonAlert,
  IonLoading,
  useIonRouter
} from '@ionic/react';
import '../Assets/Register.css'; // import your CSS

const Register: React.FC = () => {
  const navigation = useIonRouter();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const DoRegister = () => {
    setIsLoading(true);

    if (!fullName || !username || !phoneNumber || !password || !confirmPassword) {
      setAlertMessage("Please fill in all fields.");
      setTimeout(() => {
        setShowAlert(true);
        setIsLoading(false);
      }, 1000);
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match.");
      setTimeout(() => {
        setShowAlert(true);
        setIsLoading(false);
      }, 1000);
      return;
    }

    setAlertMessage("Registration successful! Redirecting to login.");
    setTimeout(() => {
      setShowAlert(true);
      setIsLoading(false);
    }, 1000);
    setTimeout(() => {
      navigation.push('/EmergTrack', 'forward', 'replace');
    }, 3000);
  };

  const DoLogin = () => {
    navigation.push('/EmergTrack', 'forward', 'replace');
  };

  return (
    <IonPage>
      <IonContent className="register-container">

        {/* Logo */}
        <div className="logo">
          <img src="https://scontent.fceb2-1.fna.fbcdn.net/v/t1.15752-9/538959922_3879256525543014_5947897526488506572_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=108&ccb=1-7&_nc_sid=0024fc&_nc_eui2=AeGynUFrqy6HMQnXmqCjSCJeTvm_N8x3AqRO-b83zHcCpP-Ip8SXSsJd_SNQge144UGsWT4DWWHzQ59QQ_PNn0IN&_nc_ohc=8q4ht97k4bMQ7kNvwErOj_F&_nc_oc=AdnQMGnjKlcTgJF49ELRyhxBQl5fcWRc9O2DYaRWzmQrMPBUAiSt_0e3AMfp4UiqbfU&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fceb2-1.fna&oh=03_Q7cD3QFPkUCvtNcJybLzBKKnZUkPjqCJhZsZNI8tSuEwBwK_Xw&oe=68F6D928" 
          alt="App Logo" />
          <h2>PARENT REGISTER</h2>
        </div>

        {/* Form */}
        <div className="register-form">

          <div className="input-group">
            <span className="icon">👤</span>
            <input
              type="text"
              placeholder="Fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <span className="icon">👤</span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <span className="icon">📱</span>
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <IonButton expand="block" className="signup-btn" onClick={DoRegister}>
            SIGNUP
          </IonButton>

          {/* Login link */}
          <div className="login-link">
            have an Account?{' '}
            <a onClick={DoLogin}>login</a>
          </div>
        </div>

        {/* Alerts and Loaders */}
        <IonLoading
          isOpen={isLoading}
          message="Please wait..."
          duration={0}
          spinner="circles"
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertMessage.includes("successful") ? "Success" : "Error"}
          message={alertMessage}
          buttons={[{ text: 'OK', handler: () => setShowAlert(false) }]}
        />

      </IonContent>
    </IonPage>
  );
};

export default Register;
