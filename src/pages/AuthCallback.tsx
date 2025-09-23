import React, { useEffect } from "react";
import { supabase } from "../utils/supabaseClients";
import { useIonRouter } from "@ionic/react";

const AuthCallback: React.FC = () => {
  const router = useIonRouter();

  useEffect(() => {
    const processCallback = async () => {
      // Supabase will extract the code from the URL and exchange it for a session
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error("OAuth callback error:", error.message);
        alert("Login failed, please try again.");
        router.push("/login"); // go back to login page
      } else {
        // ✅ session established, send user to homepage
        router.push("/");
      }
    };

    processCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-semibold">Finishing login...</h2>
      <p>Please wait while we sign you in.</p>
    </div>
  );
};

export default AuthCallback;
