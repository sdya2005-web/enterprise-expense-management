import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data, fileName = 'Enterprise_Expense_Report.xlsx', sheetName = 'Expenses') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error('Excel Export Error:', err);
    alert('Failed to export Excel file.');
  }
};

export const exportToPDF = (title, headers, rows, fileName = 'Enterprise_Expense_Report.pdf') => {
  try {
    const doc = new jsPDF('landscape');
    
    // Header banner
    doc.setFillColor(108, 60, 232); // #6C3CE8
    doc.rect(0, 0, 297, 22, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ENTERPRISE EXPENSE MANAGEMENT SYSTEM', 14, 14);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(title, 14, 32);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Enterprise SpendFlow Analytics`, 14, 38);

    autoTable(doc, {
      startY: 44,
      head: [headers],
      body: rows,
      headStyles: {
        fillColor: [108, 60, 232],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    doc.save(fileName);
  } catch (err) {
    console.error('PDF Export Error:', err);
    alert('Failed to export PDF file.');
  }
};
