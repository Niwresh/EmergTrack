import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import PoliceLogin from './pages/Police/PoliceLogin';
import PoliceRegister from './pages/Police/PoliceRegister';
import PoliceMenu from './pages/Police/PoliceMenu';
import AdminLogin from './pages/Admin/AdminLogin';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Parents Side */}
      <Route exact path="/EmergTrack" component={Login} />
      <Route path="/EmergTrack/oauth-callback" component={OAuthCallback} />
      <Route  path="/EmergTrack/app" component={Menu} />
      <Route  path="/EmergTrack/register" component={Register} />

      {/* Police Side */}
       <Route exact path="/EmergTrack/police" component={PoliceLogin} />
        <Route  path="/EmergTrack/police/register" component={PoliceRegister} />
        <Route path="/EmergTrack/app/police" component={PoliceMenu} />

         {/* Admin Side */}
         <Route exact path="/EmergTrack/admin" component={AdminLogin} />

      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;