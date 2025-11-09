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
  mapOutline,
  barChartOutline,
  hardwareChipOutline,
  logOutOutline,
} from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';

// Import your admin pages
import AdminHome from './AdminHome';
import AdminMaps from './AdminMaps';
import AdminReports from './AdminReports';
import AdminDevices from './AdminDevices';

const AdminMenu: React.FC = () => {
  // Navigation links for admin side
  const path = [
    { name: 'Home', url: '/EmergTrack/app/admin/home', icon: homeOutline },
    { name: 'Live Maps', url: '/EmergTrack/app/admin/maps', icon: mapOutline },
    { name: 'Reports', url: '/EmergTrack/app/admin/reports', icon: barChartOutline },
    { name: 'Devices', url: '/EmergTrack/app/admin/devices', icon: hardwareChipOutline },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn'); // clear session
    window.location.href = '/EmergTrack/admin'; // redirect to login
  };

  return (
    <IonPage>
      {/* 🧭 Admin Side Menu */}
      <IonMenu contentId="adminContent" side="start">
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Admin Menu</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          {path.map((item, index) => (
            <IonMenuToggle key={index} autoHide={true}>
              <IonItem routerLink={item.url} routerDirection="forward" lines="none">
                <IonIcon icon={item.icon} slot="start" />
                {item.name}
              </IonItem>
            </IonMenuToggle>
          ))}

          {/* 🚪 Logout Button */}
          <IonButton
            color="danger"
            expand="full"
            onClick={handleLogout}
            className="ion-margin-top"
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Logout
          </IonButton>
        </IonContent>
      </IonMenu>

      {/* 🖥️ Main Admin Pages */}
      <IonPage id="adminContent">
        <IonHeader>
          <IonToolbar color="primary">
            <IonMenuButton slot="start" />
            <IonTitle>EmergTrack Admin</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonRouterOutlet>
          <Route exact path="/EmergTrack/app/admin/home" component={AdminHome} />
          <Route exact path="/EmergTrack/app/admin/maps" component={AdminMaps} />
          <Route exact path="/EmergTrack/app/admin/reports" component={AdminReports} />
          <Route exact path="/EmergTrack/app/admin/devices" component={AdminDevices} />

          {/* ✅ Default redirect when hitting /admin */}
          <Route exact path="/EmergTrack/app/admin">
            <Redirect to="/EmergTrack/app/admin/home" />
          </Route>
        </IonRouterOutlet>
      </IonPage>
    </IonPage>
  );
};

export default AdminMenu;
