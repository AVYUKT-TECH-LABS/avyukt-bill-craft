import { InvoiceData } from "@/types/invoice";

export const calculateItemTotal = (quantity: number, price: number) => quantity * price;

export const calculateSubtotal = (data: InvoiceData) =>
  data.items.reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.price), 0);

export const calculateTaxableSubtotal = (data: InvoiceData) =>
  data.items
    .filter((item) => item.taxable !== false)
    .reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.price), 0);

export const calculateTaxAmount = (taxable: number, rate: number) => (taxable * rate) / 100;

const isIntraState = (data: InvoiceData) =>
  !!data.clientState && data.clientState.trim().toLowerCase() === "delhi";

export const calculateTotal = (data: InvoiceData) => {
  const intraState = isIntraState(data);
  const subtotal = calculateSubtotal(data);
  const taxableSubtotal = calculateTaxableSubtotal(data);
  const cgstAmount = calculateTaxAmount(taxableSubtotal, intraState ? data.cgst : 0);
  const sgstAmount = calculateTaxAmount(taxableSubtotal, intraState ? data.sgst : 0);
  const igstAmount = calculateTaxAmount(taxableSubtotal, intraState ? 0 : data.igst);
  return subtotal + cgstAmount + sgstAmount + igstAmount;
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
