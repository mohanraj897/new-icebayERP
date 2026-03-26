# Icebay ERP - Ice Cream Store Management System

A complete ERP (Enterprise Resource Planning) system for ice cream stores with billing, inventory management, admin panel, seller panel, and automated email reporting.

## 🌟 Features

- **Billing System**: Real-time billing with shopping cart functionality
- **Category Management**: Milk-based and Water-based ice cream categories (admin editable)
- **Product Management**: Add, edit, and delete products with pricing and margins
- **Seller Panel**: Easy-to-use interface for sellers to process sales
- **Admin Panel**: Comprehensive dashboard with sales analytics
- **Daily Sales Reports**: Automated email reports sent daily
- **Monthly Summaries**: Monthly sales summaries with top items
- **Payment Tracking**: Track sales by cash, card, and UPI
- **Authentication**: Secure login for admin and seller roles
- **Real-time Dashboard**: View today's sales, top items, and payment breakdown

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Utilities**: Axios, bcryptjs, date-fns, Zustand

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- SMTP credentials for email service (Gmail, SendGrid, etc.)

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/icebay_erp

# JWT Secret (change in production)
JWT_SECRET=your-secret-key-change-in-production

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@icebay.com

# Application
NODE_ENV=development
```

### 3. Running the Application

**Development:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Production:**
```bash
npm run build
npm start
```

## 📱 User Roles

### Admin
- Dashboard with sales analytics
- Category management (add, edit, delete)
- Product management
- Send daily and monthly email reports
- View top-selling items
- Payment method breakdown

### Seller
- Process sales with shopping cart
- View today's sales summary
- Order history

## 📊 Database Models

### User
- Admin and Seller accounts
- Email-based authentication

### Category
- Milk-based and Water-based types
- Customizable colors

### Product
- Links to categories
- Price and cost tracking
- Automatic margin calculation

### Order
- Line items with product details
- Payment method tracking
- Order status management

### SalesReport
- Daily and monthly aggregations
- Top-selling items
- Category breakdowns

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- HTTP-only cookies for token storage
- Protected API routes (role-based)

## 📧 Email Automation

### Daily Reports
Sent to all admin emails with:
- Total sales amount
- Number of orders
- Top-selling item
- Payment method breakdown

### Monthly Summaries
Sent to all admin emails with:
- Monthly total sales
- Total orders and average order value
- Highest-selling item
- Category-wise breakdown with percentages

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Add new category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders/Billing
- `GET /api/orders` - Get orders (with filters)
- `POST /api/orders` - Create new order

### Reports
- `GET /api/reports/sales` - Get sales reports
- `POST /api/reports/send-daily` - Send daily report email
- `POST /api/reports/send-monthly` - Send monthly summary email

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin panel page
│   ├── seller/           # Seller panel page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/
│   ├── mongodb.ts        # Database connection
│   ├── emailService.ts   # Email utilities
│   └── models/           # Database schemas
└── globals.css           # Global styles
```

## 🔄 Sample Workflow

1. **Admin/Seller Registration**: Create account at `/register`
2. **Login**: Login at `/login` with credentials
3. **Seller Actions**: 
   - Browse products by category
   - Add items to cart
   - Process checkout
   - View sales summary
4. **Admin Actions**:
   - Create/manage categories
   - Add/manage products
   - View dashboard analytics
   - Send email reports

## 💡 Customization

### Adding New Payment Methods
Edit `Order.ts` schema to add more payment options

### Changing Tax Rate
Modify the tax calculation in `/api/orders/route.ts` (currently 5%)

### Email Templates
Customize HTML in `emailService.ts`

## 📝 License

This project is proprietary software for Icebay stores.

## 🤝 Support

For issues or questions, contact the development team.

## 🎨 Theme Colors

- Primary: Blue (#3B82F6)
- Secondary: Green (#10B981)
- Danger: Red (#EF4444)

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-28
