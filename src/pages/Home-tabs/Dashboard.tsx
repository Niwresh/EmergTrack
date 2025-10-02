import { 
  IonButtons,
    IonContent, 
    IonHeader,  
    IonMenuButton,  
    IonPage, 
    IonTitle, 
    IonToolbar 
} from '@ionic/react';
import DashboardContainer from '../../components/DashboardContainer';

const Dashboard: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <DashboardContainer />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;