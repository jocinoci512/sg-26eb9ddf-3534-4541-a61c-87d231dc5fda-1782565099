/**
 * PDF Generation utilities for shipping labels and reports
 * This is a client-side implementation using browser APIs
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
  shipmentType: string;
  shipmentDate: string;
  estimatedDelivery?: string;
  weight?: string;
  vehicleInfo?: string;
}

export interface MonthlyReportData {
  month: string;
  year: number;
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  delayedShipments: number;
  cancelledShipments: number;
  revenue: number;
  topRoutes: Array<{ route: string; count: number }>;
  shipmentTypes: Record<string, number>;
}

/**
 * Generate shipping label HTML for printing/PDF
 */
export function generateShippingLabelHTML(data: ShippingLabelData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shipping Label - ${data.trackingNumber}</title>
  <style>
    @page { size: 4in 6in; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      width: 4in;
      height: 6in;
      padding: 0.25in;
      background: white;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0B1F3A;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .company-name {
      font-size: 20px;
      font-weight: bold;
      color: #0B1F3A;
      margin-bottom: 5px;
    }
    .tracking {
      background: #0B1F3A;
      color: white;
      padding: 8px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 1px;
      margin: 15px 0;
    }
    .barcode {
      text-align: center;
      margin: 10px 0;
      padding: 10px;
      border: 2px solid #0B1F3A;
      font-family: 'Courier New', monospace;
      font-size: 24px;
      letter-spacing: 3px;
    }
    .section {
      margin: 12px 0;
      padding: 8px;
      border: 1px solid #ddd;
    }
    .section-title {
      font-size: 10px;
      font-weight: bold;
      color: #0B1F3A;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .address {
      font-size: 12px;
      line-height: 1.4;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    .info-item {
      font-size: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .footer {
      margin-top: 15px;
      text-align: center;
      font-size: 8px;
      color: #888;
      border-top: 1px solid #ddd;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">GO CARGO LOGISTICS</div>
    <div style="font-size: 10px; color: #666;">Professional Vehicle & Freight Transportation</div>
  </div>

  <div class="tracking">${data.trackingNumber}</div>

  <div class="barcode">||||| ${data.trackingNumber} |||||</div>

  <div class="section">
    <div class="section-title">Ship From</div>
    <div class="address">
      <div><strong>${data.senderName}</strong></div>
      <div>${data.senderAddress}</div>
      <div>${data.senderCity}, ${data.senderState} ${data.senderZip}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Ship To</div>
    <div class="address">
      <div><strong>${data.receiverName}</strong></div>
      <div>${data.receiverAddress}</div>
      <div>${data.receiverCity}, ${data.receiverState} ${data.receiverZip}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Service Type:</div>
      <div>${data.shipmentType.replace(/_/g, ' ').toUpperCase()}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Ship Date:</div>
      <div>${data.shipmentDate}</div>
    </div>
    ${data.estimatedDelivery ? `
    <div class="info-item">
      <div class="info-label">Est. Delivery:</div>
      <div>${data.estimatedDelivery}</div>
    </div>
    ` : ''}
    ${data.weight ? `
    <div class="info-item">
      <div class="info-label">Weight:</div>
      <div>${data.weight}</div>
    </div>
    ` : ''}
  </div>

  ${data.vehicleInfo ? `
  <div class="section" style="margin-top: 10px;">
    <div class="section-title">Vehicle Information</div>
    <div style="font-size: 11px;">${data.vehicleInfo}</div>
  </div>
  ` : ''}

  <div class="footer">
    Go Cargo Logistics | gocargologisticsus.com | support@gocargologisticsus.com
  </div>
</body>
</html>
  `;
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
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Monthly Report - ${data.month} ${data.year}</title>
  <style>
    @page { size: letter; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #0B1F3A 0%, #1E5AA8 100%);
      color: white;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .report-title {
      font-size: 20px;
      margin-bottom: 5px;
    }
    .report-period {
      font-size: 16px;
      opacity: 0.9;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      border: 2px solid #0B1F3A;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
    }
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: #0B1F3A;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #0B1F3A;
      border-bottom: 2px solid #0B1F3A;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f5f5f5;
      font-weight: bold;
      color: #0B1F3A;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 2px solid #ddd;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">GO CARGO LOGISTICS</div>
    <div class="report-title">Monthly Performance Report</div>
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
      <div class="stat-value">$${data.revenue.toLocaleString()}</div>
      <div class="stat-label">Revenue</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Top Shipping Routes</div>
    <table>
      <thead>
        <tr>
          <th>Route</th>
          <th>Shipments</th>
        </tr>
      </thead>
      <tbody>
        ${data.topRoutes.map(route => `
          <tr>
            <td>${route.route}</td>
            <td>${route.count}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Shipments by Type</div>
    <table>
      <thead>
        <tr>
          <th>Shipment Type</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(data.shipmentTypes).map(([type, count]) => `
          <tr>
            <td>${type.replace(/_/g, ' ').toUpperCase()}</td>
            <td>${count}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p><strong>Go Cargo Logistics</strong></p>
    <p>Professional Vehicle & Freight Transportation</p>
    <p>gocargologisticsus.com | support@gocargologisticsus.com</p>
    <p>Report Generated: ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
  `;
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