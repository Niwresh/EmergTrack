import { useEffect, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
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
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClients";
import { type User } from "@supabase/supabase-js"; // ✅ fixed import

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker issue in React-Leaflet
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ✅ Define a type for alerts
type Alert = {
  id: string;
  alert_message: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
};

const DashboardContainer: React.FC = () => {
  const history = useHistory();
  const [, setUser] = useState<User | null>(null); // ✅ fixed typing
  const [studentCount, setStudentCount] = useState<number>(0);
  const [alerts, setAlerts] = useState<Alert[]>([]); // ✅ fixed typing
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        setUser(authData.user);

        // ✅ Get total students registered by this parent
        const { count, error: studentError } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("parent_id", authData.user.id);

        if (!studentError && count !== null) {
          setStudentCount(count);
        }

        // ✅ Fetch latest 3 alerts
        const { data: alertsData } = await supabase
          .from("alerts")
          .select("*")
          .eq("parent_id", authData.user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (alertsData) setAlerts(alertsData as Alert[]);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // ✅ Get latest alert’s coordinates (if available)
  const latestAlert = alerts.length > 0 ? alerts[0] : null;
  const lat = latestAlert?.latitude;
  const lng = latestAlert?.longitude;

  // ✅ Function to redirect with lat/lng
  const goToMap = () => {
    if (lat && lng) {
      history.push(`/EmergTrack/app/home/maps?lat=${lat}&lng=${lng}`);
    } else {
      history.push("/EmergTrack/app/home/maps");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <IonSpinner />
        ) : (
          <IonGrid>
            <IonRow>
              {/* Total Students Card */}
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Total Students Registered</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h1>{studentCount}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Total Devices Card */}
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Total Devices Registered</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h1>{studentCount}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow>
              {/* Maps Preview Card */}
              <IonCol size="12" sizeMd="6">
                <IonCard onClick={goToMap} button>
                  <IonCardHeader>
                    <IonCardTitle>Location Preview</IonCardTitle>
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
                            📍 Latest Alert Location <br />
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
                        <IonText color="medium">[ No Location Yet ]</IonText>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Alerts Preview Card */}
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Recent Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {alerts.length === 0 ? (
                      <IonText>No alerts yet</IonText>
                    ) : (
                      alerts.map((a) => (
                        <p key={a.id}>
                          📍 {a.alert_message} <br />
                          <small>
                            {new Date(a.created_at).toLocaleString()}
                          </small>
                        </p>
                      ))
                    )}
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

export default DashboardContainer;
