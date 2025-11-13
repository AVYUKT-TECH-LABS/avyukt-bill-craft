import { useState, useRef } from "react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { FileDown, Eye, Edit } from "lucide-react";
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
        quantity: 1,
        price: 0,
      },
    ],
    paymentLink: "",
  });

  const [showPreview, setShowPreview] = useState(false);
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
            <div className="flex gap-2">
              {showPreview ? (
                <>
                  <Button onClick={() => setShowPreview(false)} variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button onClick={handleDownloadPDF} className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Download PDF
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowPreview(true)} className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {showPreview ? (
          <div ref={previewRef} className="mb-8">
            <InvoicePreview data={invoiceData} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-background rounded-lg shadow-lg p-8">
            <InvoiceForm data={invoiceData} onChange={setInvoiceData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
