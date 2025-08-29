"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from "react";

import { Mapping, Tenant } from "@/types";
import { addMapping, updateMapping } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const mappingSchema = z.object({
  senderName: z.string().min(1, "Sender name is required."),
  tenantId: z.string().min(1, "Please select a tenant."),
});

type MappingFormData = z.infer<typeof mappingSchema>;

interface MappingFormProps {
  mapping?: Mapping;
  tenants: Tenant[];
  onSuccess: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Mapping" : "Add Mapping")}
        </Button>
    );
}

export function MappingForm({ mapping, tenants, onSuccess }: MappingFormProps) {
  const isEditing = !!mapping;
  const { toast } = useToast();
  
  const formAction = isEditing ? updateMapping.bind(null, mapping.id) : addMapping;
  const [state, dispatch] = useFormState(formAction, { message: "", errors: {} });

  const form = useForm<MappingFormData>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      senderName: mapping?.senderName || "",
      tenantId: mapping?.tenantId || "",
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

  const { register, control, setValue, watch, formState: { errors } } = form;
  const tenantIdValue = watch("tenantId");

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <Label htmlFor="senderName">Sender Name</Label>
        <Input
          id="senderName"
          {...register("senderName")}
          aria-invalid={errors.senderName || state.errors?.senderName ? "true" : "false"}
        />
        {errors.senderName && (
          <p className="text-sm text-destructive mt-1">{errors.senderName.message}</p>
        )}
         {state.errors?.senderName && (
          <p className="text-sm text-destructive mt-1">{state.errors.senderName[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="tenantId">Map to Tenant</Label>
        <Controller
          name="tenantId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={(value) => setValue("tenantId", value, { shouldValidate: true })} defaultValue={field.value}>
              <SelectTrigger id="tenantId" aria-invalid={errors.tenantId || state.errors?.tenantId ? "true" : "false"}>
                <SelectValue placeholder="Select a tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.tenantName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <input type="hidden" {...register("tenantId")} />
        {errors.tenantId && (
          <p className="text-sm text-destructive mt-1">{errors.tenantId.message}</p>
        )}
        {state.errors?.tenantId && (
          <p className="text-sm text-destructive mt-1">{state.errors.tenantId[0]}</p>
        )}
      </div>
      <SubmitButton isEditing={isEditing} />
    </form>
  );
}
