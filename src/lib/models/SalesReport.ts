import mongoose from 'mongoose';

const salesReportSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    topSellingItem: {
      productId: mongoose.Schema.Types.ObjectId,
      productName: String,
      quantity: Number,
      revenue: Number,
    },
    categoryBreakdown: [
      {
        categoryId: mongoose.Schema.Types.ObjectId,
        categoryName: String,
        sales: Number,
        quantity: Number,
      },
    ],
    paymentBreakdown: {
      cash: { type: Number, default: 0 },
      card: { type: Number, default: 0 },
      upi: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.SalesReport || mongoose.model('SalesReport', salesReportSchema);
