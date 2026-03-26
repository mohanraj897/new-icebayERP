# Icebay ERP - Environment Configuration

## Configuration Guide

This file describes all environment variables needed for the Icebay ERP system.

### Database
- `MONGODB_URI`: MongoDB connection string
  - Local: `mongodb://localhost:27017/icebay_erp`
  - Cloud (MongoDB Atlas): `mongodb+srv://username:password@cluster.mongodb.net/icebay_erp`

### Authentication
- `JWT_SECRET`: Secret key for JWT token signing (minimum 32 characters in production)

### Email Service
- `SMTP_HOST`: SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT`: SMTP port (usually 587 for TLS, 465 for SSL)
- `SMTP_SECURE`: Use SSL/TLS (true for port 465, false for port 587)
- `SMTP_USER`: Email account username
- `SMTP_PASS`: Email account password or app-specific password
- `SMTP_FROM`: From email address for outgoing emails

### Application
- `NODE_ENV`: Environment (development/production)

### Setup Examples

#### Gmail Configuration
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

#### SendGrid Configuration
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### MongoDB Atlas
```
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/icebay_erp?retryWrites=true&w=majority
```
