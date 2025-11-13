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
import Dashboard from './Dashboard';
import PoliceAlert from './PoliceAlert';
import PoliceMaps from './PoliceMaps';

const PoliceHome: React.FC = () => {
  const tabs = [
    { name: 'Dashboard', tab: 'dashboard', url: '/EmergTrack/app/police/home/dashboard', icon: bookOutline },
    { name: 'Maps', tab: 'maps', url: '/EmergTrack/app/police/home/policemaps', icon: search },
    { name: 'Alerts', tab: 'alerts', url: '/EmergTrack/app/police/home/policealert', icon: notificationsOutline },
  ];

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/EmergTrack/app/police/home/dashboard" component={Dashboard} />
        <Route exact path="/EmergTrack/app/police/home/policemaps" component={PoliceMaps} />
        <Route exact path="/EmergTrack/app/police/home/policealert" component={PoliceAlert} />

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