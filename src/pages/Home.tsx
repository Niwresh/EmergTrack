import {  
      IonIcon, 
      IonLabel,  
      IonRouterOutlet, 
      IonTabBar, 
      IonTabButton, 
      IonTabs, 
      
  } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { bookOutline, search, star } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';

import Dashboard from './Home-tabs/Dashboard';
import Maps from './Home-tabs/Maps';
import Alerts from './Home-tabs/Alerts';
  
  const Home: React.FC = () => {

    const tabs = [
      {name:'Dashboard', tab:'dashboard',url: '/EmergTrack/app/home/dashboard', icon: bookOutline},
      {name:'Maps', tab:'maps', url: '/EmergTrack/app/home/maps', icon: search},
      {name:'Alerts',tab:'alerts', url: '/EmergTrack/app/home/alerts', icon: star},
    ]
    
    return (
      <IonReactRouter>
        <IonTabs>
          <IonTabBar slot="bottom">

            {tabs.map((item, index) => (
              <IonTabButton key={index} tab={item.tab} href={item.url}>
                <IonIcon icon={item.icon} />
                <IonLabel>{item.name}</IonLabel>
              </IonTabButton>
            ))}
            
          </IonTabBar>
        <IonRouterOutlet>

          <Route exact path="/EmergTrack/app/home/dashboard" component={Dashboard} />
          <Route exact path="/EmergTrack/app/home/maps" component={Maps} />
          <Route exact path="/EmergTrack/app/home/alerts" component={Alerts} />

          <Route exact path="/EmergTrack/app/home">
            <Redirect to="/EmergTrack/app/home/dashboard" />
          </Route>

        </IonRouterOutlet>
        </IonTabs>
      </IonReactRouter>
    );
  };
  
  export default Home;