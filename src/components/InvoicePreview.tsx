import { InvoiceData } from "@/types/invoice";
import { format } from "date-fns";
import logo from "@/assets/avyukt-logo.webp";

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview = ({ data }: InvoicePreviewProps) => {
  const calculateItemTotal = (quantity: number, price: number) => {
    return quantity * price;
  };

  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.price), 0);
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

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-8 max-w-4xl mx-auto relative overflow-hidden">
      {/* Watermark */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.08 }}
      >
        <img 
          src={logo} 
          alt="Watermark" 
          className="w-[600px] h-auto object-contain"
        />
      </div>

      {/* Content - with relative positioning to appear above watermark */}
      <div className="relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="AVYUKT TECH LABS" className="h-16 object-contain" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-6">Invoice</h1>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">{data.companyName}</p>
            <p className="text-sm text-muted-foreground">{data.companyAddress}</p>
            <p className="text-sm text-muted-foreground">
              {data.companyCity}, {data.companyState} - {data.companyZip}
            </p>
            <p className="text-sm text-muted-foreground">IN</p>
            <p className="text-sm text-muted-foreground">{data.companyPhone}</p>
            <p className="text-sm text-muted-foreground">{data.companyEmail}</p>
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
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Bill To</h2>
        <p className="text-lg font-semibold text-foreground">{data.clientName}</p>
        <p className="text-sm text-muted-foreground">{data.clientEmail}</p>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-3 text-sm font-semibold text-foreground">Item</th>
              <th className="text-right py-3 text-sm font-semibold text-foreground w-24">Quantity</th>
              <th className="text-right py-3 text-sm font-semibold text-foreground w-32">Price</th>
              <th className="text-right py-3 text-sm font-semibold text-foreground w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="border-b border-invoice-border">
                <td className="py-4 text-sm text-foreground">{item.description}</td>
                <td className="py-4 text-sm text-right text-foreground">{item.quantity}</td>
                <td className="py-4 text-sm text-right text-foreground">{formatCurrency(item.price)}</td>
                <td className="py-4 text-sm text-right text-foreground">
                  {formatCurrency(calculateItemTotal(item.quantity, item.price))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80 space-y-2">
          <div className="flex justify-between py-2 border-b border-invoice-border">
            <span className="text-sm font-medium text-foreground">Subtotal</span>
            <span className="text-sm font-medium text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-border">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-base font-semibold text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-lg font-bold text-foreground">Amount Due</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>

      {/* Payment Link */}
      {data.paymentLink && (
        <div className="mb-8 p-4 bg-invoice-header rounded-lg">
          <p className="text-sm font-medium text-foreground mb-1">Payment Link:</p>
          <a
            href={data.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {data.paymentLink}
          </a>
        </div>
      )}

        {/* Footer */}
        <div className="flex justify-between items-end pt-8 border-t border-border">
          <div className="text-center">
            {data.signature && (
              <div className="mb-2">
                <img src={data.signature} alt="Company Signature" className="h-16 mx-auto" />
              </div>
            )}
            <div className="border-t-2 border-foreground w-48 mb-2"></div>
            <p className="text-sm font-medium text-foreground">{data.companyName}</p>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-foreground w-48 mb-2 mt-16"></div>
            <p className="text-sm font-medium text-foreground">{data.clientName}</p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">{formatDate(data.date)}</p>
        </div>
      </div>
    </div>
  );
};
