import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';

// Try to load from JSON file (local environment)
let firebaseConfig: any = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
};

// If environment variables are not set, try to use the local config file
if (!firebaseConfig.apiKey) {
  try {
    // We use a dynamic import here to prevent build-time errors if the file is missing
    // in environments where environment variables are used instead.
    // @ts-ignore
    const config = await import('../../firebase-applet-config.json');
    const localConfig = config.default || config;
    firebaseConfig = { 
      ...firebaseConfig, 
      ...localConfig,
      // Ensure we use the firestoreDatabaseId from the local config if available
      firestoreDatabaseId: localConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId
    };
    console.log('Firebase: Loaded configuration from local file');
  } catch (e) {
    console.log('Firebase: Local configuration file not found, using environment variables');
  }
} else {
  console.log('Firebase: Using configuration from environment variables');
}

// Validate config
if (!firebaseConfig || !firebaseConfig.apiKey) {
  const errorMsg = 'Firebase configuration is missing. If you are seeing a blank screen on Netlify, please ensure you have set the VITE_FIREBASE_* environment variables in your Netlify site settings.';
  console.error(errorMsg);
  // Don't initialize if config is missing to avoid crashing the whole app
  // but export dummy objects to prevent import errors
}

const app = initializeApp(firebaseConfig);
console.log('Firebase: App initialized successfully');
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

// Error handling helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
