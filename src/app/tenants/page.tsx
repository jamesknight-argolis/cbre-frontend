import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tenant } from "@/types";
import { TenantsTable } from "@/components/tenants/tenants-table";
import { PageHeader } from "@/components/common/page-header";

async function getTenants(): Promise<Tenant[]> {
  const tenantsCol = query(collection(db, "tenants"), orderBy("tenantName"));
  const tenantSnapshot = await getDocs(tenantsCol);
  const tenantsList = tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tenant[];
  return tenantsList;
}

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <TenantsTable data={tenants} />
    </div>
  );
}
