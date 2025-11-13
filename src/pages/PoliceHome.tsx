import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { bookOutline, notificationsOutline, search } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import Dashboard from './Police/Police-tabs/Dashboard';
import Alerts from './Police/Police-tabs/Alerts';
import Maps from './Police/Police-tabs/Maps';

const PoliceHome: React.FC = () => {
  const tabs = [
    { name: 'Dashboard', tab: 'dashboard', url: '/EmergTrack/app/police/home/dashboard', icon: bookOutline },
    { name: 'Maps', tab: 'maps', url: '/EmergTrack/app/police/home/maps', icon: search },
    { name: 'Alerts', tab: 'alerts', url: '/EmergTrack/app/police/home/alerts', icon: notificationsOutline },
  ];

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/EmergTrack/app/police/home/dashboard" component={Dashboard} />
        <Route exact path="/EmergTrack/app/police/home/maps" component={Maps} />
        <Route exact path="/EmergTrack/app/police/home/alerts" component={Alerts} />

        {/* Default tab redirect */}
        <Route exact path="/EmergTrack/app/police/home">
          <Redirect to="/EmergTrack/app/police/home/dashboard" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        {tabs.map((item, index) => (
          <IonTabButton key={index} tab={item.tab} href={item.url}>
            <IonIcon icon={item.icon} />
            <IonLabel>{item.name}</IonLabel>
          </IonTabButton>
        ))}
      </IonTabBar>
    </IonTabs>
  );
};

export default PoliceHome;
