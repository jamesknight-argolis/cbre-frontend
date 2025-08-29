import * as admin from 'firebase-admin';

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

const firestoreDb = admin.firestore();
const storage = admin.storage();

export { admin, firestoreDb, storage };
