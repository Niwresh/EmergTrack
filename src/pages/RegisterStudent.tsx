import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonList,
  IonToast,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonMenuButton
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClients';

const RegisterStudent: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [serial, setSerial] = useState('');
  const [deviceType, setDeviceType] = useState(''); // 🔑 new field
  const [parentAddress, setParentAddress] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch registered students
  const fetchStudents = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setStudents(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetForm = () => {
    setStudentName('');
    setStudentId('');
    setSerial('');
    setDeviceType('');
    setParentAddress('');
    setParentPhone('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!studentName || !studentId || !serial || !deviceType || !parentAddress || !parentPhone) {
      setToastMessage("All fields are required");
      setShowToast(true);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setToastMessage("You must be logged in as a parent.");
      setShowToast(true);
      return;
    }

    if (editingId) {
      // 🔑 Check if serial belongs to another student
      const { data: existing, error: checkError } = await supabase
        .from('students')
        .select('id')
        .eq('nodemcu_serial', serial)
        .neq('id', editingId);

      if (checkError) {
        setToastMessage("Error checking serial: " + checkError.message);
        setShowToast(true);
        return;
      }

      if (existing && existing.length > 0) {
        setToastMessage("This NodeMCU serial is already registered to another student.");
        setShowToast(true);
        return;
      }

      // ✅ Update existing student
      const { error: updateError } = await supabase
        .from('students')
        .update({
          student_name: studentName,
          student_id: studentId,
          nodemcu_serial: serial,
          device_type: deviceType, // 🔑 new field
          parent_address: parentAddress,
          parent_phone: parentPhone
        })
        .eq('id', editingId)
        .eq('parent_id', user.id);

      if (updateError) {
        setToastMessage("Error updating: " + updateError.message);
      } else {
        setToastMessage("Student updated successfully!");
        resetForm();
        fetchStudents();
      }
    } else {
      // Insert new student (check duplicate serial)
      const { data: existing, error: insertCheckError } = await supabase
        .from('students')
        .select('id')
        .eq('nodemcu_serial', serial);

      if (insertCheckError) {
        setToastMessage("Error checking serial: " + insertCheckError.message);
        setShowToast(true);
        return;
      }

      if (existing && existing.length > 0) {
        setToastMessage("This NodeMCU serial is already registered.");
        setShowToast(true);
        return;
      }

      const { error: insertError } = await supabase.from('students').insert([{
        parent_id: user.id,
        student_name: studentName,
        student_id: studentId,
        nodemcu_serial: serial,
        device_type: deviceType, // 🔑 new field
        parent_address: parentAddress,
        parent_phone: parentPhone
      }]);

      if (insertError) {
        setToastMessage("Error registering: " + insertError.message);
      } else {
        setToastMessage("Student registered successfully!");
        resetForm();
        fetchStudents();
      }
    }

    setShowToast(true);
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setStudentName(s.student_name);
    setStudentId(s.student_id);
    setSerial(s.nodemcu_serial);
    setDeviceType(s.device_type || ''); // 🔑 load existing
    setParentAddress(s.parent_address);
    setParentPhone(s.parent_phone);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setToastMessage("You must be logged in as a parent.");
      setShowToast(true);
      return;
    }

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('parent_id', user.id);

    if (error) {
      setToastMessage("Error deleting: " + error.message);
    } else {
      setToastMessage("Student deleted successfully!");
      fetchStudents();
    }
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
             <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Students</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* List of registered students */}
        {loading ? (
          <IonSpinner className="ion-padding" />
        ) : students.length === 0 ? (
          <p className="ion-padding">No students registered yet.</p>
        ) : (
          <IonList>
            {students.map((s) => (
              <IonCard key={s.id}>
                <IonCardHeader>
                  <IonCardTitle>{s.student_name}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p><strong>ID:</strong> {s.student_id}</p>
                  <p><strong>NodeMCU Serial:</strong> {s.nodemcu_serial}</p>
                  <p><strong>Device Type:</strong> {s.device_type || '-'}</p>
                  <p><strong>Address:</strong> {s.parent_address}</p>
                  <p><strong>Phone:</strong> {s.parent_phone}</p>

                  <IonButtons>
                    <IonButton onClick={() => handleEdit(s)}>
                      <IonIcon icon={create} slot="start" />
                      Edit
                    </IonButton>
                    <IonButton color="danger" onClick={() => handleDelete(s.id)}>
                      <IonIcon icon={trash} slot="start" />
                      Delete
                    </IonButton>
                  </IonButtons>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}

        {/* Registration / Update Form */}
        {showForm && (
          <IonList className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Student Name</IonLabel>
              <IonInput 
                value={studentName} 
                onIonChange={e => setStudentName(e.detail.value!)} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Student ID</IonLabel>
              <IonInput 
                value={studentId} 
                onIonChange={e => setStudentId(e.detail.value!)} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">NodeMCU Serial Number</IonLabel>
              <IonInput 
                value={serial} 
                onIonChange={e => setSerial(e.detail.value!)} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Device Type</IonLabel>
              <IonSelect
                value={deviceType}
                placeholder="Select Device"
                onIonChange={e => setDeviceType(e.detail.value)}
              >
                <IonSelectOption value="ESP8266">ESP8266</IonSelectOption>
                <IonSelectOption value="ESP32">ESP32</IonSelectOption>
                <IonSelectOption value="Arduino Uno">Arduino Uno</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Parent Address</IonLabel>
              <IonInput 
                value={parentAddress} 
                onIonChange={e => setParentAddress(e.detail.value!)} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Parent Phone Number</IonLabel>
              <IonInput 
                value={parentPhone} 
                onIonChange={e => setParentPhone(e.detail.value!)} />
            </IonItem>

            <IonButton expand="block" onClick={handleSave}>
              {editingId ? 'Update Student' : 'Register Student'}
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={resetForm}>
              Cancel
            </IonButton>
          </IonList>
        )}

        {/* Floating Action Button */}
        {!showForm && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => setShowForm(true)}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        )}

        {/* Toast messages */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default RegisterStudent;
