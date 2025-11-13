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
import { useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabaseClients";
import { LatLngExpression } from "leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import marker images from leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// ✅ Fix for Leaflet marker icons (strict TypeScript-safe)
interface LeafletIconDefaultPrototype {
  _getIconUrl?: () => string;
}

delete (L.Icon.Default.prototype as LeafletIconDefaultPrototype)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ Component to fix map rendering in Ionic views
const MapResizer: React.FC = () => {
  const map = useMap();

  useIonViewDidEnter(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  });

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
};

const PoliceMaps: React.FC = () => {
  const location = useLocation();
  const [coords, setCoords] = useState<LatLngExpression>([14.5995, 120.9842]); // Default Manila

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(location.search);
    const latParam = parseFloat(params.get("lat") || "0");
    const lngParam = parseFloat(params.get("lng") || "0");

    // ✅ Use query params if provided
    if (latParam && lngParam) {
      if (mounted) setCoords([latParam, lngParam]);
      return;
    }

    // ✅ Otherwise, fetch latest alert and subscribe to realtime updates
    const fetchLatestAlert = async () => {
      const { data, error } = await supabase
        .from("emergency_alerts")
        .select("latitude, longitude")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data && mounted) {
        setCoords([data.latitude, data.longitude]);
      }
    };

    fetchLatestAlert();

    const channel = supabase
      .channel("realtime-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "emergency_alerts" },
        (payload) => {
          const newAlert = payload.new as { latitude: number; longitude: number };
          if (mounted && newAlert) setCoords([newAlert.latitude, newAlert.longitude]);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [location.search]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Maps</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-no-padding">
        <div style={{ height: "100vh", width: "100%" }}>
          <MapContainer center={coords} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            <Marker position={coords}>
              <Popup>
                🚨 <strong>Emergency Alert</strong> <br />
                Lat: {(coords as [number, number])[0].toFixed(5)} <br />
                Lng: {(coords as [number, number])[1].toFixed(5)}
              </Popup>
            </Marker>
            <MapResizer />
          </MapContainer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PoliceMaps;
