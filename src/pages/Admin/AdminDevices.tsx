import { useEffect, useState } from "react";
import {
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
} from "@ionic/react";
import { supabase } from "../../utils/supabaseClients";

// ----------------------
// Type for device info
// ----------------------
type Device = {
  id: string;
  student_name: string;
  student_id: string;
  device_type: string;
  nodemcu_serial: string;
};

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);

  // ----------------------
  // Fetch devices from students table
  // ----------------------
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("students")
          .select("id, student_name, student_id, device_type, nodemcu_serial");

        if (error) throw error;
        if (data) setDevices(data as Device[]);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }

      setLoading(false);
    };

    fetchDevices();
  }, []);

  // ----------------------
  // Export CSV
  // ----------------------
  const exportCSV = <T extends object>(data: T[], filename: string) => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row =>
        headers.map(field => JSON.stringify((row as never)[field] ?? "")).join(",")
      ),
    ];
    const csvString = csvRows.join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ----------------------
  // Print Table
  // ----------------------
  const printTable = (tableId: string) => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const newWin = window.open("", "_blank");
    newWin?.document.write(
      `<html><head><title>Print</title></head><body>${table.outerHTML}</body></html>`
    );
    newWin?.document.close();
    newWin?.print();
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Devices</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonSpinner />
          <p>Loading devices...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Devices</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol>
              <h2>
                <button onClick={() => setShowTable(!showTable)}>
                  {showTable ? "▼" : "▶"} Devices
                </button>
              </h2>
              {showTable && (
                <>
                  <IonButton onClick={() => exportCSV(devices, "devices")}>
                    Export CSV
                  </IonButton>
                  <IonButton onClick={() => printTable("devicesTable")}>
                    Print
                  </IonButton>
                  <table
                    id="devicesTable"
                    border={1}
                    style={{ width: "100%", marginTop: "10px" }}
                  >
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Device Type</th>
                        <th>NodeMCU Serial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.map((d) => (
                        <tr key={d.id}>
                          <td>{d.student_id}</td>
                          <td>{d.student_name}</td>
                          <td>{d.device_type}</td>
                          <td>{d.nodemcu_serial}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Devices;
