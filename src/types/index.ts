export type Tenant = {
  id: string;
  tenantName: string;
};

export type Mapping = {
  id: string;
  senderName: string;
  tenantId: string;
};

export type CheckStatus = "Incoming" | "Processed" | "Approved" | "Denied";

export type Check = {
  id: string;
  checkId: string;
  senderName: string;
  status: CheckStatus;
  mappedTenantId: string | null;
  isSuggestion: boolean;
  suggestionReason: string | null;
  mappingConfidence: number | null;
};
