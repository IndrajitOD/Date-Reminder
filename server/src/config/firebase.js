import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseAdminApp = null;

export function initFirebaseAdmin() {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  // Check 1: Explicit Service Account path from env
  const serviceAccountPathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const directKeyEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  let serviceAccount = null;

  // Try path first
  if (serviceAccountPathEnv) {
    const resolvedPath = path.isAbsolute(serviceAccountPathEnv)
      ? serviceAccountPathEnv
      : path.resolve(process.cwd(), serviceAccountPathEnv);

    if (fs.existsSync(resolvedPath)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        console.log(`[Firebase Admin] Loaded service account credentials from: ${serviceAccountPathEnv}`);
      } catch (err) {
        console.error(`[Firebase Admin Error] Failed to parse service account JSON at ${resolvedPath}:`, err.message);
      }
    }
  }

  // Try default fallback path in ./secrets/firebase-service-account.json
  if (!serviceAccount) {
    const defaultSecretsPath = path.resolve(process.cwd(), 'secrets', 'firebase-service-account.json');
    if (fs.existsSync(defaultSecretsPath)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(defaultSecretsPath, 'utf8'));
        console.log('[Firebase Admin] Loaded service account from default secrets directory');
      } catch (err) {}
    }
  }

  // Try direct JSON string in env
  if (!serviceAccount && directKeyEnv) {
    try {
      serviceAccount = JSON.parse(directKeyEnv);
      console.log('[Firebase Admin] Loaded service account from FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    } catch (err) {}
  }

  if (serviceAccount) {
    try {
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('[Firebase Admin] Initialized with Service Account successfully');
      return firebaseAdminApp;
    } catch (err) {
      console.error('[Firebase Admin Initialization Error]:', err.message);
    }
  } else {
    console.warn('[Firebase Admin Notice]: No service account file found yet. (Place firebase-service-account.json in backend/secrets/)');
  }

  return null;
}

export function getFirebaseAdmin() {
  if (!firebaseAdminApp) {
    return initFirebaseAdmin();
  }
  return firebaseAdminApp;
}
