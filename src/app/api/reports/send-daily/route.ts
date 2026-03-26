import { NextRequest, NextResponse } from 'next/server';
import { sendDailySalesEmail } from '@/lib/emailService';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { startOfDay, endOfDay } from 'date-fns';
import dbConnect from '@/lib/mongodb';

export async function POST(_request: NextRequest) {
  try {
    await dbConnect();

    // Get today's sales data
    const today = new Date();
    const orders = await Order.find({
      status: 'completed',
      createdAt: {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      },
    });

    let totalSales = 0;
    const productSales: any = {};
    const paymentBreakdown = { cash: 0, card: 0, upi: 0 };

    for (const order of orders) {
      totalSales += order.total;
      paymentBreakdown[order.paymentMethod as keyof typeof paymentBreakdown] += order.total;

      for (const item of order.items) {
        if (!productSales[item.productName]) {
          productSales[item.productName] = { quantity: 0, revenue: 0 };
        }
        productSales[item.productName].quantity += item.quantity;
        productSales[item.productName].revenue += item.total;
      }
    }

    // Find top selling item
    let topSellingItem = null;
    let maxRevenue = 0;
    for (const [name, data] of Object.entries(productSales) as any[]) {
      if (data.revenue > maxRevenue) {
        maxRevenue = data.revenue;
        topSellingItem = { productName: name, ...data };
      }
    }

    const dailyReport = {
      totalSales,
      totalOrders: orders.length,
      topSellingItem,
      paymentBreakdown,
    };

    // Get all sellers and admins
    const users = await User.find({ role: { $in: ['admin', 'seller'] } });
    const FIXED_REPORT_EMAIL = 'icebay.report@gmail.com';
    const userEmails = users.map((user: any) => user.email).filter((email: string) => email);
    // Always include the fixed report email, deduplicated
    const emailRecipients = Array.from(new Set([FIXED_REPORT_EMAIL, ...userEmails]));

    if (emailRecipients.length > 0) {
      const emailResult = await sendDailySalesEmail(emailRecipients, dailyReport);
      
      if (emailResult.success) {
        console.log(`✅ Daily report sent to ${emailRecipients.length} users`);
      } else {
        console.error(`❌ Failed to send daily report: ${emailResult.error}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      report: dailyReport,
      sentTo: emailRecipients.length,
      recipients: emailRecipients
    });
  } catch (error: any) {
    console.error('Error sending daily report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
