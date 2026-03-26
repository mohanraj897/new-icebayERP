import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query: any = includeInactive ? {} : { isActive: true };
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const products = await Product.find(query).populate('categoryId');
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, categoryId, price, cost, sku, description, quantity } = await request.json();

    const product = await Product.create({
      name,
      categoryId,
      price,
      cost,
      sku,
      description,
      quantity: quantity ?? 0,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
