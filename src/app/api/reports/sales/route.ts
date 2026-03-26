import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import SalesReport from '@/lib/models/SalesReport';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, month, custom
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let queryDate: any = {};

    if (period === 'today') {
      const today = new Date();
      queryDate.createdAt = {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      };
    } else if (period === 'month') {
      const now = new Date();
      queryDate.createdAt = {
        $gte: startOfMonth(now),
        $lte: endOfMonth(now),
      };
    } else if (period === 'custom' && dateFrom && dateTo) {
      queryDate.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    const orders = await Order.find({ ...queryDate, status: 'completed' });

    let totalSales = 0;
    let totalOrders = orders.length;
    const productSales: any = {};
    const paymentBreakdown = { cash: 0, card: 0, upi: 0 };

    for (const order of orders) {
      totalSales += order.total;
      paymentBreakdown[order.paymentMethod as keyof typeof paymentBreakdown] +=
        order.total;

      for (const item of order.items) {
        const productName = item.productName;
        if (!productSales[productName]) {
          productSales[productName] = { quantity: 0, revenue: 0 };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += item.total;
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

    return NextResponse.json({
      period,
      totalSales,
      totalOrders,
      topSellingItem,
      productSales,
      paymentBreakdown,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { date, totalSales, totalOrders, topSellingItem, categoryBreakdown, paymentBreakdown } =
      await request.json();

    const report = await SalesReport.create({
      date: new Date(date),
      totalSales,
      totalOrders,
      topSellingItem,
      categoryBreakdown,
      paymentBreakdown,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
