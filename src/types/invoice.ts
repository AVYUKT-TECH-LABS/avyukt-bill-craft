export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
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
  
  // Client details
  clientName: string;
  clientEmail: string;
  
  // Items
  items: InvoiceItem[];
  
  // Payment link (optional)
  paymentLink?: string;
}
