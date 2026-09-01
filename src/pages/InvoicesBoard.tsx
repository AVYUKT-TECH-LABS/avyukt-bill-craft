import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  getAllInvoicesWithContext,
  setInvoiceStatus,
  uploadReceipt,
  setInvoiceReceiptUrl,
  InvoiceWithContext,
  InvoiceStatus,
  Invoice,
} from "@/lib/api";
import { calculateTotal, formatCurrency } from "@/lib/invoiceCalc";
import { renderElementToPdf, offscreenClass } from "@/lib/pdf";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { toast } from "sonner";

type Column = "draft" | "sent" | "overdue" | "paid" | "cancelled";

const COLUMNS: { key: Column; title: string }[] = [
  { key: "draft", title: "Draft" },
  { key: "sent", title: "Sent" },
  { key: "overdue", title: "Overdue" },
  { key: "paid", title: "Paid" },
  { key: "cancelled", title: "Cancelled" },
];

// "Overdue" is a view of sent invoices past their due date, not a real status.
const targetStatus = (column: Column): InvoiceStatus => (column === "overdue" ? "sent" : column);

const columnOf = (invoice: Invoice, today: string): Column => {
  if (invoice.status === "sent" && invoice.due_date < today) return "overdue";
  return invoice.status;
};

const InvoicesBoard = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingReceipt, setPendingReceipt] = useState<Invoice | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllInvoicesWithContext()
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!pendingReceipt) return;
    const generate = async () => {
      if (!receiptRef.current) return;
      try {
        const pdf = await renderElementToPdf(receiptRef.current);
        const blob = pdf.output("blob");
        const path = await uploadReceipt(pendingReceipt.id, blob);
        const withReceipt = await setInvoiceReceiptUrl(pendingReceipt.id, path);
        setInvoices((prev) => prev.map((i) => (i.id === withReceipt.id ? { ...i, ...withReceipt } : i)));
        toast.success(`${pendingReceipt.invoice_number} marked paid, receipt generated`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Marked paid, but receipt generation failed");
      } finally {
        setPendingReceipt(null);
      }
    };
    generate();
  }, [pendingReceipt]);

  const today = format(new Date(), "yyyy-MM-dd");

  const handleDrop = async (e: React.DragEvent, targetColumn: Column) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice) return;
    const desired = targetStatus(targetColumn);
    if (desired === invoice.status) return; // no-op, e.g. dragging within Sent/Overdue

    if (desired === "paid") {
      if (!confirm(`Mark invoice ${invoice.invoice_number} as paid? This will also generate a receipt.`)) return;
      try {
        const updated = await setInvoiceStatus(invoice.id, "paid");
        setInvoices((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
        setPendingReceipt(updated);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to mark paid");
      }
      return;
    }

    try {
      const updated = await setInvoiceStatus(invoice.id, desired);
      setInvoices((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
      toast.success(`${invoice.invoice_number} marked ${desired}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update invoice");
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Invoices</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {COLUMNS.map((column) => {
          const columnInvoices = invoices.filter((i) => columnOf(i, today) === column.key);
          return (
            <div
              key={column.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, column.key)}
              className="bg-muted/30 rounded-lg p-3 space-y-3 min-h-[200px]"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
                <span className="text-xs text-muted-foreground">{columnInvoices.length}</span>
              </div>
              <div className="space-y-2">
                {columnInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", invoice.id)}
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    className="bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground">{invoice.invoice_number}</p>
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(calculateTotal(invoice.data))}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {invoice.projects?.clients?.name} &middot; {invoice.projects?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                ))}
                {columnInvoices.length === 0 && (
                  <p className="text-xs text-muted-foreground px-1">No invoices</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pendingReceipt && (
        <div className={offscreenClass}>
          <ReceiptPreview
            data={pendingReceipt.data}
            paidAt={pendingReceipt.paid_at ?? new Date().toISOString()}
            ref={receiptRef}
          />
        </div>
      )}
    </div>
  );
};

export default InvoicesBoard;
