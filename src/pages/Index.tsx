import { useState, useRef } from "react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Index = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
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
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
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
