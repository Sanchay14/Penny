# Pennie – AI-Powered Personal Finance Dashboard

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-blue?logo=next.js)](https://nextjs.org/)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-blueviolet)](https://clerk.com/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma-3982CE?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Style-TailwindCSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> **Track your finances with intelligence.**  
> **Pennie** is a modern, AI-powered financial assistant that helps you track expenses, analyze spending, and make smarter financial decisions—all in one secure, beautiful dashboard.

---

## ✨ Why Pennie? (What Makes This Project Stand Out)

- **AI-Driven:** Uses Google Gemini AI for receipt scanning and smart analytics.
- **Enterprise-Grade Security:** Clerk authentication, Arcjet security, and bot protection.
- **Modern UX:** Built with Next.js, Tailwind, and Radix UI for a seamless, accessible experience.
- **Scalable & Modular:** Clean architecture, scalable database models, and robust API design.
- **Real-World Ready:** Designed for both individuals and families/groups, with recurring transactions, budgets, and multi-account support.
- **Production-Ready:** Follows best practices for deployment, environment management, and code quality.

---

## 🖼️ Screenshots

> _Add your dashboard screenshot here for maximum impact!_

![Dashboard Preview](public/banner.jpg)

---

## 🚀 Features

- **Multi-Account Analysis:** Unified dashboard for all your accounts.
- **AI Bill Photo Detection:** Snap receipts, let AI extract and record details.
- **Smart Budget Alerts:** Set limits, get email reminders.
- **Monthly Tracking Reports:** Detailed analysis delivered to your inbox.
- **AI Enhanced Analytics:** Deep insights into your spending.
- **Enterprise Security:** Clerk, Arcjet, and bot protection.

---

## 🛠️ Tech Stack

- **Next.js** (React framework)
- **Prisma** (PostgreSQL ORM)
- **Clerk** (Authentication)
- **Arcjet** (Security)
- **Google Gemini AI** (Receipt scanning)
- **Tailwind CSS** (Styling)
- **Radix UI** (Accessible UI)
- **TypeScript** (Type safety)
- **Zod** (Validation)
- **Recharts** (Data visualization)

---

## 🧑‍💻 How It Works

1. **Connect Your Accounts:** Securely link your bank accounts and cards.
2. **Snap & Track:** Take photos of bills or let the system auto-track transactions.
3. **Get Smart Insights:** Receive AI-powered insights, budget alerts, and monthly reports.

---

## 🏆 Key Engineering Highlights

- **AI Receipt Scanning:** Integrates Google Gemini for real-time, accurate data extraction from images.
- **Secure Multi-Account Support:** Each user can manage multiple accounts with role-based access.
- **Modular, Scalable Codebase:** Clean separation of concerns, reusable components, and scalable database models.
- **Modern UI/UX:** Responsive, accessible, and visually appealing interface.
- **Robust Testing & Linting:** Ensures code quality and reliability.

---

## 📦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up environment variables:**
   - `DATABASE_URL` for PostgreSQL
   - Clerk/Arcjet credentials
   - `GEMINI_API_KEY` for AI features

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

## 🗄️ Database Models

- **User, Account, Transaction, Budget**
- Supports individual/group modes, recurring transactions, and budget management.

---

## 🙋‍♂️ Contact

**Sanchay Jadon**  
[GitHub](https://github.com/Sanchay22) 
_Email: jadonsanchay@gmail.com_ <!-- (replace with your real email if you want) -->

---

## 📄 License

MIT

---

## 🤝 Contributing

Pull requests and issues are welcome! Please open an issue to discuss what you’d like to change.

---

**_Ready to take control of your finances? Try Pennie today!_**
