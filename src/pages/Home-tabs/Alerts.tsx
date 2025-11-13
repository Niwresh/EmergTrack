import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonButton,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClients";

interface EmergencyAlert {
  emergency_id: string; // bigint handled as string
  student_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  parent_id: string;
  status?: boolean;
  received?: boolean; // added received
  student_name?: string;
  message?: string;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState<string | null>(null);

  const getCurrentParentId = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error("No logged-in parent found");
      return null;
    }
    return user.id;
  };

  const fetchAlerts = async (parent_id: string) => {
    setLoading(true);

    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("student_id, student_name, parent_id")
      .eq("parent_id", parent_id);

    if (studentsError || !studentsData) {
      console.error("Error fetching students:", studentsError);
      setAlerts([]);
      setLoading(false);
      return;
    }

    const studentIds = studentsData.map((s) => s.student_id);
    if (studentIds.length === 0) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    const { data: alertsData, error: alertsError } = await supabase
      .from("emergency_alerts")
      .select("*")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false });

    if (alertsError || !alertsData) {
      console.error("Error fetching alerts:", alertsError);
      setAlerts([]);
      setLoading(false);
      return;
    }

    const alertsWithNames = alertsData.map((a) => {
      const student = studentsData.find((s) => s.student_id === a.student_id);
      return {
        ...a,
        emergency_id: a.emergency_id.toString(),
        student_name: student?.student_name || "Unknown Student",
        status: a.status || false,
        received: a.received || false, // map received column
      };
    });

    setAlerts(alertsWithNames);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const pid = await getCurrentParentId();
      if (!pid) return;
      setParentId(pid);
      await fetchAlerts(pid);
    };
    init();
  }, []);

  const report = async (alert: EmergencyAlert) => {
    if (!alert.emergency_id) return;

    const emergencyIdNum = Number(alert.emergency_id);
    if (isNaN(emergencyIdNum)) return;

    const { error } = await supabase
      .from("emergency_alerts")
      .update({ status: true })
      .eq("emergency_id", emergencyIdNum);

    if (error) {
      console.error("Failed to report alert:", error);
      return;
    }

    setAlerts((prev) =>
      prev.map((a) =>
        a.emergency_id === alert.emergency_id ? { ...a, status: true } : a
      )
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Alerts</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            <IonSpinner name="crescent" />
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "20vh", fontSize: "1.2rem", color: "gray" }}>
            👨‍👩‍👧 No alerts for your child yet.
          </div>
        ) : (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Your Child’s Emergency Alerts</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow style={{ fontWeight: "bold", background: "#f1f1f1" }}>
                  <IonCol size="2">Student Name</IonCol>
                  <IonCol size="3">Message</IonCol>
                  <IonCol size="2">Location</IonCol>
                  <IonCol size="2">Date</IonCol>
                  <IonCol size="1">Status</IonCol>
                  <IonCol size="2">Received</IonCol>
                </IonRow>

                {alerts.map((alert) => (
                  <IonRow key={alert.emergency_id} style={{ borderBottom: "1px solid #ddd" }}>
                    <IonCol size="2">👤 {alert.student_name}</IonCol>
                    <IonCol size="3">{alert.message || "Emergency alert triggered!"}</IonCol>
                    <IonCol size="2">📍 {alert.latitude}, {alert.longitude}</IonCol>
                    <IonCol size="2">{new Date(alert.created_at).toLocaleString()}</IonCol>
                    <IonCol size="1">
                      {alert.status ? (
                        <IonBadge color="success">Reported</IonBadge>
                      ) : (
                        <IonButton color="primary" size="small" onClick={() => report(alert)}>
                          Report
                        </IonButton>
                      )}
                    </IonCol>
                    <IonCol size="2">
                      {alert.received ? <IonBadge color="tertiary">Received</IonBadge> : "Pending"}
                    </IonCol>
                  </IonRow>
                ))}
              </IonGrid>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Alerts;
