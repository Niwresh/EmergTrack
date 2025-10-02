import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonTextarea,
  IonButton,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonLoading,
  IonButtons,
  IonMenuButton,
} from "@ionic/react";
import { chatboxEllipsesOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClients";

const Feedback: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ Load parent_id directly from localStorage
    const storedParentId = localStorage.getItem("parent_id");
    if (storedParentId) {
      setParentId(Number(storedParentId));
      console.log("✅ Parent ID loaded:", storedParentId);
    } else {
      console.error("❌ No parent_id found in localStorage.");
    }
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) {
      setToastMessage("Please select a rating.");
      return;
    }

    if (!parentId) {
      console.error("❌ No parent_id found in Feedback page.");
      setToastMessage("Error: No parent ID found.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.from("feedback").insert([
      {
        parent_id: parentId,
        rating,
        comments,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("❌ Insert error:", error);
      setToastMessage("❌ Error submitting feedback: " + error.message);
    } else {
      console.log("✅ Insert success:", data);
      setToastMessage("✅ Thank you for your feedback!");
      setRating(0);
      setComments("");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonButtons slot="start">
             <IonMenuButton />
            </IonButtons>
            <IonIcon icon={chatboxEllipsesOutline} /> Parent Feedback
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Rating (1–5)</IonLabel>
          <IonSelect
            value={rating}
            placeholder="Select rating"
            onIonChange={(e) => setRating(Number(e.detail.value))}
          >
            <IonSelectOption value={1}>⭐</IonSelectOption>
            <IonSelectOption value={2}>⭐⭐</IonSelectOption>
            <IonSelectOption value={3}>⭐⭐⭐</IonSelectOption>
            <IonSelectOption value={4}>⭐⭐⭐⭐</IonSelectOption>
            <IonSelectOption value={5}>⭐⭐⭐⭐⭐</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Comments</IonLabel>
          <IonTextarea
            value={comments}
            placeholder="Write your feedback here..."
            onIonInput={(e) => setComments(e.detail.value as string)}
          />
        </IonItem>

        <IonButton
          expand="block"
          className="ion-margin-top"
          onClick={handleSubmit}
          disabled={loading}
        >
          Submit Feedback
        </IonButton>

        {/* 🔄 Loading Spinner */}
        <IonLoading
          isOpen={loading}
          message={"Submitting your feedback..."}
        />

        {/* ✅ Toast Notifications */}
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2500}
          onDidDismiss={() => setToastMessage("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default Feedback;
