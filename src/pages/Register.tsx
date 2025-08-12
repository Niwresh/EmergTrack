import React, { useState } from 'react';
import { 
  IonButton,
  IonContent, 
  IonInput, 
  IonItem, 
  IonTextarea, 
  IonPage, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonAlert,
  IonLoading,
  IonLabel,
  IonText,
  useIonRouter
} from '@ionic/react';

const Register: React.FC = () => {
  const navigation = useIonRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const DoRegister = () => {
    setIsLoading(true);
    if (!firstName || !lastName || !address || !email || !password || !confirmPassword) {
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Register</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonItem>
          <IonTextarea
            label="First Name"
            labelPlacement="floating"
            fill="solid"
            placeholder="Enter your first name"
            value={firstName}
            onIonChange={(e) => setFirstName(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonTextarea
            label="Last Name"
            labelPlacement="floating"
            fill="solid"
            placeholder="Enter your last name"
            value={lastName}
            onIonChange={(e) => setLastName(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonTextarea
            label="Address"
            labelPlacement="floating"
            fill="solid"
            placeholder="Enter your address"
            value={address}
            onIonChange={(e) => setAddress(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="Email"
            labelPlacement="floating"
            fill="solid"
            type="email"
            placeholder="Enter your email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="Password"
            labelPlacement="floating"
            fill="solid"
            type="password"
            placeholder="Enter password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="Confirm Password" 
            labelPlacement="floating" 
            fill="solid" 
            type="password" 
            placeholder="Confirm password" 
            value={confirmPassword} 
            onIonChange={(e) => setConfirmPassword(e.detail.value!)}
          />
        </IonItem>
        <IonButton onClick={DoRegister} expand="full">Register</IonButton>

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

        <IonText color="primary">
          <IonLabel>Already have an account?</IonLabel>
          <IonButton fill="clear" onClick={DoLogin}>Sign In</IonButton>
        </IonText>
      </IonContent>
    </IonPage>
  );
};

export default Register;