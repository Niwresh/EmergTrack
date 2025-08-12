
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
  import {homeOutline, logOutOutline, rocketOutline} from 'ionicons/icons';
  import { Redirect, Route } from 'react-router';
  import Home from './Home';
  import About from './About';
 
  
  const Menu: React.FC = () => {
    const path = [
        {name:'Home', url: '/EmergTrack/app/home', icon: homeOutline},
        {name:'About', url: '/EmergTrack/app/about', icon: rocketOutline},
    ]
  
    return (
        <IonPage>
            <IonSplitPane contentId="main">
                <IonMenu contentId="main">
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>
                                Menu
                            </IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        {path.map((item,index) =>(
                            <IonMenuToggle key={index}>
                                <IonItem routerLink={item.url} routerDirection="forward">
                                    <IonIcon icon={item.icon} slot="start"></IonIcon>
                                    {item.name}
                                </IonItem>
                            </IonMenuToggle>
                        ))}
  
                        {/*Logout Button*/}
                        <IonButton routerLink="/EmergTrack" routerDirection="back" expand="full">
                            <IonIcon icon={logOutOutline} slot="start"> </IonIcon>
                        Logout
                        </IonButton>
                        
                    </IonContent>
                </IonMenu>
                
                <IonRouterOutlet id="main">
                    <Route exact path="/EmergTrack/app/home" component={Home} />
                    <Route exact path="/EmergTrack/app/about" component={About} />
  
                    <Route exact path="/EmergTrack/app">
                        <Redirect to="/EmergTrack/app/home"/>
                    </Route>
                </IonRouterOutlet>
  
            </IonSplitPane>
        </IonPage>
    );
  };
  
  export default Menu;