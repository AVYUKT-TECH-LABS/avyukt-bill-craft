export interface InvoiceItem {
  id: string;
  description: string;
  hsnSac?: string;
  quantity: number;
  price: number;
  taxable: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  
  // Company details
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;
  companyGSTIN?: string;
  companyPAN?: string;
  companyCIN?: string;
  
  // Client details
  clientName: string;
  clientEmail: string;
  clientGSTIN?: string;
  clientAddress?: string;
  clientState?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Tax settings
  cgst: number;
  sgst: number;
  igst: number;
  
  // Bank details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  
  // Payment link (optional)
  paymentLink?: string;
  
  // Signature (optional)
  signature?: string;
  
  // Notes/Terms
  notes?: string;
}
