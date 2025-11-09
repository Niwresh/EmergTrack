import { useEffect, useState } from "react";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { supabase } from "../../utils/supabaseClients";

type Alert = {
  id: number;
  message: string;
  created_at: string;
};

const AdminHome: React.FC = () => {
  const [stats, setStats] = useState({
    parents: 0,
    police: 0,
    students: 0,
    alerts: 0,
    forwardedAlerts: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ Count Parents
      const { count: parents } = await supabase
        .from("parents")
        .select("*", { count: "exact" });

      // ✅ Count Students
      const { count: students } = await supabase
        .from("students")
        .select("*", { count: "exact" });

      // ✅ Count Police
      const { count: police } = await supabase
        .from("police")
        .select("*", { count: "exact" });

      // ✅ Count Total Alerts
      const { count: alertsCount } = await supabase
        .from("emergency_alerts")
        .select("*", { count: "exact" });

      // ✅ Count Forwarded Alerts (where forwarded_at is not null)
      const { count: forwardedAlerts } = await supabase
        .from("forwarded_alerts")
        .select("*", { count: "exact" })
        .not("forwarded_at", "is", null);

      // ✅ Fetch Latest 3 Alerts
      const { data: alertsData } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      // ✅ Update State
      setStats({
        parents: parents || 0,
        students: students || 0,
        police: police || 0,
        alerts: alertsCount || 0,
        forwardedAlerts: forwardedAlerts || 0,
      });

      if (alertsData) setAlerts(alertsData as Alert[]);
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();

    // ✅ Realtime subscriptions
    const parentSub = supabase
      .channel("realtime-parent")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parent" },
        fetchDashboardData
      )
      .subscribe();

    const studentSub = supabase
      .channel("realtime-students")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        fetchDashboardData
      )
      .subscribe();

    const policeSub = supabase
      .channel("realtime-police")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "police" },
        fetchDashboardData
      )
      .subscribe();

    const alertsSub = supabase
      .channel("realtime-alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        fetchDashboardData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(parentSub);
      supabase.removeChannel(studentSub);
      supabase.removeChannel(policeSub);
      supabase.removeChannel(alertsSub);
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Admin Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <IonSpinner />
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              {/* Parents */}
              <IonCol size="12" sizeMd="4">
                <IonCard color="primary">
                  <IonCardHeader>
                    <IonCardTitle>Total Parents</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ textAlign: "center" }}>
                    <h1>{stats.parents}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Police */}
              <IonCol size="12" sizeMd="4">
                <IonCard color="tertiary">
                  <IonCardHeader>
                    <IonCardTitle>Total Police</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ textAlign: "center" }}>
                    <h1>{stats.police}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Students */}
              <IonCol size="12" sizeMd="4">
                <IonCard color="success">
                  <IonCardHeader>
                    <IonCardTitle>Total Students</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ textAlign: "center" }}>
                    <h1>{stats.students}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow>
              {/* Emergency Alerts */}
              <IonCol size="12" sizeMd="6">
                <IonCard color="warning">
                  <IonCardHeader>
                    <IonCardTitle>Emergency Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ textAlign: "center" }}>
                    <h1>{stats.alerts}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Forwarded Alerts */}
              <IonCol size="12" sizeMd="6">
                <IonCard color="danger">
                  <IonCardHeader>
                    <IonCardTitle>Forwarded Alerts</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ textAlign: "center" }}>
                    <h1>{stats.forwardedAlerts}</h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            {/* Latest Alerts */}
            <IonRow>
              <IonCol size="12">
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
                          ⚠️ {a.message}
                          <br />
                          <small>{new Date(a.created_at).toLocaleString()}</small>
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

export default AdminHome;
