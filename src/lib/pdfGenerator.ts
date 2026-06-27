/**
 * PDF Generation utilities for shipping labels and reports
 * This is a client-side implementation using browser print API
 */

export interface ShippingLabelData {
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderZip: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverZip: string;
  shipmentType?: string;
  shipmentDate?: string;
  estimatedDelivery?: string;
  vehicleInfo?: string;
  weight?: string;
  serviceType?: string;
}

export interface MonthlyReportData {
  month: string;
  year: string;
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  delayedShipments: number;
  cancelledShipments: number;
  revenue?: number;
  topRoutes?: Array<{ route: string; count: number }>;
  shipmentTypes?: Array<{ type: string; count: number }>;
}

/**
 * Generate shipping label HTML for printing/PDF
 */
export function generateShippingLabelHTML(data: ShippingLabelData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Shipping Label - ${data.trackingNumber}</title>
  <style>
    @media print {
      @page { margin: 0; }
      body { margin: 0; }
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20mm;
      background: white;
    }
    .label {
      width: 4in;
      height: 6in;
      border: 2px solid #000;
      padding: 10mm;
      box-sizing: border-box;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 5mm;
      margin-bottom: 5mm;
    }
    .logo {
      width: 60mm;
      height: auto;
      margin: 0 auto 3mm;
    }
    .company-name {
      font-size: 18pt;
      font-weight: bold;
      color: #0B1F3A;
      margin-bottom: 2mm;
    }
    .tracking {
      font-size: 24pt;
      font-weight: bold;
      text-align: center;
      margin: 5mm 0;
      padding: 3mm;
      background: #f0f0f0;
      border: 1px solid #000;
    }
    .barcode {
      text-align: center;
      font-family: 'Libre Barcode 128', monospace;
      font-size: 48pt;
      margin: 3mm 0;
    }
    .section {
      margin: 3mm 0;
      padding: 2mm;
      border: 1px solid #ccc;
    }
    .section-title {
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 1mm;
      color: #0B1F3A;
    }
    .address {
      font-size: 11pt;
      line-height: 1.3;
    }
    .details {
      font-size: 9pt;
      margin-top: 2mm;
    }
  </style>
</head>
<body>
  <div class="label">
    <div class="header">
      <img src="/logo-main.png" alt="Go Cargo Logistics" class="logo">
      <div class="company-name">GO CARGO LOGISTICS</div>
      <div style="font-size: 9pt;">support@gocargologisticsus.com | +1 (940) 238-4915</div>
    </div>
    
    <div class="tracking">${data.trackingNumber}</div>
    <div class="barcode">*${data.trackingNumber}*</div>
    
    <div class="section">
      <div class="section-title">FROM:</div>
      <div class="address">
        ${data.senderName}<br>
        ${data.senderAddress}<br>
        ${data.senderCity}, ${data.senderState} ${data.senderZip}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">TO:</div>
      <div class="address">
        ${data.receiverName}<br>
        ${data.receiverAddress}<br>
        ${data.receiverCity}, ${data.receiverState} ${data.receiverZip}
      </div>
    </div>
    
    <div class="details">
      ${data.shipmentType ? `<div><strong>Service:</strong> ${data.shipmentType}</div>` : ''}
      ${data.shipmentDate ? `<div><strong>Ship Date:</strong> ${data.shipmentDate}</div>` : ''}
      ${data.estimatedDelivery ? `<div><strong>Est. Delivery:</strong> ${data.estimatedDelivery}</div>` : ''}
      ${data.vehicleInfo ? `<div><strong>Vehicle:</strong> ${data.vehicleInfo}</div>` : ''}
      ${data.weight ? `<div><strong>Weight:</strong> ${data.weight}</div>` : ''}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Print shipping label
 */
export function printShippingLabel(data: ShippingLabelData) {
  const html = generateShippingLabelHTML(data);
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Download shipping label as PDF (using browser print to PDF)
 */
export function downloadShippingLabel(data: ShippingLabelData) {
  printShippingLabel(data);
  // Note: Browser's print dialog has "Save as PDF" option
}

/**
 * Generate monthly report HTML
 */
export function generateMonthlyReportHTML(data: MonthlyReportData): string {
  const chartData = data.shipmentTypes || [];
  const routesData = data.topRoutes || [];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Monthly Shipment Report - ${data.month} ${data.year}</title>
  <style>
    @media print {
      @page { margin: 15mm; }
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20mm;
      background: white;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0B1F3A;
      padding-bottom: 10mm;
      margin-bottom: 10mm;
    }
    .logo {
      width: 80mm;
      height: auto;
      margin: 0 auto 5mm;
    }
    .company-name {
      font-size: 24pt;
      font-weight: bold;
      color: #0B1F3A;
      margin-bottom: 2mm;
    }
    .report-title {
      font-size: 20pt;
      font-weight: bold;
      margin: 5mm 0;
    }
    .report-period {
      font-size: 14pt;
      color: #666;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5mm;
      margin: 10mm 0;
    }
    .stat-card {
      border: 2px solid #0B1F3A;
      padding: 5mm;
      text-align: center;
      border-radius: 3mm;
    }
    .stat-value {
      font-size: 32pt;
      font-weight: bold;
      color: #1E5AA8;
    }
    .stat-label {
      font-size: 11pt;
      color: #666;
      margin-top: 2mm;
    }
    .section {
      margin: 8mm 0;
    }
    .section-title {
      font-size: 16pt;
      font-weight: bold;
      color: #0B1F3A;
      margin-bottom: 3mm;
      padding-bottom: 2mm;
      border-bottom: 2px solid #e0e0e0;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 3mm;
    }
    .data-table th {
      background: #0B1F3A;
      color: white;
      padding: 3mm;
      text-align: left;
      font-size: 11pt;
    }
    .data-table td {
      padding: 2mm 3mm;
      border-bottom: 1px solid #e0e0e0;
      font-size: 10pt;
    }
    .footer {
      margin-top: 15mm;
      padding-top: 5mm;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="/logo-main.png" alt="Go Cargo Logistics" class="logo">
    <div class="company-name">GO CARGO LOGISTICS</div>
    <div class="report-title">Monthly Shipment Report</div>
    <div class="report-period">${data.month} ${data.year}</div>
  </div>
  
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${data.totalShipments}</div>
      <div class="stat-label">Total Shipments</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${data.deliveredShipments}</div>
      <div class="stat-label">Delivered</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${data.activeShipments}</div>
      <div class="stat-label">Active</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${data.delayedShipments}</div>
      <div class="stat-label">Delayed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${data.cancelledShipments}</div>
      <div class="stat-label">Cancelled</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${((data.deliveredShipments / data.totalShipments) * 100).toFixed(1)}%</div>
      <div class="stat-label">Success Rate</div>
    </div>
  </div>
  
  ${routesData.length > 0 ? `
  <div class="section">
    <div class="section-title">Top Shipping Routes</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Route</th>
          <th>Shipments</th>
        </tr>
      </thead>
      <tbody>
        ${routesData.map(route => `
          <tr>
            <td>${route.route}</td>
            <td>${route.count}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  ${chartData.length > 0 ? `
  <div class="section">
    <div class="section-title">Shipment Types Distribution</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${chartData.map(item => `
          <tr>
            <td>${item.type}</td>
            <td>${item.count}</td>
            <td>${((item.count / data.totalShipments) * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  <div class="footer">
    <div style="font-weight: bold;">Go Cargo Logistics</div>
    <div>support@gocargologisticsus.com | +1 (940) 238-4915</div>
    <div>gocargologisticsus.com</div>
    <div style="margin-top: 3mm; color: #999;">
      Generated on ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Print monthly report
 */
export function printMonthlyReport(data: MonthlyReportData) {
  const html = generateMonthlyReportHTML(data);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}