import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ScanResult } from "./heuristics";

export function generateScanReport(result: ScanResult) {
  const doc = new jsPDF();
  const statusLabel = result.status === "safe" ? "SAFE" : result.status === "warning" ? "WARNING" : "DANGEROUS";
  const statusColor: [number, number, number] = result.status === "safe" ? [34, 197, 94] : result.status === "warning" ? [245, 158, 11] : [239, 68, 68];

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SecureSurf", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("URL Threat Analysis Report", 15, 26);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date(result.timestamp).toLocaleString()}`, 15, 33);

  // Threat Score Box
  doc.setFillColor(...statusColor);
  doc.roundedRect(140, 8, 55, 24, 3, 3, "F");
  doc.setTextColor(255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.threatScore}`, 155, 22, { align: "center" });
  doc.setFontSize(9);
  doc.text(statusLabel, 155, 29, { align: "center" });

  // URL
  doc.setTextColor(30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Scanned URL:", 15, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(result.url, 15, 58, { maxWidth: 180 });

  // AI Analysis
  let y = 70;
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(15, y - 5, 180, 30, 2, 2, "F");
  doc.setTextColor(120, 80, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("AI Analysis", 20, y + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80);
  const lines = doc.splitTextToSize(result.aiExplanation, 170);
  doc.text(lines, 20, y + 9);
  y += 35;

  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(result.aiRecommendation, 15, y);
  y += 10;

  // Heuristic Analysis
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Heuristic Analysis", 15, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Check", "Description", "Severity", "Score"]],
    body: result.heuristics.map((h) => [h.name, h.description, h.severity.toUpperCase(), `${h.score}`]),
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: { 2: { fontStyle: "bold" } },
    margin: { left: 15, right: 15 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Domain Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Domain Intelligence", 15, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Property", "Value"]],
    body: Object.entries(result.domainInfo).map(([k, v]) => [k.replace(/([A-Z])/g, " $1").trim(), String(v)]),
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 15, right: 15 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // API Intel + HTTPS
  if (y < 240) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("API Intelligence & HTTPS", 15, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Source", "Status"]],
      body: [
        ["PhishTank", result.apiIntel.phishTank.detail],
        ["VirusTotal", result.apiIntel.virusTotal.detail],
        ["MalwareBazaar", result.apiIntel.malwareBazaar.detail],
        ["HTTPS Issuer", result.httpsInfo.issuer],
        ["HTTPS Grade", result.httpsInfo.grade],
        ["Certificate Expiry", result.httpsInfo.expiry],
      ],
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 15, right: 15 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`SecureSurf Report — Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
  }

  doc.save(`securesurf-report-${Date.now()}.pdf`);
}
