import { 
  IonButtons,
  IonContent, 
  IonHeader, 
  IonMenuButton, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonNote
} from '@ionic/react';
import { mailOutline, documentTextOutline, informationCircleOutline } from 'ionicons/icons';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>About</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">

        {/* App Overview */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>About This App</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            This app allows parents to register their children and assign a unique 
            device for school monitoring and safety purposes. 
          </IonCardContent>
        </IonCard>

        {/* Version Info */}
        <IonList inset>
          <IonItem>
            <IonIcon icon={informationCircleOutline} slot="start" />
            <IonLabel>Version</IonLabel>
            <IonNote slot="end">v1.0.0</IonNote>
          </IonItem>
        </IonList>

        {/* Contact Info */}
        <IonList inset>
          <IonItem button detail={false} href="mailto:20212127@nbsc.edu.ph">
            <IonIcon icon={mailOutline} slot="start" />
            <IonLabel>Contact Us</IonLabel>
            <IonNote slot="end">20212127@nbsc.edu.ph</IonNote>
          </IonItem>
        </IonList>

        {/* Privacy Policy & Terms */}
        <IonList inset>
          <IonItem button detail={true} href="#">
            <IonIcon icon={documentTextOutline} slot="start" />
            <IonLabel>Privacy Policy</IonLabel>
          </IonItem>
          <IonItem button detail={true} href="#">
            <IonIcon icon={documentTextOutline} slot="start" />
            <IonLabel>Terms & Conditions</IonLabel>
          </IonItem>
        </IonList>

        {/* Acknowledgments */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Acknowledgments</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Built with ❤️ using Ionic React, Supabase, and Leaflet.  
            Special thanks to the development team and contributors.
          </IonCardContent>
        </IonCard>

      </IonContent>
    </IonPage>
  );
};

export default About;
