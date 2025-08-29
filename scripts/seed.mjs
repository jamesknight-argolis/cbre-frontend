import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const promises = [];
    snapshot.forEach(doc => {
        promises.push(deleteDoc(doc.ref));
    });
    await Promise.all(promises);
    console.log(`Collection ${collectionName} cleared.`);
}


async function seedTenants() {
    await clearCollection('tenants');
    const tenants = [
        { tenantName: 'Stark Industries' },
        { tenantName: 'Wayne Enterprises' },
        { tenantName: 'Cyberdyne Systems' },
        { tenantName: 'Ollivanders Wand Shop' },
    ];
    const promises = tenants.map(t => addDoc(collection(db, 'tenants'), t));
    const docs = await Promise.all(promises);
    console.log('Tenants seeded');
    return docs.map((d, i) => ({...tenants[i], id: d.id }));
}

async function seedMappings(tenants) {
    await clearCollection('internal_mappings');
    const stark = tenants.find(t => t.tenantName === 'Stark Industries');
    const wayne = tenants.find(t => t.tenantName === 'Wayne Enterprises');
    const cyberdyne = tenants.find(t => t.tenantName === 'Cyberdyne Systems');

    const mappings = [
        { senderName: 'Tony Stark', tenantId: stark.id },
        { senderName: 'Stark Expo', tenantId: stark.id },
        { senderName: 'Bruce Wayne', tenantId: wayne.id },
        { senderName: 'Wayne Foundation', tenantId: wayne.id },
        { senderName: 'Cyberdyne', tenantId: cyberdyne.id },
    ];
    const promises = mappings.map(m => addDoc(collection(db, 'internal_mappings'), m));
    await Promise.all(promises);
    console.log('Mappings seeded');
}

async function seedChecks(tenants) {
    await clearCollection('checks');
    const stark = tenants.find(t => t.tenantName === 'Stark Industries');
    const wayne = tenants.find(t => t.tenantName === 'Wayne Enterprises');
    const ollivanders = tenants.find(t => t.tenantName === 'Ollivanders Wand Shop');

    const checks = [
        { 
            checkId: 'CHK-001',
            senderName: 'Pepper Potts', 
            status: 'Incoming', 
            mappedTenantId: null,
            isSuggestion: false,
            suggestionReason: null,
            mappingConfidence: null,
        },
        { 
            checkId: 'CHK-002',
            senderName: 'Stark Industries', 
            status: 'Processed', 
            mappedTenantId: stark.id,
            isSuggestion: false,
            suggestionReason: null,
            mappingConfidence: 0.99,
        },
        { 
            checkId: 'CHK-003',
            senderName: 'Lucius Fox', 
            status: 'Processed', 
            mappedTenantId: wayne.id,
            isSuggestion: true,
            suggestionReason: 'Sender name "Lucius Fox" is associated with "Wayne Enterprises".',
            mappingConfidence: 0.85,
        },
        { 
            checkId: 'CHK-004',
            senderName: 'Garrick Ollivander', 
            status: 'Approved', 
            mappedTenantId: ollivanders.id,
            isSuggestion: false,
            suggestionReason: null,
            mappingConfidence: 1.0,
        },
        { 
            checkId: 'CHK-005',
            senderName: 'A N Other', 
            status: 'Denied', 
            mappedTenantId: null,
            isSuggestion: false,
            suggestionReason: null,
            mappingConfidence: null,
        }
    ];

    const promises = checks.map(c => addDoc(collection(db, 'checks'), c));
    await Promise.all(promises);
    console.log('Checks seeded');
}


async function main() {
    try {
        const tenants = await seedTenants();
        await seedMappings(tenants);
        await seedChecks(tenants);
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

main().then(() => process.exit());
