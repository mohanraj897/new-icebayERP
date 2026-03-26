import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import '@/lib/models/User'; // register User schema so populate('sellerId') works
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const query: any = {};
    if (sellerId) {
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        return NextResponse.json(
          { error: `Invalid sellerId format: "${sellerId}" is not a valid MongoDB ObjectId. Please log out and log back in.` },
          { status: 400 }
        );
      }
      query.sellerId = new mongoose.Types.ObjectId(sellerId);
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const orders = await Order.find(query).populate('sellerId items.productId');
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { sellerId, items, customerName, customerPhone, paymentMethod, notes } =
      await request.json();

    let subtotal = 0;
    const processedItems = [];

    // ── Validate all products first before touching anything ──
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found` },
          { status: 404 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });
    }

    const total = subtotal; // No GST

    const order = await Order.create({
      orderNumber: `ORD-${uuidv4().substr(0, 8)}`,
      sellerId,
      items: processedItems,
      subtotal,
      total,
      customerName,
      customerPhone,
      paymentMethod,
      notes,
    });

    // ── Auto-deduct stock for each item sold ──
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantity } } // atomically subtract sold qty
      );
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
