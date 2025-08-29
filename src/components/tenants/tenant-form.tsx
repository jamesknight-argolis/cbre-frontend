"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from "react";

import { Tenant } from "@/types";
import { addTenant, updateTenant } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const tenantSchema = z.object({
  tenantName: z.string().min(1, "Tenant name is required."),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantFormProps {
  tenant?: Tenant;
  onSuccess: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Tenant" : "Add Tenant")}
        </Button>
    );
}

export function TenantForm({ tenant, onSuccess }: TenantFormProps) {
  const isEditing = !!tenant;
  const { toast } = useToast();

  const formAction = isEditing ? updateTenant.bind(null, tenant.id) : addTenant;
  const [state, dispatch] = useFormState(formAction, { message: "", errors: {} });

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      tenantName: tenant?.tenantName || "",
    },
  });

  useEffect(() => {
    if (state.message) {
      toast({ title: "Success", description: state.message });
      onSuccess();
    }
    if (state.errors?._server) {
      toast({ variant: 'destructive', title: "Error", description: state.errors._server[0] });
    }
  }, [state, toast, onSuccess]);
  
  const { register, formState: { errors } } = form;

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <Label htmlFor="tenantName">Tenant Name</Label>
        <Input
          id="tenantName"
          {...register("tenantName")}
          aria-invalid={errors.tenantName || state.errors?.tenantName ? "true" : "false"}
        />
        {errors.tenantName && (
          <p className="text-sm text-destructive mt-1">{errors.tenantName.message}</p>
        )}
         {state.errors?.tenantName && (
          <p className="text-sm text-destructive mt-1">{state.errors.tenantName[0]}</p>
        )}
      </div>
      <SubmitButton isEditing={isEditing} />
    </form>
  );
}
