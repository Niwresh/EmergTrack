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
  IonSelect,
  IonSelectOption,
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

// ✅ Interfaces
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

interface PoliceAlert {
  emergency_id: string;
  student_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  parent_id: string;
  status: boolean;
  received?: boolean;
}

const Dashboard: React.FC = () => {
  const history = useHistory();

  // ✅ Dashboard States
  const [alerts, setAlerts] = useState<ForwardedAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [readCount, setReadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // ✅ Police Alerts Table States
  const [policeAlerts, setPoliceAlerts] = useState<PoliceAlert[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "received" | "pending">("all");

  // ✅ Fetch dashboard stats and forwarded alerts
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
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
        setAlerts(data.slice(0, 3));
        setUnreadCount(data.filter((a) => !a.is_read).length);
        setReadCount(data.filter((a) => a.is_read).length);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // ✅ Fetch emergency alerts for table
  const fetchPoliceAlerts = async () => {
    setTableLoading(true);
    try {
      const { data, error } = await supabase
        .from("emergency_alerts")
        .select("*")
        .eq("status", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching police alerts:", error);
        setPoliceAlerts([]);
      } else {
        setPoliceAlerts(data as PoliceAlert[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setPoliceAlerts([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchPoliceAlerts();

    const channel = supabase
      .channel("police-alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "emergency_alerts",
          filter: "status=eq.true",
        },
        (payload) => {
          const newAlert = payload.new as PoliceAlert;
          setPoliceAlerts((prev) => {
            const index = prev.findIndex(
              (a) => a.emergency_id === newAlert.emergency_id
            );
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = newAlert;
              return updated;
            }
            return [newAlert, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Mark as Received
  const handleReceived = async (policeAlert: PoliceAlert) => {
    try {
      const { error } = await supabase
        .from("emergency_alerts")
        .update({ received: true })
        .eq("emergency_id", policeAlert.emergency_id);

      if (error) {
        console.error("Error updating received:", error);
      } else {
        alert("Marked as received");
        setPoliceAlerts((prev) =>
          prev.map((a) =>
            a.emergency_id === policeAlert.emergency_id
              ? { ...a, received: true }
              : a
          )
        );
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // ✅ Filter for alerts table
  const filteredAlerts = policeAlerts.filter((a) => {
    if (filter === "received") return a.received === true;
    if (filter === "pending") return !a.received;
    return true;
  });

  // ✅ Latest alert coordinates
  const latestAlert = alerts.length > 0 ? alerts[0] : null;
  const lat = latestAlert?.latitude;
  const lng = latestAlert?.longitude;

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
        {/* Dashboard Summary */}
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20%" }}>
            <IonSpinner />
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
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

            {/* Map and Recent Alerts */}
            <IonRow>
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

            {/* ✅ Emergency Alerts Table Section */}
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Forwarded Emergency Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {/* Filter dropdown */}
                    <IonSelect
                      value={filter}
                      placeholder="Filter alerts"
                      onIonChange={(e) => setFilter(e.detail.value)}
                    >
                      <IonSelectOption value="all">All</IonSelectOption>
                      <IonSelectOption value="pending">Pending</IonSelectOption>
                      <IonSelectOption value="received">Received</IonSelectOption>
                    </IonSelect>

                    {tableLoading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "40vh",
                        }}
                      >
                        <IonSpinner name="crescent" />
                      </div>
                    ) : filteredAlerts.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "20px",
                          fontSize: "1.1rem",
                          color: "gray",
                        }}
                      >
                        🚨 No alerts found.
                      </div>
                    ) : (
                      <IonGrid>
                        <IonRow
                          style={{ fontWeight: "bold", background: "#f1f1f1" }}
                          className="ion-text-center ion-padding"
                        >
                          <IonCol>Emergency ID</IonCol>
                          <IonCol>Student ID</IonCol>
                          <IonCol>Latitude</IonCol>
                          <IonCol>Longitude</IonCol>
                          <IonCol>Date</IonCol>
                          <IonCol>Parent ID</IonCol>
                          <IonCol>Action</IonCol>
                        </IonRow>

                        {filteredAlerts.map((a) => (
                          <IonRow
                            key={a.emergency_id}
                            className="ion-text-center ion-padding"
                            style={{ borderBottom: "1px solid #ddd" }}
                          >
                            <IonCol>{a.emergency_id}</IonCol>
                            <IonCol>{a.student_id}</IonCol>
                            <IonCol>{a.latitude}</IonCol>
                            <IonCol>{a.longitude}</IonCol>
                            <IonCol>
                              {new Date(a.created_at).toLocaleString()}
                            </IonCol>
                            <IonCol>{a.parent_id}</IonCol>
                            <IonCol>
                              <IonButton
                                color={a.received ? "success" : "primary"}
                                disabled={a.received}
                                onClick={() => handleReceived(a)}
                              >
                                {a.received ? "Received ✅" : "Mark Received"}
                              </IonButton>
                            </IonCol>
                          </IonRow>
                        ))}
                      </IonGrid>
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

export default Dashboard;
