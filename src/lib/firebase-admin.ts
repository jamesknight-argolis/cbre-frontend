import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'checkmapper',
      storageBucket: 'cbre-poc-checks.appspot.com',
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const firestoreDb = getFirestore(admin.apps[0]!, 'cbre-poc');
const storage = admin.storage();

export { admin, firestoreDb, storage };
