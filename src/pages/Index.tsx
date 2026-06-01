import { useState, useRef, useEffect } from "react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { FileDown, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const STORAGE_KEY = "avyukt_invoice_data";

const getDefaultInvoiceData = (): InvoiceData => ({
  invoiceNumber: "AVTL" + new Date().getTime().toString().slice(-6),
  date: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  companyName: "AVYUKT TECH LABS PRIVATE LIMITED",
  companyAddress: "A-7, Flat no. 8, 2nd Floor, Jawahar Park, Khapnur",
  companyCity: "New Delhi",
  companyState: "Delhi",
  companyZip: "110062",
  companyPhone: "8178392040",
  companyEmail: "divyansh@avyuktlabs.in",
  clientName: "",
  clientEmail: "",
  items: [
    {
      id: "1",
      description: "",
      hsnSac: "",
      quantity: 1,
      price: 0,
      taxable: true,
    },
  ],
  cgst: 9,
  sgst: 9,
  igst: 0,
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  paymentLink: "",
  notes: "",
});

const Index = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...getDefaultInvoiceData(), ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to load saved invoice", e);
    }
    return getDefaultInvoiceData();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoiceData));
    } catch (e) {
      console.error("Failed to save invoice", e);
    }
  }, [invoiceData]);

  const handleReset = () => {
    if (confirm("Reset the form to default values? Your current changes will be lost.")) {
      localStorage.removeItem(STORAGE_KEY);
      setInvoiceData(getDefaultInvoiceData());
      toast.success("Form reset to defaults");
    }
  };

  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      toast.loading("Generating PDF...");
      
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Scale to fit full width of PDF
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        Math.min(scaledHeight, pdfHeight)
      );

      pdf.save(`Invoice_${invoiceData.invoiceNumber}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Invoice Generator</h1>
              <p className="text-sm text-muted-foreground">Create professional invoices in seconds</p>
            </div>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <FileDown className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Side by Side */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-background rounded-lg shadow-lg p-6 h-fit sticky top-24">
            <InvoiceForm data={invoiceData} onChange={setInvoiceData} />
          </div>

          {/* Live Preview Section */}
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-foreground">Live Preview</p>
            </div>
            <div>
              <InvoicePreview data={invoiceData} ref={previewRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
