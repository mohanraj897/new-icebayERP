import { NextRequest, NextResponse } from 'next/server';
import { sendMonthlySummaryEmail } from '@/lib/emailService';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import User from '@/lib/models/User';
import { startOfMonth, endOfMonth } from 'date-fns';
import dbConnect from '@/lib/mongodb';

export async function POST(_request: NextRequest) {
  try {
    await dbConnect();

    // Get this month's sales data
    const now = new Date();
    const orders = await Order.find({
      status: 'completed',
      createdAt: {
        $gte: startOfMonth(now),
        $lte: endOfMonth(now),
      },
    }).populate('items.productId');

    let totalSales = 0;
    const productSales: any = {};

    for (const order of orders) {
      totalSales += order.total;

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

    // Get category breakdown
    const categories = await Category.find();
    const categoryBreakdown = [];

    for (const category of categories) {
      const categoryOrders = await Order.find({
        'items.productId': {
          $in: (await Product.find({ categoryId: category._id })).map((p) => p._id),
        },
        status: 'completed',
        createdAt: {
          $gte: startOfMonth(now),
          $lte: endOfMonth(now),
        },
      });

      let categorySales = 0;
      let categoryQuantity = 0;

      for (const order of categoryOrders) {
        for (const item of order.items) {
          categorySales += item.total;
          categoryQuantity += item.quantity;
        }
      }

      categoryBreakdown.push({
        categoryId: category._id,
        categoryName: category.name,
        totalSales: categorySales,
        quantity: categoryQuantity,
        percentage: totalSales > 0 ? (categorySales / totalSales) * 100 : 0,
      });
    }

    const monthlySummary = {
      totalSales,
      totalOrders: orders.length,
      topSellingItem,
      categoryBreakdown,
    };

    // Get all sellers and admins
    const users = await User.find({ role: { $in: ['admin', 'seller'] } });
    const FIXED_REPORT_EMAIL = 'icebay.report@gmail.com';
    const userEmails = users.map((user: any) => user.email).filter((email: string) => email);
    // Always include the fixed report email, deduplicated
    const emailRecipients = Array.from(new Set([FIXED_REPORT_EMAIL, ...userEmails]));

    if (emailRecipients.length > 0) {
      const emailResult = await sendMonthlySummaryEmail(emailRecipients, monthlySummary);
      
      if (emailResult.success) {
        console.log(`✅ Monthly report sent to ${emailRecipients.length} users`);
      } else {
        console.error(`❌ Failed to send monthly report: ${emailResult.error}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      summary: monthlySummary,
      sentTo: emailRecipients.length,
      recipients: emailRecipients
    });
  } catch (error: any) {
    console.error('Error sending monthly report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
