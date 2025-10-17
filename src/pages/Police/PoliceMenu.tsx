import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonPage,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  homeOutline,
  logOutOutline,
  rocketOutline,
  settingsOutline,
} from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import Home from './PoliceHome';
// import About from './About';
// import Profile from './PoliceProfile';

const PoliceMenu: React.FC = () => {
  const path = [
    { name: 'Home', url: '/EmergTrack/app/police/home', icon: homeOutline },
    { name: 'About', url: '/EmergTrack/app/police/about', icon: rocketOutline },
    { name: 'Profile', url: '/EmergTrack/app/police/editprofilepage', icon: settingsOutline },
  ];

  return (
    <IonPage>
      {/* Police Side menu */}
      <IonMenu contentId="policeContent" side="start">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Police Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {path.map((item, index) => (
            <IonMenuToggle key={index} autoHide={true}>
              <IonItem routerLink={item.url} routerDirection="forward">
                <IonIcon icon={item.icon} slot="start" />
                {item.name}
              </IonItem>
            </IonMenuToggle>
          ))}

          {/* Logout button */}
          <IonButton
            routerLink="/EmergTrack/police"
            routerDirection="back"
            color="danger"
            expand="full"
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Logout
          </IonButton>
        </IonContent>
      </IonMenu>

      {/* Main police pages */}
      <IonPage id="policeContent">
        <IonHeader>
          <IonToolbar>
            <IonMenuButton slot="start" />
            <IonTitle>EmergTrack Police</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonRouterOutlet>
  <Route exact path="/EmergTrack/app/police/home" component={Home} />
  {/* <Route exact path="/EmergTrack/app/police/about" component={About} />
  <Route exact path="/EmergTrack/app/police/editprofilepage" component={Profile} /> */}

  {/* ✅ Default redirect when hitting /police */}
  <Route exact path="/EmergTrack/app/police">
    <Redirect to="/EmergTrack/app/police/home" />
  </Route>
</IonRouterOutlet>

      </IonPage>
    </IonPage>
  );
};

export default PoliceMenu;
