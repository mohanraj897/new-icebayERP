   # Icebay ERP - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Install Node.js (if not already installed)
- Visit https://nodejs.org/
- Download and install LTS version
- Verify: `node --version` and `npm --version`

### Step 2: Install Dependencies
```bash
cd c:\Users\rajm1\.vscode\icebayERP
npm install
```

### Step 3: Setup MongoDB

**Option A: Local MongoDB (Recommended for Development)**
1. Download from https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service
4. Connection string: `mongodb://localhost:27017/icebay_erp`

**Option B: MongoDB Atlas (Cloud - No Installation)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/icebay_erp`

### Step 4: Configure Environment Variables

Edit `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/icebay_erp

# JWT Secret (optional for development)
JWT_SECRET=dev-secret-key-change-in-production

# Email (optional - skip if testing locally)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@icebay.com

NODE_ENV=development
```

### Step 5: Start the Application
```bash
npm run dev
```

Open http://localhost:3000 in your browser

## 🎯 First Actions

1. **Register Admin Account**
   - Visit http://localhost:3000/register
   - Create admin account (role: Admin)
   - Example: admin@test.com / password123

2. **Register Seller Account**
   - Register seller account (role: Seller)
   - Example: seller@test.com / password123

3. **Add Categories (Admin)**
   - Login as admin
   - Go to Categories tab
   - Add "Vanilla" (Milk-based)
   - Add "Strawberry" (Milk-based)
   - Add "Lemonade" (Water-based)

4. **Add Products (Admin)**
   - Go to Products tab
   - Add products to categories
   - Example: Single Scoop - ₹50, Double Scoop - ₹80

5. **Process Sales (Seller)**
   - Login as seller
   - Go to Billing tab
   - Add items to cart
   - Click Checkout
   - View sales in "Daily Sales" tab

## 📧 Email Setup (Optional)

### Gmail
1. Enable 2-Factor Authentication
2. Generate App Password at myaccount.google.com/apppasswords
3. Use app password in `SMTP_PASS`

### Alternative: Skip Email for Testing
Comment out email fields in `.env.local` and test manually via `/api/reports/send-daily`

## 🔍 Verify Installation

### Check MongoDB Connection
```bash
# From project root, open Node console
node
> const mongoose = require('mongoose');
> mongoose.connect('mongodb://localhost:27017/icebay_erp');
> console.log('Connected!');
```

### Test API
```bash
# Get categories (should return empty array initially)
curl http://localhost:3000/api/categories
```

## 📚 Key File Locations

- **Home Page**: `src/app/page.tsx`
- **Login**: `src/app/login/page.tsx`
- **Seller Panel**: `src/app/seller/page.tsx`
- **Admin Panel**: `src/app/admin/page.tsx`
- **API Routes**: `src/app/api/`
- **Database Models**: `src/lib/models/`
- **Configuration**: `.env.local`

## 🐛 Troubleshooting

**Issue**: MongoDB connection failed
- ✅ Check MongoDB is running
- ✅ Verify connection string in `.env.local`
- ✅ Check credentials (Atlas)

**Issue**: Port 3000 already in use
- ✅ Run: `npm run dev -- -p 3001`

**Issue**: Styling not showing
- ✅ Restart dev server after install

**Issue**: API errors
- ✅ Check browser console (F12)
- ✅ Check terminal output

## 📝 Important Notes

- Change `JWT_SECRET` in production
- Never commit `.env.local` to git
- Use strong passwords in production
- Enable HTTPS in production
- Setup automated daily/monthly email reports

## ✨ Next Steps

After setup:
1. Customize ice cream categories
2. Add your products
3. Configure email service
4. Setup scheduled reports
5. Train team on panels

## 🎓 Full Documentation

- **README.md** - Complete feature documentation
- **DEVELOPMENT.md** - Development guide
- **ENV.md** - Environment variables details

---

Need help? Refer to README.md for complete documentation.
