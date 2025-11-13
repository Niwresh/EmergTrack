import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useIonViewDidEnter } from "@ionic/react";
import { supabase } from "../../utils/supabaseClients";
import { LatLngExpression } from "leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

interface LeafletIconDefaultPrototype {
  _getIconUrl?: () => string;
}

delete (L.Icon.Default.prototype as LeafletIconDefaultPrototype)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Map resizer to fix rendering inside Ionic
const MapResizer: React.FC = () => {
  const map = useMap();

  useIonViewDidEnter(() => {
    setTimeout(() => map.invalidateSize(), 200);
  });

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
};

interface EmergencyAlert {
  emergency_id: string;
  latitude: number;
  longitude: number;
}

const PoliceMaps: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fetch all received alerts
    const fetchReceivedAlerts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("emergency_alerts")
        .select("emergency_id, latitude, longitude")
        .eq("received", true)
        .order("created_at", { ascending: false });

      if (!error && data && mounted) {
        setAlerts(data);
      } else if (error) {
        console.error("Error fetching received alerts:", error);
      }
      setLoading(false);
    };

    fetchReceivedAlerts();

    // Subscribe to updates: when received becomes true
    const channel = supabase
      .channel("received-alerts")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "emergency_alerts",
          filter: "received=eq.true",
        },
        (payload) => {
          const updated = payload.new as EmergencyAlert;
          if (mounted) {
            setAlerts((prev) => {
              // avoid duplicates
              const exists = prev.find((a) => a.emergency_id === updated.emergency_id);
              if (exists) {
                return prev.map((a) =>
                  a.emergency_id === updated.emergency_id ? updated : a
                );
              }
              return [updated, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Set initial center as the first alert, or default
  const center: LatLngExpression = alerts.length
    ? [alerts[0].latitude, alerts[0].longitude]
    : [14.5995, 120.9842]; // Manila default

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Police Map - Received Alerts</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-no-padding">
        <div style={{ height: "100vh", width: "100%" }}>
          <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />

            {/* Render all received alerts as markers */}
            {alerts.map((alert) => (
              <Marker
                key={alert.emergency_id}
                position={[alert.latitude, alert.longitude]}
              >
                <Popup>
                  🚨 <strong>Received Emergency Alert</strong> <br />
                  Lat: {alert.latitude.toFixed(5)} <br />
                  Lng: {alert.longitude.toFixed(5)}
                </Popup>
              </Marker>
            ))}

            <MapResizer />
          </MapContainer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PoliceMaps;
