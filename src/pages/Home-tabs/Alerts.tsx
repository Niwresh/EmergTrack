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
  IonModal,
  IonButton
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClients';

interface EmergencyAlert {
  id: number;
  student_id: string;
  latitude: number;
  longitude: number;
  message: string;
  created_at: string;
  is_read?: boolean;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch alerts from supabase
  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('emergency_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const alertsWithRead = data.map(a => ({ ...a, is_read: false }));
      setAlerts(alertsWithRead);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('emergency-alerts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_alerts' },
        (payload) => {
          const newAlert = { ...(payload.new as EmergencyAlert), is_read: false };
          setAlerts((prev) => [newAlert, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const markAsRead = (id: number) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, is_read: true } : a))
    );
  };

  // Handle open modal on row click
  const handleRowClick = (alert: EmergencyAlert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  // Forward to police (insert into forwarded_alerts table)
  const forwardToPolice = async (alertItem: EmergencyAlert) => {
    const { error } = await supabase.from('forwarded_alerts').insert([
      {
        alert_id: alertItem.id,
        student_id: alertItem.student_id,
        message: alertItem.message || 'Emergency alert triggered!',
        latitude: alertItem.latitude,
        longitude: alertItem.longitude,
        forwarded_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error("Error forwarding alert:", error);
      window.alert("❌ Failed to forward alert. See console for details.");
    } else {
      window.alert("✅ Alert forwarded to police successfully!");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            Alerts 
            {unreadCount > 0 && (
              <IonBadge color="danger" style={{ marginLeft: 8 }}>
                {unreadCount}
              </IonBadge>
            )}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Emergency Alerts</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              {/* Table Header */}
              <IonRow className="ion-text-center ion-padding" style={{ fontWeight: "bold", background: "#f1f1f1" }}>
                <IonCol size="2">Student ID</IonCol>
                <IonCol size="3">Message</IonCol>
                <IonCol size="3">Location</IonCol>
                <IonCol size="2">Date</IonCol>
                <IonCol size="2">Status</IonCol>
              </IonRow>

              {/* Table Rows */}
              {alerts.map((alert) => (
                <IonRow 
                  key={alert.id} 
                  className="ion-text-center ion-padding" 
                  style={{ borderBottom: "1px solid #ddd", cursor: "pointer" }}
                  onClick={() => handleRowClick(alert)}
                >
                  <IonCol size="2">🚨 {alert.student_id}</IonCol>
                  <IonCol size="3">{alert.message || 'Emergency alert triggered!'}</IonCol>
                  <IonCol size="3">📍 {alert.latitude}, {alert.longitude}</IonCol>
                  <IonCol size="2">{new Date(alert.created_at).toLocaleString()}</IonCol>
                  <IonCol size="2">
                    {alert.is_read 
                      ? <IonBadge color="success">Read</IonBadge> 
                      : <IonBadge color="warning">New</IonBadge>}
                  </IonCol>
                </IonRow>
              ))}
            </IonGrid>
          </IonCardContent>
        </IonCard>
      </IonContent>

      {/* Modal for details */}
      <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        {selectedAlert && (
          <IonPage>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Alert Details</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <h2>🚨 Student ID: {selectedAlert.student_id}</h2>
              <p><strong>Message:</strong> {selectedAlert.message || 'Emergency alert triggered!'}</p>
              <p><strong>Location:</strong> 📍 {selectedAlert.latitude}, {selectedAlert.longitude}</p>
              <p><strong>Date:</strong> {new Date(selectedAlert.created_at).toLocaleString()}</p>

              <IonButton 
                expand="block" 
                color="success" 
                onClick={() => {
                  markAsRead(selectedAlert!.id);
                  setIsModalOpen(false);
                }}
              >
                Mark as Read
              </IonButton>

              <IonButton 
                expand="block" 
                color="primary" 
                onClick={() => forwardToPolice(selectedAlert!)}
              >
                Forward to Police
              </IonButton>

              <IonButton 
                expand="block" 
                color="medium" 
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </IonButton>
            </IonContent>
          </IonPage>
        )}
      </IonModal>
    </IonPage>
  );
};

export default Alerts;
