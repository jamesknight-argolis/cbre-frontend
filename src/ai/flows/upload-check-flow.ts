'use server';
/**
 * @fileOverview A function for uploading a check image, creating a database entry,
 * and storing the image in Google Cloud Storage.
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
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import { db } from '@/lib/firebase';

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

  // 2. Upload the image to Google Cloud Storage
  const storage = new Storage({
    projectId: 'checkmapper'
  });
  const bucketName = 'cbre-poc-checks';
  const bucket = storage.bucket(bucketName);
  const filePath = `checks/${newCheckId}/${checkId}.jpg`;
  const file = bucket.file(filePath);

  // We need to strip the data URI prefix and decode from base64
  const base64Data = photoDataUri.substring(photoDataUri.indexOf(',') + 1);
  const imageBuffer = Buffer.from(base64Data, 'base64');

  await file.save(imageBuffer, {
    metadata: {
      contentType: 'image/jpeg',
    },
  });

  // 3. Construct the public URL
  const downloadURL = `https://storage.googleapis.com/${bucketName}/${filePath}`;

  // 4. Update the Firestore document with the image URL and a temporary sender name
  await updateDoc(docRef, {
    imageUrl: downloadURL,
    senderName: `Uploaded Check ${newCheckId.substring(0, 4)}`, // Placeholder name
  });

  return { checkId: newCheckId };
}
