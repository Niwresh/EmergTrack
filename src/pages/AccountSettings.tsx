import React, { useState, useRef, useEffect } from 'react';
import {
  IonContent, IonPage, IonInput, IonButton, IonAlert, IonHeader,
  IonBackButton, IonButtons, IonItem, IonText, IonCol, IonGrid,
  IonRow, IonImg, IonAvatar, IonLoading,
} from '@ionic/react';
import { supabase } from '../utils/supabaseClients';
import { useHistory } from 'react-router-dom';

const AccountSettings: React.FC = () => {
  const [email, setEmail] = useState(''); // ✅ now we’ll display it
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true); // ✅ spinner state
  const history = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Fetch parent row by email, then store parent_id
  useEffect(() => {
    const fetchParentData = async () => {
      setLoading(true);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session) {
        setAlertMessage('You must be logged in to access this page.');
        setShowAlert(true);
        history.push('/EmergTrack/login');
        setLoading(false);
        return;
      }

      const authUser = sessionData.session.user;

      // 🔑 Always lookup by email first
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select('parent_id, full_name, username, user_avatar_url, email')
        .eq('email', authUser.email)
        .maybeSingle();

      if (parentError || !parent) {
        setAlertMessage('Parent data not found.');
        setShowAlert(true);
        setLoading(false);
        return;
      }

      // ✅ Store parent_id for later updates
      setParentId(parent.parent_id);
      setFullName(parent.full_name || '');
      setUsername(parent.username || '');
      setEmail(parent.email || '');
      setAvatarPreview(parent.user_avatar_url || null);

      setLoading(false);
    };

    fetchParentData();
  }, [history]);

  // Handle avatar file select
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Update profile by parent_id only
  const handleUpdate = async () => {
    if (!parentId) {
      setAlertMessage('Parent ID not loaded. Cannot update.');
      setShowAlert(true);
      return;
    }

    setLoading(true);

    let avatarUrl = avatarPreview;

    // Upload avatar if a new one is selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${parentId}/${fileName}`; // ✅ use parentId folder

      const { error: uploadError } = await supabase.storage
        .from('parents-avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        setAlertMessage(`Avatar upload failed: ${uploadError.message}`);
        setShowAlert(true);
        setLoading(false);
        return;
      }

      const { data: publicData } = supabase
        .storage
        .from('parents-avatars')
        .getPublicUrl(filePath);

      avatarUrl = publicData.publicUrl;
    }

    // 🔑 Update row by parent_id
    const { error: updateError } = await supabase
      .from('parents')
      .update({
        full_name: fullName,
        username: username,
        user_avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('parent_id', parentId);

    setLoading(false);

    if (updateError) {
      setAlertMessage(updateError.message);
      setShowAlert(true);
      return;
    }

    setAlertMessage('Account updated successfully!');
    setShowAlert(true);
    history.push('/EmergTrack/app');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/EmergTrack/app" />
        </IonButtons>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonText color="danger">
            <h1>Edit Account</h1>
          </IonText>
        </IonItem>
        <br />

        {/* Avatar Upload Section */}
        <IonGrid>
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonCol className="ion-text-center">
              {avatarPreview && (
                <IonAvatar style={{ width: '200px', height: '200px', margin: '10px auto' }}>
                  <IonImg src={avatarPreview} style={{ objectFit: 'cover' }} />
                </IonAvatar>
              )}

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleAvatarChange}
              />

              <IonButton expand="block" color="danger" onClick={() => fileInputRef.current?.click()}>
                Upload Avatar
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Username + Full Name Fields */}
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonInput
                label="Username"
                type="text"
                labelPlacement="floating"
                fill="outline"
                placeholder="Enter username"
                value={username}
                onIonChange={(e) => setUsername(e.detail.value!)}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonInput
                label="Full Name"
                type="text"
                labelPlacement="floating"
                fill="outline"
                placeholder="Enter Full Name"
                value={fullName}
                onIonChange={(e) => setFullName(e.detail.value!)}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonInput
                label="Email"
                type="text"
                labelPlacement="floating"
                fill="outline"
                readonly
                value={email}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonButton expand="full" onClick={handleUpdate} color="danger" shape="round">
          Update Account
        </IonButton>

        {/* Alert for success or errors */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          message={alertMessage}
          buttons={['OK']}
        />

        {/* Loading Spinner */}
        <IonLoading
          isOpen={loading}
          message={'Please wait...'}
          spinner="circles"
        />
      </IonContent>
    </IonPage>
  );
};

export default AccountSettings;
