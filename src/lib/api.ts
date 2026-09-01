import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { InvoiceData } from "@/types/invoice";

export type Client = Tables<"clients">;
export type Project = Tables<"projects">;
export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";
export type Invoice = Omit<Tables<"invoices">, "data" | "status"> & { data: InvoiceData; status: InvoiceStatus };
export type RecurringSchedule = Tables<"recurring_schedules">;
export type CompanySettings = Tables<"company_settings">;

// Company settings (single row)

export const getCompanySettings = async () => {
  const { data, error } = await supabase.from("company_settings").select("*").limit(1).single();
  if (error) throw error;
  return data;
};

export const updateCompanySettings = async (id: string, input: TablesUpdate<"company_settings">) => {
  const { data, error } = await supabase
    .from("company_settings")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Clients

export const getClients = async () => {
  const { data, error } = await supabase.from("clients").select("*").order("name");
  if (error) throw error;
  return data;
};

export const getClient = async (id: string) => {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

export const createClient = async (input: TablesInsert<"clients">) => {
  const { data, error } = await supabase.from("clients").insert(input).select().single();
  if (error) throw error;
  return data;
};

// Projects

export const getProjectsForClient = async (clientId: string) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("name");
  if (error) throw error;
  return data;
};

export const getProject = async (id: string) => {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

export const createProject = async (input: TablesInsert<"projects">) => {
  const { data, error } = await supabase.from("projects").insert(input).select().single();
  if (error) throw error;
  return data;
};

// Invoices

export const getInvoicesForProject = async (projectId: string) => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("project_id", projectId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data as unknown as Invoice[];
};

export const getAllInvoices = async () => {
  const { data, error } = await supabase.from("invoices").select("*").order("date", { ascending: false });
  if (error) throw error;
  return data as unknown as Invoice[];
};

export type InvoiceWithContext = Invoice & { projects: { name: string; clients: { name: string } } };

export const getAllInvoicesWithContext = async () => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, projects(name, clients(name))")
    .order("due_date");
  if (error) throw error;
  return data as unknown as InvoiceWithContext[];
};

export const getInvoice = async (id: string) => {
  const { data, error } = await supabase.from("invoices").select("*").eq("id", id).single();
  if (error) throw error;
  return data as unknown as Invoice;
};

export const countInvoicesOnDate = async (date: string) => {
  const { count, error } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("date", date);
  if (error) throw error;
  return count ?? 0;
};

export const createInvoice = async (input: {
  project_id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  data: InvoiceData;
}) => {
  const { data, error } = await supabase
    .from("invoices")
    .insert(input as unknown as TablesInsert<"invoices">)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Invoice;
};

export const updateInvoiceData = async (id: string, invoiceData: InvoiceData) => {
  const { data, error } = await supabase
    .from("invoices")
    .update({
      data: invoiceData as unknown as TablesInsert<"invoices">["data"],
      invoice_number: invoiceData.invoiceNumber,
      date: invoiceData.date,
      due_date: invoiceData.dueDate,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Invoice;
};

// Moving to "paid" stamps paid_at; moving away from "paid" (e.g. a Kanban card dragged
// back off the Paid column) clears paid_at and the receipt link, since neither reflects
// the invoice's state anymore. The already-generated receipt file is left in storage as
// a harmless orphan rather than adding a delete round-trip for it.
export const setInvoiceStatus = async (id: string, status: InvoiceStatus) => {
  const patch =
    status === "paid" ? { status, paid_at: new Date().toISOString() } : { status, paid_at: null, receipt_url: null };
  const { data, error } = await supabase.from("invoices").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as unknown as Invoice;
};

export const setInvoiceReceiptUrl = async (id: string, receiptUrl: string) => {
  const { data, error } = await supabase
    .from("invoices")
    .update({ receipt_url: receiptUrl })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Invoice;
};

// Recurring schedules

export const getRecurringScheduleForInvoice = async (invoiceId: string) => {
  const { data, error } = await supabase
    .from("recurring_schedules")
    .select("*")
    .eq("source_invoice_id", invoiceId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const createRecurringSchedule = async (input: TablesInsert<"recurring_schedules">) => {
  const { data, error } = await supabase.from("recurring_schedules").insert(input).select().single();
  if (error) throw error;
  return data;
};

export const setRecurringScheduleActive = async (id: string, active: boolean) => {
  const { data, error } = await supabase
    .from("recurring_schedules")
    .update({ active })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Receipts

export const uploadReceipt = async (invoiceId: string, blob: Blob) => {
  const path = `${invoiceId}.pdf`;
  const { error } = await supabase.storage.from("receipts").upload(path, blob, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw error;
  return path;
};

export const getReceiptSignedUrl = async (path: string) => {
  const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
};
