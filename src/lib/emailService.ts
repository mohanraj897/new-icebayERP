import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send to multiple recipients
export async function sendEmailToMultiple(
  recipients: string[],
  subject: string,
  htmlContent: string
) {
  if (!recipients || recipients.length === 0) {
    return { success: false, error: 'No recipients provided' };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@icebay.com',
      to: recipients.join(','),
      subject,
      html: htmlContent,
    });
    console.log(`✅ Email sent to: ${recipients.join(', ')}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendDailySalesEmail(
  recipients: string[],
  dailyReport: any
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center;">
        <h2 style="margin: 0;">🍦 Daily Sales Report</h2>
        <p style="margin: 5px 0 0 0;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📊 Sales Summary</h3>
        <p style="margin: 10px 0;"><strong>Total Sales:</strong> <span style="color: #28a745; font-size: 18px;">₹${dailyReport.totalSales.toFixed(2)}</span></p>
        <p style="margin: 10px 0;"><strong>Total Orders:</strong> ${dailyReport.totalOrders}</p>
      </div>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 15px;">
        <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">⭐ Top Selling Item</h3>
        ${
          dailyReport.topSellingItem
            ? `
          <p style="margin: 10px 0;"><strong>${dailyReport.topSellingItem.productName}</strong></p>
          <p style="margin: 10px 0;">📦 Quantity: ${dailyReport.topSellingItem.quantity}</p>
          <p style="margin: 10px 0;">💰 Revenue: ₹${dailyReport.topSellingItem.revenue.toFixed(2)}</p>
        `
            : '<p style="color: #666;">No sales today</p>'
        }
      </div>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 15px;">
        <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">💳 Payment Breakdown</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li style="margin: 8px 0;">💵 Cash: ₹${dailyReport.paymentBreakdown.cash.toFixed(2)}</li>
          <li style="margin: 8px 0;">🏦 Card: ₹${dailyReport.paymentBreakdown.card.toFixed(2)}</li>
          <li style="margin: 8px 0;">📱 UPI: ₹${dailyReport.paymentBreakdown.upi.toFixed(2)}</li>
        </ul>
      </div>

      <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: center;">
        <p style="margin: 0; color: #2e7d32; font-size: 14px;">This is an automated report. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmailToMultiple(recipients, `Daily Sales Report - ${new Date().toLocaleDateString()}`, htmlContent);
}

export async function sendMonthlySummaryEmail(
  recipients: string[],
  monthlySummary: any
) {
  const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const avgOrderValue = monthlySummary.totalOrders > 0 
    ? (monthlySummary.totalSales / monthlySummary.totalOrders).toFixed(2)
    : '0';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center;">
        <h2 style="margin: 0;">📈 Monthly Sales Summary</h2>
        <p style="margin: 5px 0 0 0;">${monthYear}</p>
      </div>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📊 Summary</h3>
        <p style="margin: 10px 0;"><strong>Total Sales:</strong> <span style="color: #28a745; font-size: 18px;">₹${monthlySummary.totalSales.toFixed(2)}</span></p>
        <p style="margin: 10px 0;"><strong>Total Orders:</strong> ${monthlySummary.totalOrders}</p>
        <p style="margin: 10px 0;"><strong>Average Order Value:</strong> ₹${avgOrderValue}</p>
      </div>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 15px;">
        <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">⭐ Highest Selling Item</h3>
        ${
          monthlySummary.topSellingItem
            ? `
          <p style="margin: 10px 0;"><strong>${monthlySummary.topSellingItem.productName}</strong></p>
          <p style="margin: 10px 0;">📦 Quantity: ${monthlySummary.topSellingItem.quantity}</p>
          <p style="margin: 10px 0;">💰 Revenue: ₹${monthlySummary.topSellingItem.revenue.toFixed(2)}</p>
        `
            : '<p style="color: #666;">No data available</p>'
        }
      </div>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 15px;">
        <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📂 Category Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #667eea; color: white;">
              <th style="padding: 10px; text-align: left;">Category</th>
              <th style="padding: 10px; text-align: right;">Sales</th>
              <th style="padding: 10px; text-align: right;">%</th>
            </tr>
          </thead>
          <tbody>
            ${monthlySummary.categoryBreakdown
              .map((cat: any) => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${cat.categoryName}</td>
                <td style="padding: 10px; text-align: right;">₹${cat.totalSales.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right;">${cat.percentage.toFixed(1)}%</td>
              </tr>
            `)
              .join('')}
          </tbody>
        </table>
      </div>

      <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: center;">
        <p style="margin: 0; color: #2e7d32; font-size: 14px;">This is an automated report. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmailToMultiple(recipients, `Monthly Sales Summary - ${monthYear}`, htmlContent);
}
