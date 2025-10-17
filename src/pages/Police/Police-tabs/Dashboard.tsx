import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonMenuButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { supabase } from "../../../utils/supabaseClients";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Fix default marker issue in React-Leaflet
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ✅ Define TypeScript interface for alerts
interface Alert {
  id: number;
  alert_message: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [resolvedCount, setResolvedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // ✅ Get active alerts
      const { data: activeAlerts, error: activeError } = await supabase
        .from("alerts")
        .select("*")
        .eq("status", "active");

      if (!activeError && activeAlerts) {
        setAlerts(activeAlerts.slice(0, 3)); // Show latest 3
        setActiveCount(activeAlerts.length);
      }

      // ✅ Get resolved alerts count
      const { count: resolved, error: resolvedError } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved");

      if (!resolvedError && resolved !== null) {
        setResolvedCount(resolved);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // ✅ Latest alert coordinates
  const latestAlert = alerts.length > 0 ? alerts[0] : null;
  const lat = latestAlert?.latitude;
  const lng = latestAlert?.longitude;

  // ✅ Go to map page
  const goToMap = () => {
    history.push("/EmergTrack/app/police/home/maps");
  };

  return (
    <IonPage id="policeContent">
      <IonHeader>
        <IonToolbar>
          {/* ✅ Add menu button to show PoliceMenu */}
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Police Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <IonSpinner />
        ) : (
          <IonGrid>
            <IonRow>
              {/* Active Alerts Count */}
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Active Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h1>{activeCount}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Resolved Alerts Count */}
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Resolved Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h1>{resolvedCount}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow>
              {/* Latest Alert Location (Map Preview) */}
              <IonCol size="12" sizeMd="6">
                <IonCard onClick={goToMap} button>
                  <IonCardHeader>
                    <IonCardTitle>Latest Alert Location</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {lat && lng ? (
                      <MapContainer
                        center={[lat, lng]}
                        zoom={15}
                        style={{ height: "150px", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[lat, lng]}>
                          <Popup>
                            🚨 Latest Alert <br />
                            {new Date(latestAlert.created_at).toLocaleString()}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <div
                        style={{
                          height: "150px",
                          background: "#e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IonText color="medium">[ No Alerts Yet ]</IonText>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Recent Alerts List */}
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Recent Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {alerts.length === 0 ? (
                      <IonText>No active alerts</IonText>
                    ) : (
                      alerts.map((a) => (
                        <p key={a.id}>
                          🚨 {a.alert_message} <br />
                          📍 {a.latitude}, {a.longitude} <br />
                          <small>
                            {new Date(a.created_at).toLocaleString()}
                          </small>
                        </p>
                      ))
                    )}
                    <IonButton expand="block" onClick={goToMap}>
                      View All Alerts on Map
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
