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

---




⚙️ Installation & Setup
1. Clone the repository
 ```bash
git clone https://github.com/your-username/reviewboard-case-study.git
cd reviewboard-case-study
````

3. Install dependencies
```bash
npm install
```

5. Configure environment variables

Create a .env file in the root directory:

# Database
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/reviewboard"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

```
4. Setup Prisma
 ```bash
npx prisma generate
npx prisma migrate dev --name init
```
6. Run the development server
```bash
npm run dev
```


The app will be available at:
👉 http://localhost:3000 or https://reviewboard-case-study.vercel.app




