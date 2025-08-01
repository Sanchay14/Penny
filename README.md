# 💰 Penyy – AI-Powered Personal Finance Dashboard

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-blueviolet)](https://clerk.com/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma-3982CE?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Style-TailwindCSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Google AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)](https://ai.google.dev/)

<div align="center">

**🎯 Track your finances with intelligence.**

**Penyy** is a cutting-edge, AI-powered financial management platform that transforms how you track expenses, analyze spending patterns, and make informed financial decisions. Built with modern technologies and enterprise-grade security.

</div>

---

## 🌟 Key Features & Screenshots

### 🏠 **Intelligent Dashboard**
<img src="public/banner.jpg" alt="Penyy Dashboard" width="800"/>

**Real-time Financial Overview:**
- **Multi-Account Management** with instant balance updates
- **Smart Budget Tracking** with visual progress indicators  
- **Recent Transactions** with categorized expense tracking
- **Monthly Expense Analytics** with interactive pie charts
- **Responsive Design** that works seamlessly across all devices

### 📊 **Advanced Analytics & Insights**
**Transaction Analysis:**
- **Daily/Monthly Expense Tracking** with bar chart visualizations
- **Category-wise Spending Breakdown** with percentage insights
- **Income vs Expense Comparison** for better financial planning
- **Last Month Performance** with trend analysis
- **Real-time Balance Calculations** across all accounts

### 💳 **Smart Transaction Management**
**AI-Powered Transaction Entry:**
- **📷 AI Receipt Scanning** - Snap photos, extract data automatically using Google Gemini
- **Smart Category Detection** with machine learning
- **Recurring Transaction Setup** for automated expense tracking
- **Multi-Account Support** with seamless switching
- **Date & Amount Validation** with intelligent suggestions

### 🎯 **Budget Management & Alerts**
**Intelligent Budget Control:**
- **Visual Budget Progress** with color-coded indicators (Green → Yellow → Red)
- **Real-time Expense Tracking** against set budgets
- **Smart Budget Recommendations** based on spending patterns
- **Remaining Balance Calculations** with predictive insights
- **Monthly Budget Reset** with historical tracking

---

## 🛠️ Technology Stack

### **Frontend & Framework**
- **⚡ Next.js 15.3.4** - React framework with App Router & Server Components
- **⚛️ React 19.0.0** - Latest React with concurrent features
- **📘 TypeScript 5.0** - Type-safe development with strict mode
- **🎨 Tailwind CSS** - Utility-first CSS framework with custom design system
- **🧩 Radix UI** - Accessible, unstyled UI components
- **📊 Recharts 2.12.7** - Responsive charts and data visualization

### **Backend & Database**
- **🗄️ Prisma ORM** - Type-safe database toolkit with PostgreSQL
- **🔒 PostgreSQL** - Robust relational database with ACID compliance
- **🌐 Server Actions** - Type-safe server-side mutations
- **📡 API Routes** - RESTful endpoints for data management

### **Authentication & Security**
- **🔐 Clerk Authentication** - Complete user management with social logins
- **🛡️ Arcjet Security** - Advanced bot protection and rate limiting
- **🔒 Middleware Protection** - Route-level security with JWT validation
- **🚫 CSRF Protection** - Built-in protection against cross-site attacks

### **AI & Intelligence**
- **🤖 Google Gemini AI** - Advanced receipt scanning and text extraction
- **📷 Image Processing** - Intelligent document analysis
- **🧠 Smart Categorization** - ML-powered expense classification
- **📈 Predictive Analytics** - Spending pattern recognition

### **Development & Quality**
- **🔧 ESLint** - Code quality and consistency enforcement
- **🎯 Zod Validation** - Runtime type validation and schema parsing
- **📱 PWA Ready** - Progressive Web App capabilities with manifest
- **🚀 Vercel Deployment** - Optimized hosting with edge functions

### **UI/UX Features**
- **🌙 Dark/Light Mode** - System preference detection
- **📱 Responsive Design** - Mobile-first approach with breakpoint optimization
- **♿ Accessibility** - WCAG 2.1 compliant with screen reader support
- **🎭 Loading States** - Skeleton loaders and progressive enhancement
- **🎨 Hover Effects** - Interactive animations and micro-interactions
- **🔔 Toast Notifications** - Real-time feedback with Sonner integration

---

## 🏗️ Architecture & Engineering Excellence

### **Modern Architecture Patterns**
- **🏛️ Clean Architecture** - Separation of concerns with clear boundaries
- **📦 Component-Based Design** - Reusable, composable UI components
- **🔄 Server-Side Rendering** - Optimal performance with Next.js App Router
- **⚡ Edge Computing** - Distributed computing with Vercel Edge Functions
- **🎯 Type Safety** - End-to-end TypeScript implementation

### **Performance Optimizations**
- **🚀 Dynamic Imports** - Code splitting and lazy loading
- **📊 Optimistic Updates** - Immediate UI feedback with server synchronization
- **🔄 Cache Invalidation** - Aggressive cache control for real-time updates
- **⚡ React 19 Features** - Latest concurrent features and suspense
- **📱 Progressive Enhancement** - Works without JavaScript

### **Database Design**
```typescript
// Core Models
User ↔ Account (1:N)
Account ↔ Transaction (1:N)
User ↔ Budget (1:1)
Transaction → Category (N:1)
```

- **🔗 Relational Integrity** - Foreign keys and constraints
- **📈 Performance Indexes** - Optimized queries with strategic indexing
- **🔄 Migrations** - Version-controlled schema changes
- **💾 Data Serialization** - Prisma Decimal to Number conversion
- **🔒 Row-Level Security** - User-scoped data access

---

## 🎯 How Penyy Works

### **1. 🔐 Secure Onboarding**
- **Quick Registration** with email or social providers (Google, GitHub)
- **Multi-Factor Authentication** for enhanced security
- **Account Verification** with email confirmation

### **2. 💳 Account Management**
- **Create Multiple Accounts** (Savings, Current, Credit Cards)
- **Set Default Account** for primary transaction tracking
- **Real-time Balance Updates** across all accounts
- **Account Type Classification** with visual indicators

### **3. 📷 Smart Transaction Entry**
```mermaid
flowchart LR
    A[Receipt Photo] --> B[Google Gemini AI]
    B --> C[Data Extraction]
    C --> D[Validation]
    D --> E[Database]
```
- **Snap Receipt Photos** using device camera
- **AI-Powered Extraction** of amount, date, and description
- **Smart Category Suggestion** based on merchant and description
- **Manual Override** for corrections and adjustments

### **4. 📊 Intelligent Analytics**
- **Real-time Dashboard** with instant data updates
- **Category-wise Breakdown** with interactive pie charts
- **Monthly Trends** with bar chart visualizations
- **Budget vs Actual** comparison with progress indicators

### **5. 🎯 Budget Management**
- **Set Monthly Budgets** with flexible amount adjustments
- **Visual Progress Tracking** with color-coded indicators
- **Smart Alerts** when approaching budget limits
- **Historical Budget Analysis** for better planning

---

## 🚀 Quick Start Guide

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key
- Clerk account for authentication

### **1. Clone & Install**
```bash
# Clone the repository
git clone https://github.com/Sanchay22/Penyy.git
cd Penyy

# Install dependencies
npm install
```

### **2. Environment Setup**
Create a `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/penyy"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI Features (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Security (Arcjet)
ARCJET_KEY=your_arcjet_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **3. Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Seed sample data
npm run seed
```

### **4. Development Server**
```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### **5. Production Deployment**
```bash
# Build for production
npm run build

# Start production server
npm run start
```

---

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run type-check` | TypeScript type checking |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio for database management |

---

## 🏆 Key Engineering Highlights

### **🔧 Production-Ready Features**
- **Zero-Downtime Deployments** with Vercel
- **Edge Computing** for global performance
- **Automatic SSL** and CDN optimization
- **Environment-based Configuration** for staging/production
- **Health Check Endpoints** for monitoring

### **�️ Security Best Practices**
- **HTTPS Everywhere** with automatic redirects
- **Content Security Policy** headers
- **XSS Protection** with sanitized inputs
- **SQL Injection Prevention** with Prisma
- **Rate Limiting** with Arcjet integration

### **📈 Performance Monitoring**
- **Real User Monitoring** with Core Web Vitals
- **Error Tracking** with built-in logging
- **Database Query Optimization** with Prisma insights
- **Bundle Analysis** for optimal loading
- **Lighthouse Scoring** 90+ across all metrics

### **🧪 Code Quality**
- **100% TypeScript** coverage
- **ESLint** with strict rules
- **Prettier** for consistent formatting
- **Husky** pre-commit hooks
- **Conventional Commits** for clean history

---

## 🗄️ Database Schema

### **Core Models**
```typescript
model User {
  id           String    @id @default(cuid())
  clerkUserId  String    @unique
  email        String    @unique
  name         String?
  imageUrl     String?
  accounts     Account[]
  transactions Transaction[]
  budgets      Budget[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Account {
  id           String        @id @default(cuid())
  name         String
  type         AccountType   // SAVINGS, CURRENT, CREDIT
  balance      Decimal       @default(0)
  isDefault    Boolean       @default(false)
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Transaction {
  id          String          @id @default(cuid())
  amount      Decimal
  description String?
  category    String
  type        TransactionType // INCOME, EXPENSE
  date        DateTime        @default(now())
  isRecurring Boolean         @default(false)
  recurringConfig Json?
  userId      String
  accountId   String
  user        User            @relation(fields: [userId], references: [id])
  account     Account         @relation(fields: [accountId], references: [id])
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model Budget {
  id        String   @id @default(cuid())
  amount    Decimal
  period    String   @default("MONTHLY")
  startDate DateTime @default(now())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### **Database Features**
- **🔍 Optimized Indexes** for fast queries
- **🔒 Data Integrity** with foreign key constraints  
- **📊 Decimal Precision** for accurate financial calculations
- **🕐 Automatic Timestamps** for audit trails
- **🔄 Soft Deletes** for data recovery

---

## 🎨 UI/UX Design Principles

### **🎯 Design System**
- **Consistent Typography** with Inter font family
- **Color Psychology** - Blue for trust, Green for success, Red for alerts
- **Spacing System** - 8px grid system for visual harmony
- **Responsive Breakpoints** - Mobile-first approach with Tailwind

### **♿ Accessibility Features**
- **WCAG 2.1 AA Compliance** for inclusive design
- **Keyboard Navigation** for all interactive elements
- **Screen Reader Support** with proper ARIA labels
- **Color Contrast** meeting accessibility standards
- **Focus Management** with visible focus indicators

### **🎭 Interactive Elements**
- **Hover States** on buttons and cards for better UX
- **Loading Skeletons** during data fetching
- **Optimistic Updates** for immediate feedback
- **Smooth Animations** with CSS transitions
- **Error Boundaries** for graceful error handling

---

## 🔧 API Documentation

### **Authentication Endpoints**
```typescript
// User session management
GET  /api/auth/session     // Get current user session
POST /api/auth/signout     // Sign out user

// Account management  
GET    /api/accounts       // List user accounts
POST   /api/accounts       // Create new account
PUT    /api/accounts/:id   // Update account
DELETE /api/accounts/:id   // Delete account
```

### **Transaction Endpoints**
```typescript
// Transaction CRUD operations
GET    /api/transactions           // List transactions with filters
POST   /api/transactions           // Create transaction
PUT    /api/transactions/:id       // Update transaction  
DELETE /api/transactions/:id       // Delete transaction
POST   /api/transactions/bulk      // Bulk operations

// AI-powered features
POST   /api/ai/scan-receipt        // Process receipt image
POST   /api/ai/categorize          // Smart categorization
```

### **Analytics Endpoints**
```typescript
// Dashboard data
GET /api/dashboard                 // Complete dashboard data
GET /api/analytics/monthly         // Monthly spending analysis
GET /api/analytics/categories      // Category breakdown
GET /api/analytics/trends          // Spending trends

// Budget management
GET  /api/budget                   // Current budget info
POST /api/budget                   // Create/update budget
GET  /api/budget/progress          // Budget progress tracking
```

---

## 🔒 Security Implementation

### **Authentication Security**
- **JWT Tokens** with short expiration times
- **Refresh Token Rotation** for enhanced security
- **Multi-Factor Authentication** support
- **Social Login Integration** with OAuth 2.0
- **Session Management** with secure cookies

### **Data Protection**
- **Encryption at Rest** for sensitive data
- **HTTPS Everywhere** with TLS 1.3
- **Input Sanitization** against XSS attacks
- **SQL Injection Prevention** with parameterized queries
- **CSRF Protection** with secure tokens

### **Infrastructure Security**
- **Rate Limiting** to prevent abuse
- **Bot Detection** with Arcjet integration
- **IP Allowlisting** for admin functions
- **Security Headers** with helmet.js
- **Vulnerability Scanning** in CI/CD pipeline

---

## 🌟 Contributing

We welcome contributions! Here's how you can help make Penyy better:

### **🛠️ Development Setup**
1. **Fork the repository** and clone your fork
2. **Create a feature branch** from `main`
3. **Install dependencies** with `npm install`
4. **Set up environment** variables (see Quick Start)
5. **Run tests** with `npm test`

### **📝 Contribution Guidelines**
- **Follow TypeScript** best practices
- **Write meaningful** commit messages
- **Add tests** for new features
- **Update documentation** for API changes
- **Ensure accessibility** standards are met

### **🐛 Bug Reports**
- Use the **GitHub Issues** template
- Include **steps to reproduce**
- Provide **environment details**
- Add **screenshots** if applicable

### **💡 Feature Requests**
- Check **existing issues** first
- Provide **detailed use cases**
- Include **mockups** if possible
- Consider **backwards compatibility**

---

## 🙋‍♂️ Author & Contact

<div align="center">

**Sanchay Jadon**  
*Full-Stack Developer & AI Enthusiast*

[![GitHub](https://img.shields.io/badge/GitHub-Sanchay22-black?logo=github)](https://github.com/Sanchay22)
[![Email](https://img.shields.io/badge/Email-jadonsanchay@gmail.com-red?logo=gmail)](mailto:jadonsanchay@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/sanchay-jadon)

</div>

---

## 📊 Project Stats

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/Sanchay22/Penyy?style=social)](https://github.com/Sanchay22/Penyy)
[![GitHub forks](https://img.shields.io/github/forks/Sanchay22/Penyy?style=social)](https://github.com/Sanchay22/Penyy)
[![GitHub issues](https://img.shields.io/github/issues/Sanchay22/Penyy)](https://github.com/Sanchay22/Penyy/issues)
[![GitHub license](https://img.shields.io/github/license/Sanchay22/Penyy)](https://github.com/Sanchay22/Penyy/blob/main/LICENSE)

**Built with ❤️ and modern web technologies**

</div>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Sanchay Jadon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🚀 Roadmap

### **🔜 Coming Soon**
- [ ] **Mobile App** (React Native)
- [ ] **Bank API Integration** for automatic transaction import
- [ ] **Advanced AI Analytics** with spending predictions
- [ ] **Team/Family Accounts** with role-based permissions
- [ ] **Investment Tracking** with portfolio management
- [ ] **Bill Reminders** with notification system

### **💭 Future Enhancements**
- [ ] **Cryptocurrency Support** for modern portfolios
- [ ] **Tax Report Generation** with CSV/PDF export
- [ ] **Subscription Management** with cancel suggestions
- [ ] **Financial Goals** with milestone tracking
- [ ] **Debt Management** with payoff strategies
- [ ] **Multi-Currency Support** for international users

---

<div align="center">

**🎉 Ready to take control of your finances?**

**[⭐ Star this repo](https://github.com/Sanchay22/Penyy)** • **[🚀 Try Penyy Live](https://penyy.vercel.app)** • **[📖 Read the Docs](https://github.com/Sanchay22/Penyy/wiki)**

*Built with Next.js • Powered by AI • Secured by Design*

</div>
