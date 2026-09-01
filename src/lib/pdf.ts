import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const renderElementToPdf = async (el: HTMLElement) => {
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const ratio = pdfWidth / canvas.width;
  const scaledHeight = canvas.height * ratio;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(scaledHeight, pdfHeight));
  return pdf;
};

// html2canvas needs real layout, so this must stay off-screen (not display:none) —
// position it far outside the viewport rather than hiding it.
export const offscreenClass = "absolute -left-[9999px] top-0";
