import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { useRef } from "react";

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export const InvoiceForm = ({ data, onChange }: InvoiceFormProps) => {
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof InvoiceData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, signature: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = () => {
    onChange({ ...data, signature: undefined });
    if (signatureInputRef.current) {
      signatureInputRef.current.value = "";
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number | boolean) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const handleTaxChange = (field: "cgst" | "sgst" | "igst", value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...data, [field]: numValue });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0,
      taxable: true,
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-8">
      {/* Invoice Details */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={data.invoiceNumber}
              onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
              placeholder="AVTL072901"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={data.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={data.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Company Details */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Your Company Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              placeholder="AVYUKT TECH LABS PRIVATE LIMITED"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Address</Label>
            <Input
              id="companyAddress"
              value={data.companyAddress}
              onChange={(e) => handleInputChange("companyAddress", e.target.value)}
              placeholder="A-7, Flat no. 8, 2nd Floor, Jawahar Park"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyCity">City</Label>
            <Input
              id="companyCity"
              value={data.companyCity}
              onChange={(e) => handleInputChange("companyCity", e.target.value)}
              placeholder="New Delhi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyState">State</Label>
            <Input
              id="companyState"
              value={data.companyState}
              onChange={(e) => handleInputChange("companyState", e.target.value)}
              placeholder="Delhi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyZip">ZIP Code</Label>
            <Input
              id="companyZip"
              value={data.companyZip}
              onChange={(e) => handleInputChange("companyZip", e.target.value)}
              placeholder="110062"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyPhone">Phone</Label>
            <Input
              id="companyPhone"
              value={data.companyPhone}
              onChange={(e) => handleInputChange("companyPhone", e.target.value)}
              placeholder="8178392040"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Email</Label>
            <Input
              id="companyEmail"
              type="email"
              value={data.companyEmail}
              onChange={(e) => handleInputChange("companyEmail", e.target.value)}
              placeholder="divyansh@avyuktlabs.in"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyGSTIN">GSTIN (Optional)</Label>
            <Input
              id="companyGSTIN"
              value={data.companyGSTIN || ""}
              onChange={(e) => handleInputChange("companyGSTIN", e.target.value)}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyPAN">PAN (Optional)</Label>
            <Input
              id="companyPAN"
              value={data.companyPAN || ""}
              onChange={(e) => handleInputChange("companyPAN", e.target.value)}
              placeholder="AAAAA0000A"
            />
          </div>
        </div>
      </section>

      {/* Client Details */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Bill To</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={data.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              placeholder="Client Company Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={data.clientEmail}
              onChange={(e) => handleInputChange("clientEmail", e.target.value)}
              placeholder="client@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientGSTIN">Client GSTIN (Optional)</Label>
            <Input
              id="clientGSTIN"
              value={data.clientGSTIN || ""}
              onChange={(e) => handleInputChange("clientGSTIN", e.target.value)}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientAddress">Client Address (Optional)</Label>
            <Input
              id="clientAddress"
              value={data.clientAddress || ""}
              onChange={(e) => handleInputChange("clientAddress", e.target.value)}
              placeholder="Full Address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientState">Client State (Optional)</Label>
            <Input
              id="clientState"
              value={data.clientState || ""}
              onChange={(e) => handleInputChange("clientState", e.target.value)}
              placeholder="State Name"
            />
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Items</h2>
          <Button onClick={addItem} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div key={item.id} className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[200px] space-y-2">
                <Label htmlFor={`item-desc-${index}`}>Description</Label>
                <Input
                  id={`item-desc-${index}`}
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  placeholder="Service or product description"
                />
              </div>
              <div className="w-32 space-y-2">
                <Label htmlFor={`item-hsn-${index}`}>HSN/SAC</Label>
                <Input
                  id={`item-hsn-${index}`}
                  value={item.hsnSac || ""}
                  onChange={(e) => handleItemChange(index, "hsnSac", e.target.value)}
                  placeholder="998314"
                />
              </div>
              <div className="w-24 space-y-2">
                <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                <Input
                  id={`item-qty-${index}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="w-32 space-y-2">
                <Label htmlFor={`item-price-${index}`}>Price (₹)</Label>
                <Input
                  id={`item-price-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="w-28 space-y-2">
                <Label htmlFor={`item-tax-${index}`} className="text-xs">Taxable (GST)</Label>
                <div className="h-10 flex items-center gap-2 px-3 border border-input rounded-md bg-background">
                  <input
                    id={`item-tax-${index}`}
                    type="checkbox"
                    checked={item.taxable !== false}
                    onChange={(e) => handleItemChange(index, "taxable", e.target.checked as unknown as number)}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.taxable !== false ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => removeItem(index)}
                size="icon"
                variant="destructive"
                disabled={data.items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Tax Settings */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">GST/Tax Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cgst">CGST (%)</Label>
            <Input
              id="cgst"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={data.cgst}
              onChange={(e) => handleTaxChange("cgst", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sgst">SGST (%)</Label>
            <Input
              id="sgst"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={data.sgst}
              onChange={(e) => handleTaxChange("sgst", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="igst">IGST (%)</Label>
            <Input
              id="igst"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={data.igst}
              onChange={(e) => handleTaxChange("igst", e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Note: Use CGST + SGST for intra-state or IGST for inter-state transactions
        </p>
      </section>

      {/* Bank Details */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Bank Details (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={data.bankName || ""}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              placeholder="Bank Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={data.accountNumber || ""}
              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              placeholder="1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              value={data.ifscCode || ""}
              onChange={(e) => handleInputChange("ifscCode", e.target.value)}
              placeholder="SBIN0001234"
            />
          </div>
        </div>
      </section>

      {/* Payment Link */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Payment Link (Optional)</h2>
        <div className="space-y-2">
          <Label htmlFor="paymentLink">Payment URL</Label>
          <Input
            id="paymentLink"
            type="url"
            value={data.paymentLink || ""}
            onChange={(e) => handleInputChange("paymentLink", e.target.value)}
            placeholder="https://payments.cashfree.com/links?code=..."
          />
        </div>
      </section>

      {/* Signature Upload */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Authorized Signatory (Optional)</h2>
        <div className="space-y-3">
          {data.signature ? (
            <div className="relative inline-block">
              <img
                src={data.signature}
                alt="Signature"
                className="h-24 border border-border rounded-lg bg-background"
              />
              <Button
                onClick={removeSignature}
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div>
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="hidden"
                id="signature-upload"
              />
              <Button
                onClick={() => signatureInputRef.current?.click()}
                variant="outline"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Signature
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Notes/Terms */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Notes/Terms (Optional)</h2>
        <div className="space-y-2">
          <Label htmlFor="notes">Terms and Conditions</Label>
          <Input
            id="notes"
            value={data.notes || ""}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Payment terms, delivery notes, etc."
          />
        </div>
      </section>
    </div>
  );
};
