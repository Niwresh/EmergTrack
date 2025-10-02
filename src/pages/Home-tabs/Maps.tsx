import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonToggle,
  IonLabel,
  IonSpinner,
  useIonViewDidEnter,
} from "@ionic/react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabaseClients";
import { LatLngExpression, Map as LeafletMap } from "leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../Assets/Maps.css";

// Marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Default marker setup
const DefaultIcon = L.Icon.Default.extend({
  options: {
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  },
});
L.Marker.prototype.options.icon = new DefaultIcon();

// Convert DMS to decimal
function dmsToDecimal(dms: string): number | null {
  try {
    const regex = /(\d+)[°:\s]+(\d+)?[':\s]*(\d+(?:\.\d+)?)?["]?\s*([NSEW])?/i;
    const match = dms.trim().match(regex);
    if (!match) return null;
    const degrees = parseFloat(match[1]);
    const minutes = parseFloat(match[2] || "0");
    const seconds = parseFloat(match[3] || "0");
    const direction = match[4]?.toUpperCase();
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") decimal *= -1;
    return decimal;
  } catch {
    return null;
  }
}

// Convert decimal to DMS
function decimalToDMS(decimal: number, isLat: boolean): string {
  const dir = isLat ? (decimal >= 0 ? "N" : "S") : decimal >= 0 ? "E" : "W";
  const absVal = Math.abs(decimal);
  const deg = Math.floor(absVal);
  const minFloat = (absVal - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(2);
  return `${deg}°${min}'${sec}"${dir}`;
}

// Map resizer
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

// Map controller
const MapController: React.FC<{ coords: LatLngExpression }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 17, { animate: true });
    setTimeout(() => map.invalidateSize(), 300);
  }, [coords, map]);
  return null;
};

// Main Maps component
const Maps: React.FC = () => {
  const location = useLocation();
  const [coords, setCoords] = useState<LatLngExpression>([14.5995, 120.9842]);
  const [manualLat, setManualLat] = useState<string>("");
  const [manualLng, setManualLng] = useState<string>("");
  const [satelliteView, setSatelliteView] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const popupRef = useRef<L.Popup | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  // Fetch latest alert and subscribe
  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(location.search);
    const latParam = parseFloat(params.get("lat") || "0");
    const lngParam = parseFloat(params.get("lng") || "0");

    if (!isNaN(latParam) && !isNaN(lngParam) && (latParam !== 0 || lngParam !== 0)) {
      if (mounted) setCoords([latParam, lngParam]);
      setLoading(false);
      return;
    }

    const fetchLatestAlert = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("emergency_alerts")
        .select("latitude, longitude")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data && mounted) {
        setCoords([data.latitude, data.longitude]);
      }
      setLoading(false);
    };

    fetchLatestAlert();

    const channel = supabase
      .channel("realtime-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "emergency_alerts" },
        (payload) => {
          const newAlert = payload.new as { latitude: number; longitude: number };
          if (mounted && newAlert) {
            setCoords([newAlert.latitude, newAlert.longitude]);
            setLoading(false);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [location.search]);

  // Manual locate
  const handleManualLocate = () => {
    let lat: number | null = parseFloat(manualLat);
    let lng: number | null = parseFloat(manualLng);

    if (isNaN(lat)) lat = dmsToDecimal(manualLat);
    if (isNaN(lng)) lng = dmsToDecimal(manualLng);

    if (lat !== null && lng !== null && mapRef.current) {
      setLoading(true);
      setCoords([lat, lng]);
      setTimeout(() => {
        popupRef.current?.openOn(mapRef.current!);
        setLoading(false);
      }, 800);
    } else {
      alert("Please enter valid coordinates (Decimal or DMS format).");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Maps</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* Manual Input */}
        <div style={{ padding: "10px", background: "#fff", zIndex: 1000 }}>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonItem>
                  <IonInput
                    type="text"
                    placeholder="Latitude (e.g. 8°22'8N or 8.3689)"
                    value={manualLat}
                    onIonChange={(e) => setManualLat(e.detail.value!)}
                  />
                </IonItem>
              </IonCol>
              <IonCol>
                <IonItem>
                  <IonInput
                    type="text"
                    placeholder="Longitude (e.g. 124°51'45E or 124.8625)"
                    value={manualLng}
                    onIonChange={(e) => setManualLng(e.detail.value!)}
                  />
                </IonItem>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12" className="ion-text-center" style={{ marginTop: "10px" }}>
                <IonButton expand="block" onClick={handleManualLocate}>
                  Locate Coordinates
                </IonButton>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12" className="ion-text-center" style={{ marginTop: "10px" }}>
                <IonItem lines="none">
                  <IonLabel>Satellite View</IonLabel>
                  <IonToggle
                    checked={satelliteView}
                    onIonChange={(e) => setSatelliteView(e.detail.checked)}
                  />
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Spinner */}
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2000,
              background: "rgba(255,255,255,0.8)",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <IonSpinner name="crescent" />
          </div>
        )}

        {/* Map */}
        <div className="map-container">
          <MapContainer
            center={coords}
            zoom={15}
            className="map"
            ref={(map) => {
              if (map) mapRef.current = map;
            }}
          >
            {satelliteView ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Source: Esri, Earthstar Geographics, Esri, HERE, Garmin, FAO, NOAA, USGS"
              />
            ) : (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              />
            )}

            <Marker position={coords}>
              <Popup ref={popupRef}>
                🚨 Location Selected <br />
                Decimal: Lat {(coords as [number, number])[0].toFixed(6)}, Lng{" "}
                {(coords as [number, number])[1].toFixed(6)} <br />
                DMS: {decimalToDMS((coords as [number, number])[0], true)},{" "}
                {decimalToDMS((coords as [number, number])[1], false)}
              </Popup>
            </Marker>

            <MapResizer />
            <MapController coords={coords} />
          </MapContainer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Maps;
