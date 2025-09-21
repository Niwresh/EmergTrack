import { 
  IonButton,
  IonContent, 
  IonHeader, 
  IonIcon, 
  IonItem, 
  IonMenu, 
  IonMenuToggle, 
  IonPage, 
  IonRouterOutlet, 
  IonSplitPane, 
  IonTitle, 
  IonToolbar 
} from '@ionic/react'
import { homeOutline, locateOutline, logOutOutline, rocketOutline, settingsOutline } from 'ionicons/icons';
import { Redirect, Route } from 'react-router';
import { useIonRouter } from '@ionic/react';
import { supabase } from '../utils/supabaseClients';
import Home from './Home';
import About from './About';
import Feedback from './Feedback';
import Settings from './AccountSettings';
import Maps from './Maps';

const Menu: React.FC = () => {
  const navigation = useIonRouter();

  const path = [
    { name:'Home', url: '/EmergTrack/app/home', icon: homeOutline },
    { name:'About', url: '/EmergTrack/app/about', icon: rocketOutline },
    { name:'Setings', url: '/EmergTrack/app/accountsettings', icon: settingsOutline },
    { name:'Feedback', url: '/EmergTrack/app/feedback', icon: settingsOutline },
    { name:'Maps', url: '/EmergTrack/app/maps', icon: locateOutline },
  ];

  const handleLogout = async () => {
  const logId = localStorage.getItem('log_id');
  console.log("Logging out with logId:", logId); // debug

  if (logId) {
    const { error } = await supabase
      .from('logs')
      .update({
        logout_time: new Date().toISOString() // ✅ set logout_time
      })
      .eq('id', parseInt(logId, 10)); // ✅ make sure it's number

    if (error) {
      console.error("Error updating logout_time:", error);
    } else {
      console.log("Logout time updated successfully");
    }

    // clear stored logId
    localStorage.removeItem('log_id');
  }

  // redirect back to login
  navigation.push('/EmergTrack', 'back', 'replace');
};


  return (
    <IonPage>
      <IonSplitPane contentId="main">
        <IonMenu contentId="main">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Menu</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {path.map((item,index) => (
              <IonMenuToggle key={index}>
                <IonItem routerLink={item.url} routerDirection="forward">
                  <IonIcon icon={item.icon} slot="start"></IonIcon>
                  {item.name}
                </IonItem>
              </IonMenuToggle>
            ))}

            {/* Logout Button */}
            <IonButton expand="full" onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="start" />
              Logout
            </IonButton>
          </IonContent>
        </IonMenu>

        <IonRouterOutlet id="main">
          <Route exact path="/EmergTrack/app/home" component={Home} />
          <Route exact path="/EmergTrack/app/about" component={About} />
          <Route exact path="/EmergTrack/app/accountsettings" component={Settings} />
          <Route exact path="/EmergTrack/app/feedback" component={Feedback} />
          <Route exact path="/EmergTrack/app/maps" component={Maps} />

          <Route exact path="/EmergTrack/app">
            <Redirect to="/EmergTrack/app/home" />
          </Route>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonPage>
  );
};

export default Menu;
