'use server';
/**
 * @fileOverview A function for uploading a check image, creating a database entry,
 * and storing the image in Google Cloud Storage.
 *
 * - uploadCheckFlow - The main flow function.
 * - UploadCheckOutput - The return type for the flow.
 */
import { z } from 'zod';
import { admin, firestoreDb, storage } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';

const UploadCheckOutputSchema = z.object({
  checkId: z.string().describe('The ID of the created check document.'),
});
export type UploadCheckOutput = z.infer<typeof UploadCheckOutputSchema>;

export async function uploadCheckFlow(
  photoDataUri: string
): Promise<UploadCheckOutput> {
  // 1. Create a new check document in Firestore
  const checkId = randomUUID();
  const db = firestoreDb.collection('checks');
  
  const newCheck = {
    checkId: checkId,
    status: 'Incoming' as const,
    senderName: 'Unknown', // Will be determined by another process
    mappedTenantId: null,
    isSuggestion: false,
    suggestionReason: null,
    mappingConfidence: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.add(newCheck);
  const newCheckId = docRef.id;

  // 2. Upload the image to Google Cloud Storage
  const bucket = storage.bucket('cbre-poc-checks');
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
  const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

  // 4. Update the Firestore document with the image URL and a temporary sender name
  await docRef.update({
    imageUrl: downloadURL,
    senderName: `Uploaded Check ${newCheckId.substring(0, 4)}`, // Placeholder name
  });

  return { checkId: newCheckId };
}
