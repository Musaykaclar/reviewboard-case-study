# ReviewBoard Case Study

A full-stack web application built with **Next.js 14**, **TypeScript**, **Prisma**, and **NextAuth.js**.  
The project is designed as a **review and risk scoring platform**, where users can manage items, apply custom rules, and calculate risk scores.  

---

## 🚀 Features

- **Authentication**
  - GitHub and Email login via NextAuth.js
  - Secure session handling
- **Dashboard**
  - View and manage items
  - Risk score calculation
- **Rules Engine**
  - Custom rules affecting risk scores
  - Rule management (CRUD)
- **Contracts & Chatbot**
  - Thread-based chatbot for generating contracts
  - Multilingual support (tr, en, es, it, fr, pt, ru)
  - Contract editing, signing, and PDF export
- **Email Support**
  - Send contracts as PDF to email
- **UI/UX**
  - TailwindCSS for styling
  - Responsive and clean layout
  - Shadcn UI components

---

## 🛠️ Tech Stack

- **Frontend**
  - Next.js 14 (App Router, Server Components, API Routes)
  - React
  - TailwindCSS + Shadcn UI
  - Lucide Icons
- **Backend**
  - Prisma ORM
  - PostgreSQL Database
  - Parse Server for contract storage
- **Authentication**
  - NextAuth.js (GitHub & Email providers)
- **PDF Generation**
  - PDFKit (with Turkish font support)
- **Internationalization**
  - next-intl
  - JSON translation files

---

## 📂 Project Structure

```bash
reviewboard-case-study/
│
├── prisma/                 # Prisma schema & migrations
│   └── schema.prisma
│
├── src/
│   ├── app/
│   │   ├── api/            # API Routes
│   │   │   ├── items/      # Item CRUD
│   │   │   │   └── route.ts
│   │   │   └── rules/      # Rule CRUD
│   │   │       └── route.ts
│   │   ├── dashboard/      # Dashboard UI
│   │   ├── chat-sozlesme/  # Contract editor
│   │   └── page.tsx        # Home Page
│   │
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utilities (Prisma, rules engine, auth)
│   └── styles/             # Global styles
│
├── public/                 # Static assets
│
├── .env                    # Environment variables
├── package.json
├── tsconfig.json
└── README.md

``


⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/your-username/reviewboard-case-study.git
cd reviewboard-case-study

2. Install dependencies
npm install

3. Configure environment variables

Create a .env file in the root directory:

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/reviewboard"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Email Provider (e.g., Gmail SMTP)
EMAIL_SERVER="smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587"
EMAIL_FROM="ReviewBoard <your-email@gmail.com>"

4. Setup Prisma
npx prisma generate
npx prisma migrate dev --name init

5. Run the development server
npm run dev


The app will be available at:
👉 http://localhost:3000⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/your-username/reviewboard-case-study.git
cd reviewboard-case-study

2. Install dependencies
npm install

3. Configure environment variables

Create a .env file in the root directory:

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/reviewboard"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Email Provider (e.g., Gmail SMTP)
EMAIL_SERVER="smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587"
EMAIL_FROM="ReviewBoard <your-email@gmail.com>"

4. Setup Prisma
npx prisma generate
npx prisma migrate dev --name init

5. Run the development server
npm run dev


The app will be available at:
👉 http://localhost:3000


