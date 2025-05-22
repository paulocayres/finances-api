// firebase-admin.ts
import * as dotenv from 'dotenv';
dotenv.config();
import * as admin from 'firebase-admin';
const firebaseConfig = process.env.FIREBASE_CONFIG;

if (!firebaseConfig) {
  throw new Error('FIREBASE_CONFIG não definida');
}

const serviceAccount = JSON.parse(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };