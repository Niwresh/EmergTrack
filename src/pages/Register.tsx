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
import { supabase } from '../utils/supabaseClients'; // ✅ make sure you created this client
import bcrypt from 'bcryptjs';

const Register: React.FC = () => {
  const navigation = useIonRouter();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const DoRegister = async () => {
    setIsLoading(true);

    // ✅ Validation
    if (!fullName || !username || !email || !password || !confirmPassword) {
      setAlertMessage("Please fill in all fields.");
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setAlertMessage("Please enter a valid email address.");
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match.");
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Insert into parents table
      const { error } = await supabase
        .from('parents')
        .insert([
          {
            full_name: fullName,
            username: username,
            email: email,
            password: hashedPassword,
          },
        ]);

      if (error) {
        console.error(error);
        setAlertMessage(`Error: ${error.message}`);
        setShowAlert(true);
        setIsLoading(false);
        return;
      }

      // ✅ Success
      setAlertMessage("Registration successful! Redirecting to login.");
      setShowAlert(true);
      setIsLoading(false);

      setTimeout(() => {
        navigation.push('/EmergTrack', 'forward', 'replace');
      }, 2000);

    } catch (err: unknown) {
      console.error(err);
      setAlertMessage("Something went wrong. Please try again.");
      setShowAlert(true);
      setIsLoading(false);
    }
  };

  const DoLogin = () => {
    navigation.push('/EmergTrack', 'forward', 'replace');
  };

  return (
    <IonPage>
      <IonContent className="register-container">

        {/* Logo */}
        <div className="logo">
          <img 
            src="https://scontent.fceb2-1.fna.fbcdn.net/v/t1.15752-9/538959922_3879256525543014_5947897526488506572_n.jpg"
            alt="App Logo" 
          />
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
            <span className="icon">📧</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
