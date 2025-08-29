"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormStatus } from "react-dom";
import { useEffect, useActionState } from "react";

import { Check, Tenant, CheckStatus } from "@/types";
import { updateCheck } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Info, Lightbulb } from "lucide-react";

const checkUpdateSchema = z.object({
  status: z.enum(["Incoming", "Processed", "Approved", "Denied"]),
  mappedTenantId: z.string().nullable(),
});

type CheckUpdateFormData = z.infer<typeof checkUpdateSchema>;

interface CheckDetailFormProps {
  check: Check;
  tenants: Tenant[];
  tenantsMap: Record<string, string>;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Updating..." : "Update Check"}
        </Button>
    );
}

export function CheckDetailForm({ check, tenants, tenantsMap }: CheckDetailFormProps) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateCheck.bind(null, check.id), {
    message: "",
    errors: {},
  });
  
  const form = useForm<CheckUpdateFormData>({
    resolver: zodResolver(checkUpdateSchema),
    defaultValues: {
      status: check.status,
      mappedTenantId: check.mappedTenantId,
    },
  });

  useEffect(() => {
    if (state.message) {
      toast({ title: "Success", description: state.message });
    }
    if (state.errors?._server) {
      toast({ variant: 'destructive', title: "Error", description: state.errors._server[0] });
    }
  }, [state, toast]);

  const { control, handleSubmit } = form;

  const currentMappedTenant = check.mappedTenantId ? tenantsMap[check.mappedTenantId] : 'N/A';
  const checkStatuses: CheckStatus[] = ["Incoming", "Processed", "Approved", "Denied"];

  return (
    <form action={formAction} onSubmit={handleSubmit(formAction)}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Check Details</CardTitle>
                    <CardDescription>Sender: {check.senderName}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Check ID</Label>
                            <p className="text-sm text-muted-foreground">{check.checkId}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Current Mapped Tenant</Label>
                            <p className="text-sm font-medium">{currentMappedTenant}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {check.isSuggestion && (
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Agent Suggestion</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">{check.suggestionReason}</p>
                    <p className="font-medium">Confidence: {check.mappingConfidence ? `${(check.mappingConfidence * 100).toFixed(0)}%` : 'N/A'}</p>
                </AlertDescription>
            </Alert>
            )}
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Update status or correct the mapping.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {checkStatuses.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mappedTenantId">Update Mapping</Label>
                <Controller
                  name="mappedTenantId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                      <SelectTrigger id="mappedTenantId">
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.tenantName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <SubmitButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
