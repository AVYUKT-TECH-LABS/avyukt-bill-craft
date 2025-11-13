import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { InvoiceData, InvoiceItem } from "@/types/invoice";

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export const InvoiceForm = ({ data, onChange }: InvoiceFormProps) => {
  const handleInputChange = (field: keyof InvoiceData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0,
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyEmail">Email</Label>
            <Input
              id="companyEmail"
              type="email"
              value={data.companyEmail}
              onChange={(e) => handleInputChange("companyEmail", e.target.value)}
              placeholder="divyansh@avyuktlabs.in"
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
            <div key={item.id} className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`item-desc-${index}`}>Description</Label>
                <Input
                  id={`item-desc-${index}`}
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  placeholder="Service or product description"
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
    </div>
  );
};
