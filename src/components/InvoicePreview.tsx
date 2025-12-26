import { InvoiceData } from "@/types/invoice";
import { format } from "date-fns";
import logo from "@/assets/avyukt-logo.webp";
import { forwardRef } from "react";

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(({ data }, ref) => {
  const calculateItemTotal = (quantity: number, price: number) => {
    return quantity * price;
  };

  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.price), 0);
  };

  const calculateTaxAmount = (subtotal: number, rate: number) => {
    return (subtotal * rate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const cgstAmount = calculateTaxAmount(subtotal, data.cgst);
    const sgstAmount = calculateTaxAmount(subtotal, data.sgst);
    const igstAmount = calculateTaxAmount(subtotal, data.igst);
    return subtotal + cgstAmount + sgstAmount + igstAmount;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const subtotal = calculateSubtotal();
  const cgstAmount = calculateTaxAmount(subtotal, data.cgst);
  const sgstAmount = calculateTaxAmount(subtotal, data.sgst);
  const igstAmount = calculateTaxAmount(subtotal, data.igst);
  const total = calculateTotal();

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg overflow-hidden">
      {/* PDF Content - this part gets captured */}
      <div ref={ref} className="p-8 max-w-4xl mx-auto relative bg-white">
        {/* Watermark */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.15 }}
        >
          <img 
            src={logo} 
            alt="Watermark" 
            className="w-[420px] h-auto object-contain"
          />
        </div>

        {/* Content - with relative positioning to appear above watermark */}
        <div className="relative z-10">
        {/* Header with Logo */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <img src={logo} alt="AVYUKT TECH LABS" className="h-16 object-contain mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Tax Invoice</h1>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-foreground">{data.companyName}</p>
              <p className="text-muted-foreground">{data.companyAddress}</p>
              <p className="text-muted-foreground">
                {data.companyCity}, {data.companyState} - {data.companyZip}
              </p>
              {data.companyGSTIN && (
                <p className="text-muted-foreground">
                  <span className="font-medium">GSTIN:</span> {data.companyGSTIN}
                </p>
              )}
              {data.companyPAN && (
                <p className="text-muted-foreground">
                  <span className="font-medium">PAN:</span> {data.companyPAN}
                </p>
              )}
              <p className="text-muted-foreground">
                <span className="font-medium">Phone:</span> {data.companyPhone}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Email:</span> {data.companyEmail}
              </p>
            </div>
        </div>
        <div className="text-right space-y-2">
          <div className="bg-invoice-header p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Invoice #</p>
            <p className="text-lg font-semibold text-foreground">{data.invoiceNumber}</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-8">
              <span className="text-sm text-muted-foreground">Date:</span>
              <span className="text-sm font-medium text-foreground">{formatDate(data.date)}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-sm text-muted-foreground">Due date:</span>
              <span className="text-sm font-medium text-foreground">{formatDate(data.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

        {/* Bill To */}
        <div className="mb-8 p-4 bg-invoice-header rounded-lg">
          <h2 className="text-sm font-semibold text-foreground uppercase mb-3">Bill To</h2>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">{data.clientName}</p>
            {data.clientAddress && (
              <p className="text-muted-foreground">{data.clientAddress}</p>
            )}
            {data.clientState && (
              <p className="text-muted-foreground">{data.clientState}</p>
            )}
            {data.clientGSTIN && (
              <p className="text-muted-foreground">
                <span className="font-medium">GSTIN:</span> {data.clientGSTIN}
              </p>
            )}
            <p className="text-muted-foreground">
              <span className="font-medium">Email:</span> {data.clientEmail}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-invoice-header">
                <th className="text-left py-3 px-4 text-xs font-semibold text-foreground uppercase">Description</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-foreground uppercase w-24">HSN/SAC</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-foreground uppercase w-20">Qty</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-foreground uppercase w-28">Rate</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-foreground uppercase w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id} className="border-b border-invoice-border">
                  <td className="py-4 px-4 text-sm text-foreground">{item.description}</td>
                  <td className="py-4 px-4 text-sm text-center text-foreground">{item.hsnSac || "-"}</td>
                  <td className="py-4 px-4 text-sm text-center text-foreground">{item.quantity}</td>
                  <td className="py-4 px-4 text-sm text-right text-foreground">{formatCurrency(item.price)}</td>
                  <td className="py-4 px-4 text-sm text-right font-medium text-foreground">
                    {formatCurrency(calculateItemTotal(item.quantity, item.price))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-96 space-y-1">
            <div className="flex justify-between py-2 px-4 text-sm">
              <span className="font-medium text-foreground">Taxable Amount</span>
              <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            {data.cgst > 0 && (
              <div className="flex justify-between py-2 px-4 bg-invoice-header text-sm">
                <span className="text-muted-foreground">CGST @ {data.cgst}%</span>
                <span className="text-foreground">{formatCurrency(cgstAmount)}</span>
              </div>
            )}
            {data.sgst > 0 && (
              <div className="flex justify-between py-2 px-4 bg-invoice-header text-sm">
                <span className="text-muted-foreground">SGST @ {data.sgst}%</span>
                <span className="text-foreground">{formatCurrency(sgstAmount)}</span>
              </div>
            )}
            {data.igst > 0 && (
              <div className="flex justify-between py-2 px-4 bg-invoice-header text-sm">
                <span className="text-muted-foreground">IGST @ {data.igst}%</span>
                <span className="text-foreground">{formatCurrency(igstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 px-4 border-t-2 border-border bg-primary/5">
              <span className="text-base font-bold text-foreground">Total Amount</span>
              <span className="text-base font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        {(data.bankName || data.accountNumber || data.ifscCode) && (
          <div className="mb-6 p-4 bg-invoice-header rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-2">Bank Details</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {data.bankName && (
                <div>
                  <p className="text-muted-foreground text-xs">Bank Name</p>
                  <p className="text-foreground font-medium">{data.bankName}</p>
                </div>
              )}
              {data.accountNumber && (
                <div>
                  <p className="text-muted-foreground text-xs">Account Number</p>
                  <p className="text-foreground font-medium">{data.accountNumber}</p>
                </div>
              )}
              {data.ifscCode && (
                <div>
                  <p className="text-muted-foreground text-xs">IFSC Code</p>
                  <p className="text-foreground font-medium">{data.ifscCode}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes/Terms */}
        {data.notes && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-xs font-semibold text-foreground mb-1">Terms & Conditions</p>
            <p className="text-xs text-muted-foreground">{data.notes}</p>
          </div>
        )}

        {/* Payment Link */}
        {data.paymentLink && (
          <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-foreground mb-1">Payment Link:</p>
            <a
              href={data.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline break-all font-medium"
            >
              {data.paymentLink}
            </a>
          </div>
        )}

        {/* Footer with Signature */}
        <div className="pt-8 border-t-2 border-border">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-4">
                This is a computer-generated invoice and does not require a physical signature.
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-foreground mb-2">For {data.companyName}</p>
              {data.signature && (
                <div className="mb-2">
                  <img src={data.signature} alt="Authorized Signatory" className="h-16 mx-auto" />
                </div>
              )}
              <div className="border-t-2 border-foreground w-48 mb-1 mt-8"></div>
              <p className="text-xs text-muted-foreground">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
});

InvoicePreview.displayName = "InvoicePreview";
