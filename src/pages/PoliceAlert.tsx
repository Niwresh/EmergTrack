import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonSpinner,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClients";

interface PoliceAlert {
  emergency_id: string; // bigint
  student_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  parent_id: string;
  status: boolean;
  received?: boolean;
}

const PolicePage: React.FC = () => {
  const [alerts, setAlerts] = useState<PoliceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "received" | "pending">("all");

  const fetchPoliceAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("emergency_alerts")
        .select("*")
        .eq("status", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching police alerts:", error);
        setAlerts([]);
      } else {
        setAlerts(data as PoliceAlert[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setAlerts([]);
    } finally {
      setLoading(false);
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
          setAlerts((prev) => {
            const index = prev.findIndex((a) => a.emergency_id === newAlert.emergency_id);
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
        setAlerts((prev) =>
          prev.map((a) =>
            a.emergency_id === policeAlert.emergency_id ? { ...a, received: true } : a
          )
        );
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // Filter alerts based on the selected option
  const filteredAlerts = alerts.filter((a) => {
    if (filter === "received") return a.received === true;
    if (filter === "pending") return !a.received;
    return true; // "all"
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Police Alerts</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
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

            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
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

                {filteredAlerts.map((policeAlert) => (
                  <IonRow
                    key={policeAlert.emergency_id}
                    className="ion-text-center ion-padding"
                    style={{ borderBottom: "1px solid #ddd" }}
                  >
                    <IonCol>{policeAlert.emergency_id}</IonCol>
                    <IonCol>{policeAlert.student_id}</IonCol>
                    <IonCol>{policeAlert.latitude}</IonCol>
                    <IonCol>{policeAlert.longitude}</IonCol>
                    <IonCol>{new Date(policeAlert.created_at).toLocaleString()}</IonCol>
                    <IonCol>{policeAlert.parent_id}</IonCol>
                    <IonCol>
                      <IonButton
                        color={policeAlert.received ? "success" : "primary"}
                        disabled={policeAlert.received}
                        onClick={() => handleReceived(policeAlert)}
                      >
                        {policeAlert.received ? "Received ✅" : "Mark Received"}
                      </IonButton>
                    </IonCol>
                  </IonRow>
                ))}
              </IonGrid>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default PolicePage;
