'use server';
/**
 * @fileOverview A function for uploading a check image, creating a database entry,
 * and storing the image in Firebase Storage.
 *
 * - uploadCheckFlow - The main flow function.
 * - UploadCheckOutput - The return type for the flow.
 */
import { z } from 'zod';
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { randomUUID } from 'crypto';
import { db } from '@/lib/firebase';
import { getApp } from 'firebase/app';

const UploadCheckOutputSchema = z.object({
  checkId: z.string().describe('The ID of the created check document.'),
});
export type UploadCheckOutput = z.infer<typeof UploadCheckOutputSchema>;

export async function uploadCheckFlow(
  photoDataUri: string
): Promise<UploadCheckOutput> {
  // 1. Create a new check document in Firestore
  const checkId = randomUUID();
  const checkCollection = collection(db, 'checks');

  const newCheck = {
    checkId: checkId,
    status: 'Incoming' as const,
    senderName: 'Unknown', // Will be determined by another process
    mappedTenantId: null,
    isSuggestion: false,
    suggestionReason: null,
    mappingConfidence: null,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(checkCollection, newCheck);
  const newCheckId = docRef.id;

  // 2. Upload the image to Firebase Storage
  const app = getApp();
  const storage = getStorage(app);
  const storagePath = `checks/${newCheckId}/${checkId}.jpg`;
  const storageRef = ref(storage, storagePath);

  // We need to strip the data URI prefix
  const base64Data = photoDataUri.substring(photoDataUri.indexOf(',') + 1);

  await uploadString(storageRef, base64Data, 'base64', {
    contentType: 'image/jpeg',
  });

  // 3. Get the download URL
  const downloadURL = await getDownloadURL(storageRef);

  // 4. Update the Firestore document with the image URL and a temporary sender name
  await updateDoc(docRef, {
    imageUrl: downloadURL,
    senderName: `Uploaded Check ${newCheckId.substring(0, 4)}`, // Placeholder name
  });

  return { checkId: newCheckId };
}
