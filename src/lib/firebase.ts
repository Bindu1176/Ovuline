import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Helper to determine if the Firebase configuration is ready
export const isFirebaseConfigured = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes("dummy-api-key");

let app;
let db: Firestore;
let auth: Auth;

try {
  if (isFirebaseConfigured) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    console.log("Firebase initialized successfully with config:", firebaseConfig.projectId);

    // Validate connection as requested in skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.warn("Firebase client is currently offline.");
        }
      }
    };
    testConnection();
  } else {
    console.warn("Firebase is in Simulator/Demo mode using LocalStorage because Firebase terms have not been accepted yet.");
  }
} catch (error) {
  console.error("Failed to initialize real Firebase services:", error);
}

export { db, auth };
export default app;
