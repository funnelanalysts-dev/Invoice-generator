import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Invoice, UserProfile } from '../types/invoice';

export const generateInvoicePDF = (invoice: Invoice, profile: UserProfile | null) => {
  const doc = new jsPDF();
  const margin = 25;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Apple Design Language: Minimalist, High Contrast, Whitespace
  const black: [number, number, number] = [0, 0, 0];
  const grayDark: [number, number, number] = [60, 60, 60];
  const grayMedium: [number, number, number] = [140, 140, 140];
  const grayLight: [number, number, number] = [245, 245, 247]; // Apple's light gray background
  const dividerColor: [number, number, number] = [230, 230, 230];

  // 1. Header Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text('Invoice', margin, 40);

  // Invoice Meta (Top Right)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(grayMedium[0], grayMedium[1], grayMedium[2]);
  doc.text('NUMBER', pageWidth - margin, 32, { align: 'right' });
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber, pageWidth - margin, 40, { align: 'right' });

  // Divider
  doc.setDrawColor(dividerColor[0], dividerColor[1], dividerColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, 50, pageWidth - margin, 50);

  // 2. Address Section
  const addressY = 65;
  
  // From (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(grayMedium[0], grayMedium[1], grayMedium[2]);
  doc.text('FROM', margin, addressY);
  
  doc.setFontSize(11);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text(profile?.companyName || profile?.displayName || 'Your Company', margin, addressY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(grayDark[0], grayDark[1], grayDark[2]);
  const fromLines = [
    profile?.address || '',
    profile?.email || '',
    profile?.phone || ''
  ].filter(Boolean);
  
  fromLines.forEach((line, i) => {
    doc.text(line, margin, addressY + 16 + (i * 6));
  });

  // To (Middle-Right)
  const toX = pageWidth * 0.55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(grayMedium[0], grayMedium[1], grayMedium[2]);
  doc.text('BILL TO', toX, addressY);
  
  doc.setFontSize(11);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text(invoice.clientName, toX, addressY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(grayDark[0], grayDark[1], grayDark[2]);
  const toLines = [
    invoice.clientAddress || '',
    invoice.clientEmail || '',
    invoice.clientPhone || ''
  ].filter(Boolean);
  
  toLines.forEach((line, i) => {
    doc.text(line, toX, addressY + 16 + (i * 6));
  });

  // 3. Dates Section (Horizontal Row)
  const datesY = 110;
  doc.setDrawColor(dividerColor[0], dividerColor[1], dividerColor[2]);
  doc.line(margin, datesY, pageWidth - margin, datesY);

  const colWidth = (pageWidth - (margin * 2)) / 3;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(grayMedium[0], grayMedium[1], grayMedium[2]);
  doc.text('DATE ISSUED', margin, datesY + 10);
  doc.text('DUE DATE', margin + colWidth, datesY + 10);
  doc.text('STATUS', margin + (colWidth * 2), datesY + 10);

  doc.setFontSize(10);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text(format(new Date(invoice.date.seconds * 1000), 'MMMM dd, yyyy'), margin, datesY + 18);
  doc.text(format(new Date(invoice.dueDate.seconds * 1000), 'MMMM dd, yyyy'), margin + colWidth, datesY + 18);
  doc.text(invoice.status.toUpperCase(), margin + (colWidth * 2), datesY + 18);

  // 4. Items Table
  const tableData = invoice.items.map((item) => [
    item.description,
    item.quantity.toString(),
    `${invoice.currency} ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    `${invoice.currency} ${(item.quantity * item.price * (1 + item.tax / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: datesY + 30,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      textColor: grayMedium,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: { bottom: 5, top: 0, left: 0, right: 0 }
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 40 },
      3: { halign: 'right', cellWidth: 40, fontStyle: 'bold' }
    },
    styles: {
      fontSize: 10,
      cellPadding: { top: 8, bottom: 8, left: 0, right: 0 },
      textColor: black,
      lineColor: dividerColor,
      lineWidth: { bottom: 0.1 }
    },
    margin: { left: margin, right: margin },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 180;

  // 5. Totals Section
  const summaryWidth = 80;
  const summaryX = pageWidth - margin - summaryWidth;
  
  const drawSummaryLine = (label: string, value: string, y: number, isTotal = false) => {
    doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
    doc.setFontSize(isTotal ? 14 : 10);
    doc.setTextColor(isTotal ? black[0] : grayDark[0], isTotal ? black[1] : grayDark[1], isTotal ? black[2] : grayDark[2]);
    doc.text(label, summaryX, y);
    doc.text(value, pageWidth - margin, y, { align: 'right' });
  };

  let currentY = finalY + 20;
  drawSummaryLine('Subtotal', `${invoice.currency} ${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, currentY);
  
  currentY += 8;
  drawSummaryLine('Tax', `${invoice.currency} ${invoice.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, currentY);

  if (invoice.discount > 0) {
    currentY += 8;
    doc.setTextColor(220, 38, 38);
    drawSummaryLine('Discount', `-${invoice.currency} ${invoice.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, currentY);
  }

  currentY += 15;
  doc.setDrawColor(black[0], black[1], black[2]);
  doc.setLineWidth(1);
  doc.line(summaryX, currentY - 8, pageWidth - margin, currentY - 8);
  drawSummaryLine('Balance Due', `${invoice.currency} ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, currentY, true);

  // 6. Footer Section
  if (invoice.notes || invoice.terms) {
    const footerY = Math.max(currentY + 40, pageHeight - 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(grayMedium[0], grayMedium[1], grayMedium[2]);
    doc.text('NOTES', margin, footerY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(grayDark[0], grayDark[1], grayDark[2]);
    const notesText = [invoice.notes, invoice.terms].filter(Boolean).join('\n\n');
    doc.text(notesText, margin, footerY + 8, { maxWidth: pageWidth - (margin * 2) });
  }

  // Final Branding
  doc.setFontSize(8);
  doc.setTextColor(grayMedium[0], grayMedium[1], grayMedium[2]);
  doc.text('Thank you for your business.', margin, pageHeight - 15);
  doc.text('Invoicely', pageWidth - margin, pageHeight - 15, { align: 'right' });

  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};
