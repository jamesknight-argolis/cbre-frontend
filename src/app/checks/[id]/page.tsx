import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, Tenant } from "@/types";
import { CheckDetailForm } from "@/components/checks/check-detail-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

async function getCheck(id: string): Promise<Check | null> {
  const checkRef = doc(db, "checks", id);
  const checkSnap = await getDoc(checkRef);
  if (!checkSnap.exists()) {
    return null;
  }
  return { id: checkSnap.id, ...checkSnap.data() } as Check;
}

async function getTenants(): Promise<Tenant[]> {
  const tenantsCol = collection(db, "tenants");
  const tenantSnapshot = await getDocs(tenantsCol);
  return tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
}

export default async function CheckDetailPage({ params }: { params: { id: string } }) {
  const check = await getCheck(params.id);
  const tenants = await getTenants();

  if (!check) {
    notFound();
  }

  const tenantsMap = tenants.reduce((acc, tenant) => {
    acc[tenant.id] = tenant.tenantName;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
       <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Link>
        </Button>
      </div>
      <CheckDetailForm check={check} tenants={tenants} tenantsMap={tenantsMap} />
    </div>
  );
}
