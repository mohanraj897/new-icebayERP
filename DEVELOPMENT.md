# Icebay ERP Development

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup MongoDB**
   - Install MongoDB locally OR
   - Use MongoDB Atlas cloud (recommended)
   - Update `.env.local` with connection string

3. **Setup Email Service**
   - Get SMTP credentials (Gmail, SendGrid, etc.)
   - Update `.env.local` with email configuration
   - Follow ENV.md for detailed setup

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Visit: http://localhost:3000

## First Time Setup Checklist

- [ ] Clone/download project
- [ ] Run `npm install`
- [ ] Configure MongoDB in `.env.local`
- [ ] Configure SMTP in `.env.local`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Create test accounts (admin and seller)
- [ ] Test billing flow

## Test Credentials (After Setup)

### Admin Account
- Email: admin@icebay.com
- Password: admin123456
- Access: Admin Panel with full features

### Seller Account
- Email: seller@icebay.com
- Password: seller123456
- Access: Seller Panel with billing

## Deployment

### Build
```bash
npm run build
```

### Production Environment Variables
Update `.env.local` or system environment with:
- Real MongoDB Atlas URI
- Strong JWT_SECRET
- Production SMTP credentials
- NODE_ENV=production

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## Troubleshooting

### MongoDB Connection Error
- Check connection string in `.env.local`
- Ensure MongoDB is running (local)
- Check IP whitelist (MongoDB Atlas)
- Check credentials

### Email Not Sending
- Verify SMTP credentials
- Check "Less secure apps" setting (Gmail)
- Use app-specific passwords (Gmail)
- Check firewall/port 587 access

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

## Project Structure

```
icebayERP/
├── src/
│   ├── app/              # Next.js app directory
│   ├── lib/              # Utilities and models
│   └── globals.css       # Global styles
├── public/               # Static files
├── .env.local            # Environment variables
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md             # Documentation
```

## API Testing

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@icebay.com","password":"admin123456"}'
```

### Get Categories
```bash
curl http://localhost:3000/api/categories
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId":"USER_ID",
    "items":[{"productId":"PRODUCT_ID","quantity":2}],
    "customerName":"John",
    "paymentMethod":"cash"
  }'
```

## Performance Optimization

- Implemented server-side rendering with Next.js
- Tailwind CSS for optimized styling
- MongoDB indexes on frequently queried fields
- JWT authentication for API security

## Future Enhancements

- [ ] Analytics dashboard with charts
- [ ] Inventory management
- [ ] Customer loyalty program
- [ ] Multi-store support
- [ ] Mobile app
- [ ] Payment gateway integration
- [ ] Advanced reporting (PDF export)
- [ ] Scheduled email reports with cron jobs

## Support & Contact

For issues or questions, please refer to README.md

---

**Last Updated**: 2026-01-28
