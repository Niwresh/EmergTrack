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
  IonButton,
  IonText
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClients';

interface ForwardedAlert {
  id: number;
  alert_id: number;
  student_id: string;
  message: string;
  latitude: number;
  longitude: number;
  forwarded_at: string;
  parent_id?: string;      
  parent_name?: string;    
  parent_phone?: string;   
  parent_address?: string; 
  is_read?: boolean;
}

const PoliceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<ForwardedAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<ForwardedAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch forwarded alerts from Supabase
  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('forwarded_alerts')
      .select('*')
      .order('forwarded_at', { ascending: false });

    if (!error && data) {
      setAlerts(data as ForwardedAlert[]);
    } else {
      console.error("Error fetching forwarded alerts:", error);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('forwarded-alerts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forwarded_alerts' },
        (payload) => {
          const newAlert = payload.new as ForwardedAlert;
          setAlerts((prev) => [newAlert, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  // ✅ Update Supabase when marking as read
  const markAsRead = async (id: number) => {
    const { error } = await supabase
      .from('forwarded_alerts')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setAlerts(prev =>
        prev.map(a => (a.id === id ? { ...a, is_read: true } : a))
      );
    } else {
      console.error("Failed to update is_read:", error);
    }
  };

  // Handle open modal
  const handleRowClick = (alert: ForwardedAlert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            Police Alerts 
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
            <IonCardTitle>Forwarded Alerts</IonCardTitle>
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
                  <IonCol size="2">{new Date(alert.forwarded_at).toLocaleString()}</IonCol>
                  <IonCol size="2">
                    {alert.is_read 
                      ? <IonBadge color="success">Read</IonBadge> 
                      : <IonBadge color="warning">New</IonBadge>}
                  </IonCol>
                </IonRow>
              ))}

              {alerts.length === 0 && (
                <IonRow>
                  <IonCol className="ion-text-center">
                    <IonText color="medium">No forwarded alerts yet</IonText>
                  </IonCol>
                </IonRow>
              )}
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
              <p><strong>Forwarded At:</strong> {new Date(selectedAlert.forwarded_at).toLocaleString()}</p>

              {selectedAlert.parent_name && (
                <>
                  <p><strong>Parent Name:</strong> {selectedAlert.parent_name}</p>
                  <p><strong>Parent Phone:</strong> {selectedAlert.parent_phone}</p>
                  <p><strong>Parent Address:</strong> {selectedAlert.parent_address}</p>
                </>
              )}

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

export default PoliceAlerts;
