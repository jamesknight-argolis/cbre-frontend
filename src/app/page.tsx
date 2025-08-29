import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, Tenant } from "@/types";
import { ChecksTable } from "@/components/checks/checks-table";
import { PageHeader } from "@/components/common/page-header";

async function getChecks(): Promise<Check[]> {
  const checksCol = query(collection(db, "checks"), orderBy("senderName"));
  const checksSnapshot = await getDocs(checksCol);
  return checksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Check[];
}

async function getTenants(): Promise<Record<string, string>> {
  const tenantsCol = collection(db, "tenants");
  const tenantSnapshot = await getDocs(tenantsCol);
  const tenantsMap: Record<string, string> = {};
  tenantSnapshot.docs.forEach(doc => {
    tenantsMap[doc.id] = (doc.data() as Tenant).tenantName;
  });
  return tenantsMap;
}

export default async function Home() {
  const checks = await getChecks();
  const tenantsMap = await getTenants();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader title="Check Review Queue" />
      <p className="mb-6 text-muted-foreground">
        Review and manage incoming checks processed by the agent.
      </p>
      <ChecksTable checks={checks} tenantsMap={tenantsMap} />
    </div>
  );
}
