'use server';

import { revalidatePath } from 'next/cache';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { z } from 'zod';
import { db } from './firebase';

// Tenant Actions
const tenantSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required.'),
});

export async function addTenant(prevState: any, formData: FormData) {
  const validatedFields = tenantSchema.safeParse({
    tenantName: formData.get('tenantName'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const tenantsCollection = collection(db, 'tenants');
    await addDoc(tenantsCollection, {
      ...validatedFields.data,
    });
    revalidatePath('/tenants');
    return { message: 'Tenant added successfully.' };
  } catch (e) {
    console.error('Failed to add tenant:', e);
    return { errors: { _server: ['Failed to add tenant.'] } };
  }
}

export async function updateTenant(
  id: string,
  prevState: any,
  formData: FormData
) {
  const validatedFields = tenantSchema.safeParse({
    tenantName: formData.get('tenantName'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const tenantRef = doc(db, 'tenants', id);
    await updateDoc(tenantRef, validatedFields.data);
    revalidatePath('/tenants');
    revalidatePath('/mappings');
    return { message: 'Tenant updated successfully.' };
  } catch (e) {
    console.error('Failed to update tenant:', e);
    return { errors: { _server: ['Failed to update tenant.'] } };
  }
}

export async function deleteTenant(id: string) {
  try {
    const tenantRef = doc(db, 'tenants', id);
    await deleteDoc(tenantRef);
    revalidatePath('/tenants');
    revalidatePath('/mappings');
    return { message: 'Tenant deleted successfully.' };
  } catch (e) {
    console.error('Failed to delete tenant:', e);
    return { error: 'Failed to delete tenant.' };
  }
}

// Mapping Actions
const mappingSchema = z.object({
  senderName: z.string().min(1, 'Sender name is required.'),
  tenantId: z.string().min(1, 'Please select a tenant.'),
});

export async function addMapping(prevState: any, formData: FormData) {
  const validatedFields = mappingSchema.safeParse({
    senderName: formData.get('senderName'),
    tenantId: formData.get('tenantId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const mappingsCollection = collection(db, 'internal_mappings');
    await addDoc(mappingsCollection, validatedFields.data);
    revalidatePath('/mappings');
    return { message: 'Mapping added successfully.' };
  } catch (e) {
    console.error('Failed to add mapping:', e);
    return { errors: { _server: ['Failed to add mapping.'] } };
  }
}

export async function updateMapping(
  id: string,
  prevState: any,
  formData: FormData
) {
  const validatedFields = mappingSchema.safeParse({
    senderName: formData.get('senderName'),
    tenantId: formData.get('tenantId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const mappingRef = doc(db, 'internal_mappings', id);
    await updateDoc(mappingRef, validatedFields.data);
    revalidatePath('/mappings');
    return { message: 'Mapping updated successfully.' };
  } catch (e) {
    console.error('Failed to update mapping:', e);
    return { errors: { _server: ['Failed to update mapping.'] } };
  }
}

export async function deleteMapping(id: string) {
  try {
    const mappingRef = doc(db, 'internal_mappings', id);
    await deleteDoc(mappingRef);
    revalidatePath('/mappings');
    return { message: 'Mapping deleted successfully.' };
  } catch (e) {
    console.error('Failed to delete mapping:', e);
    return { error: 'Failed to delete mapping.' };
  }
}

// Check Actions
const checkUpdateSchema = z.object({
  status: z.enum(['Incoming', 'Processed', 'Approved', 'Denied']),
  mappedTenantId: z.string().nullable(),
});

export async function updateCheck(
  id: string,
  prevState: any,
  formData: FormData
) {
  const validatedFields = checkUpdateSchema.safeParse({
    status: formData.get('status'),
    mappedTenantId: formData.get('mappedTenantId') || null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const checkRef = doc(db, 'checks', id);
    await updateDoc(checkRef, {
      ...validatedFields.data,
      isSuggestion: false, // User action overrides suggestion
    });
    revalidatePath('/');
    revalidatePath(`/checks/${id}`);
    return { message: 'Check updated successfully.' };
  } catch (e) {
    console.error('Failed to update check:', e);
    return { errors: { _server: ['Failed to update check.'] } };
  }
}
