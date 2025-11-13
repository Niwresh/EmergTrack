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
import { supabase } from "../../utils/supabaseClients";

// ✅ Leaflet imports
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

// ✅ Define TypeScript interface for forwarded alerts
interface ForwardedAlert {
  id: number;
  alert_id: number;
  student_id: string;
  message: string;
  latitude: number;
  longitude: number;
  forwarded_at: string;
  parent_name?: string;
  parent_phone?: string;
  student_name?: string;
  is_read?: boolean;
}

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [alerts, setAlerts] = useState<ForwardedAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [readCount, setReadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // ✅ Fetch all forwarded alerts
      const { data, error } = await supabase
        .from("forwarded_alerts")
        .select("*")
        .order("forwarded_at", { ascending: false });

      if (error) {
        console.error("Error fetching forwarded alerts:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setAlerts(data.slice(0, 3)); // Show the latest 3 alerts
        setUnreadCount(data.filter((a) => !a.is_read).length);
        setReadCount(data.filter((a) => a.is_read).length);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // ✅ Latest alert coordinates for the map preview
  const latestAlert = alerts.length > 0 ? alerts[0] : null;
  const lat = latestAlert?.latitude;
  const lng = latestAlert?.longitude;

  // ✅ Navigate to the full map page
  const goToMap = () => {
    history.push("/EmergTrack/app/police/home/maps");
  };

  return (
    <IonPage id="policeContent">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Police Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20%" }}>
            <IonSpinner />
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              {/* Unread (New) Alerts Count */}
              <IonCol size="12" sizeMd="6">
                <IonCard color="danger">
                  <IonCardHeader>
                    <IonCardTitle>New / Unread Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h1>{unreadCount}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Read Alerts Count */}
              <IonCol size="12" sizeMd="6">
                <IonCard color="success">
                  <IonCardHeader>
                    <IonCardTitle>Read Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h1>{readCount}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow>
              {/* Latest Alert Map Preview */}
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
                            {new Date(latestAlert.forwarded_at).toLocaleString()}
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
                    <IonCardTitle>Recent Forwarded Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {alerts.length === 0 ? (
                      <IonText>No forwarded alerts yet</IonText>
                    ) : (
                      alerts.map((a) => (
                        <div key={a.id} style={{ marginBottom: "10px" }}>
                          <p>
                            🚨 {a.message || "Emergency alert triggered!"}
                            <br />
                            👨‍🎓 <strong>{a.student_name || a.student_id}</strong>
                            <br />
                            📍 {a.latitude}, {a.longitude}
                            <br />
                            <small>
                              {new Date(a.forwarded_at).toLocaleString()}
                            </small>
                          </p>
                          <hr />
                        </div>
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
