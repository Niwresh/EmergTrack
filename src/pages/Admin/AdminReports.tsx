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

  // Toggle state for collapsible tables
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
      headers.join(","), // header row
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
  // Print a table
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
        <IonContent className="ion-padding">
          <IonSpinner />
          <p>Loading data...</p>
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
          <IonTitle>Admin Reports</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          {/* Parents Table */}
          <IonRow>
            <IonCol>
              <h2>
                <button onClick={() => setShowParents(!showParents)}>
                  {showParents ? "▼" : "▶"} Parents
                </button>
              </h2>
              {showParents && (
                <>
                  <IonButton onClick={() => exportCSV(parents, "parents")}>Export CSV</IonButton>
                  <IonButton onClick={() => printTable("parentsTable")}>Print</IonButton>
                  <table id="parentsTable" border={1} style={{ width: "100%", marginTop: "10px" }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parents.map(p => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.full_name}</td>
                          <td>{p.username}</td>
                          <td>{p.email}</td>
                          <td>{new Date(p.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </IonCol>
          </IonRow>

          {/* Students Table */}
          <IonRow>
            <IonCol>
              <h2>
                <button onClick={() => setShowStudents(!showStudents)}>
                  {showStudents ? "▼" : "▶"} Students
                </button>
              </h2>
              {showStudents && (
                <>
                  <IonButton onClick={() => exportCSV(students, "students")}>Export CSV</IonButton>
                  <IonButton onClick={() => printTable("studentsTable")}>Print</IonButton>
                  <table id="studentsTable" border={1} style={{ width: "100%", marginTop: "10px" }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Parent ID</th>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id}>
                          <td>{s.id}</td>
                          <td>{s.parent_id}</td>
                          <td>{s.student_name}</td>
                          <td>{s.student_id}</td>
                          <td>{new Date(s.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </IonCol>
          </IonRow>

          {/* Police Table */}
          <IonRow>
            <IonCol>
              <h2>
                <button onClick={() => setShowPolice(!showPolice)}>
                  {showPolice ? "▼" : "▶"} Police
                </button>
              </h2>
              {showPolice && (
                <>
                  <IonButton onClick={() => exportCSV(police, "police")}>Export CSV</IonButton>
                  <IonButton onClick={() => printTable("policeTable")}>Print</IonButton>
                  <table id="policeTable" border={1} style={{ width: "100%", marginTop: "10px" }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {police.map(p => (
                        <tr key={p.police_id}>
                          <td>{p.police_id}</td>
                          <td>{p.police_username}</td>
                          <td>{p.police_firstname}</td>
                          <td>{p.police_lastname}</td>
                          <td>{p.police_email}</td>
                          <td>{new Date(p.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </IonCol>
          </IonRow>

          {/* Alerts Table */}
          <IonRow>
            <IonCol>
              <h2>
                <button onClick={() => setShowAlerts(!showAlerts)}>
                  {showAlerts ? "▼" : "▶"} Emergency Alerts
                </button>
              </h2>
              {showAlerts && (
                <>
                  <IonButton onClick={() => exportCSV(alerts, "alerts")}>Export CSV</IonButton>
                  <IonButton onClick={() => printTable("alertsTable")}>Print</IonButton>
                  <table id="alertsTable" border={1} style={{ width: "100%", marginTop: "10px" }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Parent ID</th>
                        <th>Student ID</th>
                        <th>Message</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Created At</th>
                        <th>Forwarded At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map(a => (
                        <tr key={a.id}>
                          <td>{a.id}</td>
                          <td>{a.parent_id}</td>
                          <td>{a.student_id}</td>
                          <td>{a.message}</td>
                          <td>{a.latitude ?? "-"}</td>
                          <td>{a.longitude ?? "-"}</td>
                          <td>{new Date(a.created_at).toLocaleString()}</td>
                          <td>{a.forwarded_at ? new Date(a.forwarded_at).toLocaleString() : "-"}</td>
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

export default AdminReports;
