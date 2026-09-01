import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { addDays, format } from "date-fns";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceData } from "@/types/invoice";
import { nextInvoiceNumber } from "@/lib/invoiceNumber";
import {
  getProject,
  getClient,
  getCompanySettings,
  getInvoice,
  createInvoice,
  updateInvoiceData,
  countInvoicesOnDate,
  markInvoicePaid,
  uploadReceipt,
  setInvoiceReceiptUrl,
  getReceiptSignedUrl,
  createRecurringSchedule,
  getRecurringScheduleForInvoice,
  setRecurringScheduleActive,
  Invoice,
  RecurringSchedule,
} from "@/lib/api";
import { FileDown, Save } from "lucide-react";
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

  const renderToPdfBlob = async (el: HTMLDivElement) => {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = pdfWidth / canvas.width;
    const scaledHeight = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(scaledHeight, pdfHeight));
    return pdf;
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current || !data) return;
    try {
      toast.loading("Generating PDF...");
      const pdf = await renderToPdfBlob(previewRef.current);
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
      const paid = await markInvoicePaid(invoice.id);
      setInvoice(paid);

      if (receiptRef.current) {
        const pdf = await renderToPdfBlob(receiptRef.current);
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

  const handleDownloadReceipt = async () => {
    if (!invoice?.receipt_url) return;
    const url = await getReceiptSignedUrl(invoice.receipt_url);
    window.open(url, "_blank");
  };

  if (loading || !data) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isCreate ? "New Invoice" : `Invoice ${data.invoiceNumber}`}
          </h1>
          <button onClick={() => navigate(-1)} className="text-sm text-primary hover:underline">
            &larr; Back
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {invoice?.status === "unpaid" && (
            <Button onClick={handleMarkPaid} variant="outline" disabled={saving}>
              Mark as Paid
            </Button>
          )}
          {invoice?.receipt_url && (
            <Button onClick={handleDownloadReceipt} variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Download Receipt
            </Button>
          )}
          <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-foreground">Live Preview</p>
          </div>
          <InvoicePreview data={data} ref={previewRef} />
        </div>
      </div>

      {invoice && (
        <div className="hidden">
          <ReceiptPreview data={data} paidAt={invoice.paid_at ?? new Date().toISOString()} ref={receiptRef} />
        </div>
      )}
    </div>
  );
};

export default InvoiceEditor;
