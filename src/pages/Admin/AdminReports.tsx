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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from "@ionic/react";
import { chevronDown, chevronForward, print, download } from "ionicons/icons";
import { supabase } from "../../utils/supabaseClients";

// ----------------------
// Types
// ----------------------
type Parent = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  created_at: string;
};

type Student = {
  id: string;
  parent_id: string;
  student_name: string;
  student_id: string;
  created_at: string;
};

type Police = {
  police_id: number;
  police_username: string;
  police_firstname: string;
  police_lastname: string;
  police_email: string;
  created_at: string;
};

type Alert = {
  id: number;
  parent_id: number;
  student_id: string;
  message: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  forwarded_at?: string;
};

const AdminReports: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [police, setPolice] = useState<Police[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const [showParents, setShowParents] = useState(true);
  const [showStudents, setShowStudents] = useState(true);
  const [showPolice, setShowPolice] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  // ----------------------
  // Fetch data from Supabase
  // ----------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: parentsData } = await supabase.from("parents").select("*");
        if (parentsData) setParents(parentsData as Parent[]);

        const { data: studentsData } = await supabase.from("students").select("*");
        if (studentsData) setStudents(studentsData as Student[]);

        const { data: policeData } = await supabase.from("police").select("*");
        if (policeData) setPolice(policeData as Police[]);

        const { data: alertsData } = await supabase.from("emergency_alerts").select("*");
        if (alertsData) setAlerts(alertsData as Alert[]);
      } catch (error) {
        console.error("Error fetching reports data:", error);
      }
      setLoading(false);
    };
    fetchData();
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
        headers.map(field => JSON.stringify((row as any)[field] ?? "")).join(",")
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
            <IonTitle>Admin Reports</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ textAlign: "center" }}>
          <IonSpinner name="crescent" />
          <p>Loading reports...</p>
        </IonContent>
      </IonPage>
    );
  }

  // ----------------------
  // Card Table Component
  // ----------------------
  const ReportCard = <T extends object>({
    title,
    data,
    show,
    setShow,
    tableId,
  }: {
    title: string;
    data: T[];
    show: boolean;
    setShow: (show: boolean) => void;
    tableId: string;
  }) => (
    <IonCard style={{ marginBottom: "20px" }}>
      <IonCardHeader
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f0f4f8",
          cursor: "pointer",
        }}
        onClick={() => setShow(!show)}
      >
        <IonCardTitle>
          <IonIcon icon={show ? chevronDown : chevronForward} /> {title}
        </IonCardTitle>
        <div>
          <IonButton
            fill="outline"
            size="small"
            onClick={e => {
              e.stopPropagation();
              exportCSV(data, title.toLowerCase().replace(" ", "_"));
            }}
          >
            <IonIcon slot="start" icon={download} />
            CSV
          </IonButton>
          <IonButton
            fill="outline"
            size="small"
            onClick={e => {
              e.stopPropagation();
              printTable(tableId);
            }}
          >
            <IonIcon slot="start" icon={print} />
            Print
          </IonButton>
        </div>
      </IonCardHeader>
      {show && (
        <IonCardContent>
          <div style={{ overflowX: "auto" }}>
            <table
              id={tableId}
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead style={{ backgroundColor: "#e2e8f0" }}>
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th
                      key={key}
                      style={{
                        border: "1px solid #cbd5e1",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {key.replace(/_/g, " ").toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {Object.keys(row).map((field, i) => (
                      <td key={i} style={{ padding: "8px" }}>
                        {row[field] instanceof Date
                          ? new Date(row[field]).toLocaleString()
                          : row[field] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </IonCardContent>
      )}
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Admin Reports</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol>
              <ReportCard
                title="Parents"
                data={parents}
                show={showParents}
                setShow={setShowParents}
                tableId="parentsTable"
              />
              <ReportCard
                title="Students"
                data={students}
                show={showStudents}
                setShow={setShowStudents}
                tableId="studentsTable"
              />
              <ReportCard
                title="Police"
                data={police}
                show={showPolice}
                setShow={setShowPolice}
                tableId="policeTable"
              />
              <ReportCard
                title="Emergency Alerts"
                data={alerts}
                show={showAlerts}
                setShow={setShowAlerts}
                tableId="alertsTable"
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default AdminReports;
