# Pennie

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-blue?logo=next.js)](https://nextjs.org/)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-blueviolet)](https://clerk.com/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma-3982CE?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Style-TailwindCSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> **Track your finances with intelligence.**  
> Pennie is an AI-powered financial assistant that helps you track your expenses, analyze spending, and make smarter financial decisions—all in one secure, modern dashboard.

---

## 🚀 Features

- **Multi-Account Analysis**  
  Analyze spending patterns across multiple accounts in one unified dashboard.
- **AI Bill Photo Detection**  
  Snap photos of bills and receipts—our AI automatically extracts and records transaction details.
- **Smart Budget Alerts**  
  Set budget limits and get email reminders when you're approaching your spending threshold.
- **Monthly Tracking Reports**  
  Receive detailed monthly spending analysis reports directly in your inbox.
- **AI Enhanced Analytics**  
  Get intelligent insights on where and how much you spend with advanced AI analysis.
- **Enterprise Security**  
  Protected by Clerk authentication, Arcjet security, and advanced bot protection.

---

## 🛠️ Tech Stack

- **Next.js** (React framework)
- **Prisma** (ORM for PostgreSQL)
- **Clerk** (Authentication)
- **Arcjet** (Security Layer)
- **AI/ML** (Photo Detection)
- **Tailwind CSS** (Styling)
- **Radix UI** (Accessible UI components)
- **Email** (Smart Alerts)

---

## 🧑‍💻 How It Works

1. **Connect Your Accounts**  
   Securely link your bank accounts and credit cards with our encrypted system.
2. **Snap & Track**  
   Take photos of bills or let our system automatically track your transactions.
3. **Get Smart Insights**  
   Receive AI-powered insights, budget alerts, and monthly reports via email.

---

## 💡 What You'll Love

- **Save Time:** No more manual receipt entry—just snap a photo and let AI handle the rest.
- **Stay Protected:** Enterprise-grade security with Clerk authentication and Arcjet protection.
- **Never Miss Budget Limits:** Get timely email alerts when approaching your spending thresholds.

---

## 🏗️ Database Models

- **User, Group, Account, Transaction, Budget**  
  Supports both individual and family/group modes, recurring transactions, and budget management.

---

## 📦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up your environment variables:**
   - `DATABASE_URL` for PostgreSQL
   - Clerk/Arcjet credentials as needed

3. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run lint` – Lint code

---

## 📄 License

MIT

---

## 🙏 Credits

Made with ❤️ by [Sanchay](https://github.com/Sanchay22)

---

## 📣 Contributing

Pull requests and issues are welcome! Please open an issue to discuss what you’d like to change.

---
