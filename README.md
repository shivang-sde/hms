# Hoarding Management System (HMS)

The **Hoarding Management System (HMS)** is a comprehensive, full-stack enterprise web application designed to manage the complete lifecycle of outdoor advertising holdings (hoardings/billboards). 

It digitizes everything from site inventory and location suggestions (from field staff) to commercial aspects (bookings, clients, contracts), field operations (tasks, maintenance, inspections with GPS & photo proofs), and a fully automated double-entry accounting system tracking revenue, GST, and vendor payouts.

## 🚀 Key Features

### 1. Inventory & Asset Management
- **Holdings Management:** Detailed tracking of all hoarding attributes including dimensions, illumination type, exact GPS coordinates, maintenance cycles, and current booking status.
- **Ownership Contracts:** Manage landowner contracts, rent cycles, deposits, and automated linking to vendor payables.
- **Location Suggestions:** Workflow for field staff to propose new hoarding sites with GPS and photo proofs, subject to admin approval.

### 2. Commercial & Bookings
- **Client & Vendor Management:** Centralized CRM for advertisers (Clients) and landlords/suppliers (Vendors).
- **Bookings & Advertisements:** Schedule bookings, associate advertising artworks, and track campaign dates. Real-time availability conflict prevention.

### 3. Field Operations & Maintenance
- **Task Management:** Assign field tasks (Installation, Mounting, Inspection, Maintenance) to staff.
- **Verifiable Execution:** Task completion requires mandatory GPS location capture and multi-angle photo uploads ensuring staff were physically present at the site.
- **Inspections:** Structured forms for reviewing illumination, structure, and visibility conditions.

### 4. Fully Integrated Accounting Module (Auto-Journaling)
No manual bookkeeping required. Every financial action creates automated double-entry journal records:
- **Invoices (Accounts Receivable):** Generates GST-compliant invoices. Auto-posts journal entries (Dr. Client Receivable, Cr. Revenue + Respective GSTs).
- **Client Receipts:** Tracks incoming payments. Auto-posts entries (Dr. Cash/Bank, Cr. Client Receivable).
- **Vendor Payments (Accounts Payable):** Tracks outgoing rent to site owners. Auto-posts entries (Dr. Vendor Payable, Cr. Cash/Bank).
- **Chart of Accounts:** Group and leaf nodes for Assets, Liabilities, Income, Expenses, and Equity.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js (Auth.js)](https://authjs.dev/)
- **Styling:** Tailwind CSS & shadcn/ui components
- **Validation:** Zod
- **Infrastructure:** Docker (for streamlined deployment and persistent volume mounts for uploaded images)

---

## 💻 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Docker)
- Docker (optional but recommended for production-like environments)

### 1. Clone the repository
```bash
git clone <repository-url>
cd hms
```

### 2. Install dependencies
```bash
npm install
# or yarn install / pnpm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the required environment variables:
```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/hms_db?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-strong-secret-key"

# (Optional) Cloud or local storage paths for image uploads if applicable
UPLOAD_DIR="./public/uploads"
```

### 4. Database Setup
Run Prisma migrations to construct the database schema:
```bash
npx prisma generate
npx prisma db push
# or npx prisma migrate dev
```
*(You may also want to run a seed script if you have one to populate Master Data like Cities, Holding Types, and default Ledgers).*

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 👥 User Roles

The system is strictly role-based:
- **ADMIN:** Has full access to the dashboard, accounting, all commercial records, user management, and advanced reporting.
- **STAFF:** Limited to operational modules. Field staff can view tasks, submit task executions (along with location and photos), propose location suggestions, and report inspections. They cannot access finances, bookings, or client/vendor management.

---

## 🐳 Deployment (Docker)

To deploy the application using Docker, refer to your `docker-compose.yml` (if configured) or build the image directly:
```bash
docker build -t hms-app .
docker run -p 3000:3000 --env-file .env -v hms_uploads:/app/public/uploads hms-app
```
*Note: Make sure to map a persistent volume for uploaded user images/proof so they are not lost between container restarts.*
