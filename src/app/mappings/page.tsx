import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mapping, Tenant } from "@/types";
import { MappingsTable } from "@/components/mappings/mappings-table";
import { PageHeader } from "@/components/common/page-header";

async function getMappings(): Promise<Mapping[]> {
  const mappingsCol = query(collection(db, "internal_mappings"), orderBy("senderName"));
  const mappingSnapshot = await getDocs(mappingsCol);
  return mappingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Mapping[];
}

async function getTenants(): Promise<Tenant[]> {
  const tenantsCol = query(collection(db, "tenants"), orderBy("tenantName"));
  const tenantSnapshot = await getDocs(tenantsCol);
  return tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
}

export default async function MappingsPage() {
  const mappings = await getMappings();
  const tenants = await getTenants();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <MappingsTable mappings={mappings} tenants={tenants} />
    </div>
  );
}
