import { InvoiceData } from "@/types/invoice";
import { calculateTotal, formatCurrency } from "@/lib/invoiceCalc";
import { format } from "date-fns";
import logo from "@/assets/avyukt-logo.webp";
import { forwardRef } from "react";

interface ReceiptPreviewProps {
  data: InvoiceData;
  paidAt: string;
}

export const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(({ data, paidAt }, ref) => {
  const total = calculateTotal(data);

  return (
    <div ref={ref} className="p-8 max-w-2xl mx-auto bg-white">
      <div className="flex justify-between items-start mb-8">
        <img src={logo} alt={data.companyName} className="h-16 object-contain" />
        <div className="text-right">
          <h1 className="text-2xl font-bold text-foreground">Payment Receipt</h1>
          <p className="text-sm text-muted-foreground">Receipt #{data.invoiceNumber}-R</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <p className="font-semibold text-foreground mb-1">{data.companyName}</p>
          <p className="text-muted-foreground">{data.companyAddress}</p>
          <p className="text-muted-foreground">
            {data.companyCity}, {data.companyState} - {data.companyZip}
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-1">Received From</p>
          <p className="text-muted-foreground">{data.clientName}</p>
          {data.clientEmail && <p className="text-muted-foreground">{data.clientEmail}</p>}
        </div>
      </div>

      <div className="p-4 bg-invoice-header rounded-lg mb-8 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Invoice #</span>
          <span className="font-medium text-foreground">{data.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date Paid</span>
          <span className="font-medium text-foreground">{format(new Date(paidAt), "MMM dd, yyyy")}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-invoice-border">
          <span className="font-semibold text-foreground">Amount Paid</span>
          <span className="font-bold text-primary">{formatCurrency(total)}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        This is a computer-generated receipt and does not require a physical signature.
      </p>
    </div>
  );
});

ReceiptPreview.displayName = "ReceiptPreview";
