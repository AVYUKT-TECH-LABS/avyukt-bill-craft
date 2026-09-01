import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { addDays, format } from "date-fns";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceData } from "@/types/invoice";
import { nextInvoiceNumber } from "@/lib/invoiceNumber";
import { renderElementToPdf, offscreenClass } from "@/lib/pdf";
import {
  getProject,
  getClient,
  getCompanySettings,
  getInvoice,
  createInvoice,
  updateInvoiceData,
  countInvoicesOnDate,
  setInvoiceStatus,
  uploadReceipt,
  setInvoiceReceiptUrl,
  getReceiptSignedUrl,
  createRecurringSchedule,
  getRecurringScheduleForInvoice,
  setRecurringScheduleActive,
  Invoice,
  RecurringSchedule,
} from "@/lib/api";
import { FileDown, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

const buildDefaultItems = () => [
  { id: "1", description: "", hsnSac: "", quantity: 1, price: 0, taxable: true },
];

const InvoiceEditor = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();

  const isCreate = !invoiceId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [schedule, setSchedule] = useState<RecurringSchedule | null>(null);
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "quarterly" | "yearly">("monthly");

  const previewRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (isCreate) {
        if (!projectId) {
          toast.error("Missing project");
          navigate("/clients");
          return;
        }
        const project = await getProject(projectId);
        const client = await getClient(project.client_id);
        const company = await getCompanySettings();
        const today = new Date();
        const count = await countInvoicesOnDate(format(today, "yyyy-MM-dd"));
        setData({
          invoiceNumber: nextInvoiceNumber(today, count),
          date: format(today, "yyyy-MM-dd"),
          dueDate: format(addDays(today, 3), "yyyy-MM-dd"),
          companyName: company.company_name,
          companyAddress: company.company_address,
          companyCity: company.company_city,
          companyState: company.company_state,
          companyZip: company.company_zip,
          companyPhone: company.company_phone,
          companyEmail: company.company_email,
          companyGSTIN: company.company_gstin || undefined,
          companyPAN: company.company_pan || undefined,
          companyCIN: company.company_cin || undefined,
          clientName: client.name,
          clientEmail: client.email || "",
          clientGSTIN: client.gstin || undefined,
          clientAddress: client.address || undefined,
          clientState: client.state || undefined,
          items: buildDefaultItems(),
          cgst: 9,
          sgst: 9,
          igst: 0,
          notes: "",
        });
      } else {
        const inv = await getInvoice(invoiceId);
        setInvoice(inv);
        setData(inv.data);
        const existingSchedule = await getRecurringScheduleForInvoice(inv.id);
        setSchedule(existingSchedule);
        if (existingSchedule) {
          setMakeRecurring(existingSchedule.active);
          setFrequency(existingSchedule.frequency as typeof frequency);
        }
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, projectId]);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      if (isCreate) {
        if (!projectId) return;
        const created = await createInvoice({
          project_id: projectId,
          invoice_number: data.invoiceNumber,
          date: data.date,
          due_date: data.dueDate,
          data,
        });
        if (makeRecurring) {
          await createRecurringSchedule({
            source_invoice_id: created.id,
            frequency,
            anchor_date: created.date,
            active: true,
          });
        }
        toast.success("Invoice created");
        navigate(`/invoices/${created.id}`, { replace: true });
      } else if (invoice) {
        const updated = await updateInvoiceData(invoice.id, data);
        setInvoice(updated);

        if (makeRecurring && !schedule) {
          const newSchedule = await createRecurringSchedule({
            source_invoice_id: invoice.id,
            frequency,
            anchor_date: updated.date,
            active: true,
          });
          setSchedule(newSchedule);
        } else if (schedule && schedule.active !== makeRecurring) {
          const updatedSchedule = await setRecurringScheduleActive(schedule.id, makeRecurring);
          setSchedule(updatedSchedule);
        }
        toast.success("Invoice saved");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current || !data) return;
    try {
      toast.loading("Generating PDF...");
      const pdf = await renderElementToPdf(previewRef.current);
      pdf.save(`Invoice_${data.invoiceNumber}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleMarkPaid = async () => {
    if (!invoice || !data) return;
    if (!confirm("Mark this invoice as paid? This will also generate a receipt.")) return;
    setSaving(true);
    try {
      const paid = await setInvoiceStatus(invoice.id, "paid");
      setInvoice(paid);

      if (receiptRef.current) {
        const pdf = await renderElementToPdf(receiptRef.current);
        const blob = pdf.output("blob");
        const path = await uploadReceipt(invoice.id, blob);
        const withReceipt = await setInvoiceReceiptUrl(invoice.id, path);
        setInvoice(withReceipt);
      }
      toast.success("Invoice marked paid, receipt generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to mark paid");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkSent = async () => {
    if (!invoice) return;
    setSaving(true);
    try {
      setInvoice(await setInvoiceStatus(invoice.id, "sent"));
      toast.success("Invoice marked sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;
    if (!confirm("Cancel this invoice? It will be excluded from outstanding/overdue totals.")) return;
    setSaving(true);
    try {
      setInvoice(await setInvoiceStatus(invoice.id, "cancelled"));
      toast.success("Invoice cancelled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshCompanyInfo = async () => {
    if (!data) return;
    try {
      const company = await getCompanySettings();
      setData({
        ...data,
        companyName: company.company_name,
        companyAddress: company.company_address,
        companyCity: company.company_city,
        companyState: company.company_state,
        companyZip: company.company_zip,
        companyPhone: company.company_phone,
        companyEmail: company.company_email,
        companyGSTIN: company.company_gstin || undefined,
        companyPAN: company.company_pan || undefined,
        companyCIN: company.company_cin || undefined,
      });
      toast.success("Company info refreshed — remember to Save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to refresh company info");
    }
  };

  const handleDownloadReceipt = async () => {
    if (!invoice?.receipt_url) return;
    const url = await getReceiptSignedUrl(invoice.receipt_url);
    window.open(url, "_blank");
  };

  if (loading || !data) return <p className="text-muted-foreground">Loading...</p>;

  const isPaid = invoice?.status === "paid";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              {isCreate ? "New Invoice" : `Invoice ${data.invoiceNumber}`}
            </h1>
            {invoice && (
              <Badge variant={invoice.status === "paid" ? "default" : invoice.status === "cancelled" ? "destructive" : "secondary"}>
                {invoice.status}
              </Badge>
            )}
          </div>
          <button onClick={() => navigate(-1)} className="text-sm text-primary hover:underline">
            &larr; Back
          </button>
          {isPaid && invoice.paid_at && (
            <p className="text-sm text-muted-foreground mt-1">
              Paid on {format(new Date(invoice.paid_at), "MMM dd, yyyy 'at' h:mm a")}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {invoice?.status === "draft" && (
            <Button onClick={handleMarkSent} variant="outline" disabled={saving}>
              Mark as Sent
            </Button>
          )}
          {(invoice?.status === "draft" || invoice?.status === "sent") && (
            <Button onClick={handleMarkPaid} variant="outline" disabled={saving}>
              Mark as Paid
            </Button>
          )}
          {(invoice?.status === "draft" || invoice?.status === "sent") && (
            <Button onClick={handleCancel} variant="outline" disabled={saving}>
              Cancel Invoice
            </Button>
          )}
          {invoice?.receipt_url && (
            <Button onClick={handleDownloadReceipt} variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Download Receipt
            </Button>
          )}
          {!isCreate && !isPaid && (
            <Button onClick={handleRefreshCompanyInfo} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Use Latest Company Info
            </Button>
          )}
          <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
          {!isPaid && (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isPaid ? (
          <div className="bg-background rounded-lg shadow-lg p-6 h-fit space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Payment Info</h2>
            {invoice.paid_at && (
              <p className="text-sm text-muted-foreground">
                Paid on {format(new Date(invoice.paid_at), "MMM dd, yyyy 'at' h:mm a")}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              This invoice is paid and can no longer be edited.
            </p>
          </div>
        ) : (
          <div className="bg-background rounded-lg shadow-lg p-6 h-fit space-y-8">
            <InvoiceForm data={data} onChange={setData} />

            <section className="space-y-4 border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="recurring-toggle">Recurring Invoice</Label>
                  <p className="text-xs text-muted-foreground">
                    Auto-generate a new invoice on this schedule from {data.date}.
                  </p>
                </div>
                <Switch id="recurring-toggle" checked={makeRecurring} onCheckedChange={setMakeRecurring} />
              </div>
              {makeRecurring && (
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </section>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-foreground">Live Preview</p>
          </div>
          <InvoicePreview data={data} paid={invoice?.status === "paid"} ref={previewRef} />
        </div>
      </div>

      {invoice && (
        <div className={offscreenClass}>
          <ReceiptPreview data={data} paidAt={invoice.paid_at ?? new Date().toISOString()} ref={receiptRef} />
        </div>
      )}
    </div>
  );
};

export default InvoiceEditor;
