# Hoarding Management System (HMS)
## Complete User Manual

> **Document Version:** 1.0
> **Prepared For:** Client Reference
> **Last Updated:** March 2026
<!-- > **Technology Stack:** Next.js � PostgreSQL � Prisma ORM � Next-Auth -->

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles and Access](#2-user-roles-and-access)
3. [Master Data Setup](#3-master-data-setup)
4. [Holdings Management](#4-holdings-management)
5. [Ownership Contracts](#5-ownership-contracts)
6. [Client Management](#6-client-management)
7. [Vendor Management](#7-vendor-management)
8. [Bookings](#8-bookings)
9. [Advertisements](#9-advertisements)
10. [Tasks and Field Operations](#10-tasks-and-field-operations)
11. [Inspections and Maintenance](#11-inspections-and-maintenance)
12. [Billing Invoices](#12-billing-invoices)
13. [Billing Receipts Client Payments](#13-billing-receipts-client-payments)
14. [Vendor Payments](#14-vendor-payments)
15. [Accounting Module](#15-accounting-module)
16. [Location Suggestions](#16-location-suggestions)
17. [Reports Module](#17-reports-module)
18. [System Flow End to End](#18-system-flow-end-to-end)
19. [Module Relationship Map](#19-module-relationship-map)
20. [Glossary](#20-glossary)

---

## 1. System Overview

The **Hoarding Management System (HMS)** is a full-stack enterprise application built to manage the complete lifecycle of outdoor advertising holdings (hoardings / billboards). It covers:

- **Inventory** - Digital register of all hoarding sites
- **Commercial** - Booking, billing, and client management
- **Operations** - Field tasks, inspections, and maintenance
- **Finance** - Fully integrated double-entry accounting with auto-posted journal entries

**Core Principle:** Every financial transaction (invoice raised, payment received, vendor payment made) automatically generates a balanced journal entry in the ledger � no manual bookkeeping required.

---

## 2. User Roles and Access

| Role | Access Level |
|------|-------------|
| **Admin** | Full access to all modules including accounting, user management, and reports |
| **Staff** | Access to operational modules � tasks, inspections, location suggestions, task execution |

- Login is required for all protected routes.
- Staff cannot access the accounting module or admin settings.
- All task executions require GPS verification (latitude/longitude captured at the time of marking a task complete).

---

## 3. Master Data Setup

Master data is the foundation of the system. It must be configured **before** any holdings, bookings, or billing can be created.

### 3.1 Cities

Manages the geographic locations where holdings are situated.

| Field | Description |
|-------|-------------|
| Name | City name (e.g., Indore) |
| State | State name (e.g., Madhya Pradesh) |
| Country | Default: India |
| Active | Toggle to activate/deactivate |

**Unique Rule:** No two cities with the same name+state combination are allowed.

### 3.2 Holding Types

Classifies the type of hoarding structure.

| Field | Description |
|-------|-------------|
| Name | E.g., Unipole, Gantry, Wall Mount, LED Board |
| Description | Optional description |

### 3.3 HSN Codes

HSN (Harmonized System of Nomenclature) codes are used for GST compliance on invoices.

| Field | Description |
|-------|-------------|
| Code | 4/6/8-digit HSN code per GST rules |
| Description | What it covers |
| GST Rate (%) | Default GST rate applied to this code |

Each holding is tagged with an HSN code. When an invoice is generated, the HSN code from the booking flows into the invoice automatically.

---

## 4. Holdings Management

A **Holding** is the core asset of the system � a physical hoarding/billboard site.

### 4.1 Holding Fields

| Field | Description |
|-------|-------------|
| Code | Unique identifier (e.g., IND-001) |
| Name | Descriptive name |
| Address | Physical address |
| Latitude / Longitude | GPS coordinates for map location |
| Width x Height | Physical dimensions in feet/meters |
| Total Area | Computed display area (sq. ft.) |
| Illumination | LIT / NON_LIT / DIGITAL |
| Facing | Road-facing direction |
| Landmark | Nearest landmark |
| Status | AVAILABLE / BOOKED / UNDER_MAINTENANCE / INACTIVE |
| Maintenance Cycle | Days between scheduled maintenance (default: 90 days) |
| City | Linked from master data |
| Holding Type | Linked from master data |
| HSN Code | GST classification from master data |

### 4.2 Holding Status Flow

```
AVAILABLE  -->  BOOKED  -->  COMPLETED  -->  AVAILABLE
                    |
              UNDER_MAINTENANCE  -->  AVAILABLE / INACTIVE
```

---

## 5. Ownership Contracts

Every holding has an **Ownership Contract** that records the legal/commercial arrangement with the site owner (landlord).

### 5.1 Contract Fields

| Field | Description |
|-------|-------------|
| Contract Number | Unique contract reference |
| Owner Name | Name of the site owner/landlord |
| Owner Type | GOVERNMENT / MUNICIPAL / VILLAGE_PANCHAYAT / PRIVATE |
| Owner Contact / Email / Address | Owner communication details |
| Rent Amount | Monthly/periodic rent to be paid |
| Rent Cycle | MONTHLY / QUARTERLY / HALF_YEARLY / YEARLY |
| Start Date / End Date | Contract validity period |
| Security Deposit | One-time refundable deposit |
| Status | ACTIVE / EXPIRED / TERMINATED / PENDING |
| Holding | The holding site this contract belongs to |

A holding can have multiple contracts (e.g., old expired + new active), but typically one active contract at a time. Ownership contracts are also linked to **Vendors** � the vendor record tracks the payee for rental payments.

---

## 6. Client Management

**Clients** are the advertising companies or brands that book holdings.

### 6.1 Client Fields

| Field | Description |
|-------|-------------|
| Name | Company/client name |
| Contact Person | Primary contact |
| Email / Phone | Communication details |
| GST Number | GST registration (for GST invoices) |
| PAN Number | PAN for compliance |
| Address | Billing address |
| City | Linked city |
| Ledger | Auto-assigned Accounts Receivable ledger |

**Ledger Auto-Creation:** When the first invoice for a client is posted, the system automatically creates a sub-ledger under "Accounts Receivable" for that client (e.g., `ABC Pvt Ltd - Receivable`). This ledger tracks all outstanding amounts for the client.

---

## 7. Vendor Management

**Vendors** are site owners / landlords to whom rental payments are made.

### 7.1 Vendor Fields

| Field | Description |
|-------|-------------|
| Name | Vendor/owner name |
| Contact Person / Email / Phone | Communication details |
| GST Number / PAN Number | Tax compliance |
| Address | Vendor address |
| City | Linked city |
| Ownership Contract | Linked contract (optional) |
| Ledger | Accounts Payable ledger (required) |

**Ledger Auto-Creation:** If a vendor payable ledger does not exist, the system creates a sub-ledger under "Accounts Payable" automatically (e.g., `Ram Landlord - Payable`) when the first payment is processed.

---

## 8. Bookings

A **Booking** is the commercial agreement between HMS and a Client to display advertising on a holding for a defined period.

### 8.1 Booking Fields

| Field | Description |
|-------|-------------|
| Booking Number | Unique reference (e.g., BK-2024-00001) |
| Client | The advertiser |
| Holding | The hoarding site |
| Start Date / End Date | Campaign period |
| Monthly Rate | Rate charged per month |
| Total Amount | Monthly Rate x duration |
| Billing Cycle | MONTHLY / QUARTERLY / HALF_YEARLY / YEARLY |
| Free Mountings | Number of free mounting services included |
| Total Mountings | Total mounting visits planned |
| Status | CONFIRMED / ACTIVE / COMPLETED / CANCELLED |

### 8.2 Booking to Invoice Link

```
Booking  -->  Invoice(s)  -->  Receipt(s)
```

- A booking can have multiple invoices (one per billing cycle)
- Each invoice can have multiple receipts (partial payments allowed)

---

## 9. Advertisements

An **Advertisement** is the creative/campaign that runs within a booking period.

### 9.1 Advertisement Fields

| Field | Description |
|-------|-------------|
| Campaign Name | Name of the advertising campaign |
| Brand Name | Brand being advertised |
| Artwork Description | Notes on the creative |
| Artwork URL | Link to artwork file |
| Installation Date | When artwork is installed |
| Removal Date | When artwork is removed |
| Status | PENDING / INSTALLED / ACTIVE / REMOVED / COMPLETED |
| Booking | Parent booking this advertisement belongs to |

Each advertisement can have Tasks assigned to it (e.g., INSTALLATION, MOUNTING tasks).

---

## 10. Tasks and Field Operations

The **Task** module manages all field work � installations, mountings, maintenance, and inspections assigned to field staff.

### 10.1 Task Fields

| Field | Description |
|-------|-------------|
| Title | Task name |
| Task Type | INSTALLATION / MOUNTING / MAINTENANCE / INSPECTION |
| Priority | LOW / MEDIUM / HIGH / URGENT |
| Status | PENDING / IN_PROGRESS / UNDER_REVIEW / COMPLETED / CANCELLED |
| Scheduled Date | When the task should be performed |
| Completed Date | Actual completion date |
| Assigned To | Staff user responsible |
| Estimated Cost / Actual Cost | Budget vs. actual |
| Holding | Linked holding site |
| Advertisement | Linked advertisement (if applicable) |

### 10.2 Task Execution (Field Completion)

When a staff member completes a task in the field, they submit a Task Execution record with proof:

| Field | Description |
|-------|-------------|
| Status | COMPLETED / UNDER_REVIEW / CANCELLED |
| Condition | EXCELLENT / GOOD / FAIR / POOR / CRITICAL |
| Remarks | Field notes |
| GPS Coordinates | Latitude + Longitude (captured automatically from device) |
| Front View Photo | Mandatory photo from front |
| Left View Photo | Mandatory photo from left |
| Right View Photo | Mandatory photo from right |

**GPS Verification:** The system captures the field staff GPS coordinates at the time of task execution to verify on-site presence. Photos are uploaded and stored securely.

---

## 11. Inspections and Maintenance

### 11.1 Inspections

Regular condition checks of holdings are recorded as Inspections.

| Field | Description |
|-------|-------------|
| Inspection Date | Date of inspection |
| Inspector Name | Name of the inspector |
| Condition | EXCELLENT / GOOD / FAIR / POOR / CRITICAL |
| Illumination OK | Whether lighting is working |
| Structure OK | Whether structure is intact |
| Visibility OK | Whether visibility is unobstructed |
| Remarks | Inspector notes |
| Photos | Multiple inspection photos attached |

### 11.2 Maintenance Records

| Field | Description |
|-------|-------------|
| Maintenance Type | PAINTING / STRUCTURAL_REPAIR / ELECTRICAL / CLEANING / REPLACEMENT / OTHER |
| Description | What was done |
| Cost | Amount spent |
| Performed Date | Date of maintenance |
| Performed By | Name of service provider |
| Status | SCHEDULED / IN_PROGRESS / COMPLETED / CANCELLED |

---

## 12. Billing Invoices

An **Invoice** is the formal tax document raised to a client for hoarding rental services.

### 12.1 Invoice Fields

| Field | Description |
|-------|-------------|
| Invoice Number | Unique reference (system-generated) |
| Invoice Date | Date of invoice |
| Due Date | Payment due date |
| Client | Billed client |
| Booking | Related booking |
| HSN Code | GST classification |
| Subtotal | Amount before tax |
| CGST Rate / Amount | Central GST (e.g., 9%) |
| SGST Rate / Amount | State GST (e.g., 9%) |
| IGST Rate / Amount | Integrated GST for inter-state (e.g., 18%) |
| Total Amount | Subtotal + All taxes |
| Paid Amount | Amount received so far |
| Status | DRAFT / SENT / PAID / PARTIALLY_PAID / OVERDUE / CANCELLED |

### 12.2 Invoice Line Items

| Field | Description |
|-------|-------------|
| Description | Service description |
| HSN Code | Per-item HSN code |
| Quantity | Number of units (months/periods) |
| Rate | Rate per unit |
| Amount | Quantity x Rate |
| GST Rate / Amount | Applicable GST |
| Total | Amount + GST Amount |

When an invoice is posted, the system automatically creates a Journal Entry (see Section 15.3).

---

## 13. Billing Receipts Client Payments

A **Receipt** records money received from a client against an invoice.

### 13.1 Receipt Fields

| Field | Description |
|-------|-------------|
| Receipt Number | Unique reference |
| Receipt Date | Date of payment receipt |
| Amount | Amount received |
| Payment Mode | CASH / CHEQUE / NEFT / RTGS / UPI / CARD / OTHER |
| Reference No | Cheque number / UTR / transaction ID |
| Client | Who paid |
| Invoice | Which invoice this is against |
| Cash/Bank Ledger | Which Cash or Bank account received the money |
| Notes | Additional remarks |

When a receipt is saved, the system automatically creates a Journal Entry and updates the invoice paid amount. If paid amount equals total amount, invoice becomes PAID; otherwise PARTIALLY_PAID.

---

## 14. Vendor Payments

A **Payment** records money paid out to a vendor (site owner/landlord) for rent.

### 14.1 Payment Fields

| Field | Description |
|-------|-------------|
| Payment Number | Unique reference (e.g., PAY-2024-00001) |
| Payment Date | Date of payment |
| Amount | Amount paid |
| Payment Mode | CASH / CHEQUE / NEFT / RTGS / UPI / CARD / OTHER |
| Reference No | Transaction reference |
| Vendor | Who was paid |
| Cash/Bank Ledger | Account from which payment was made |
| Notes | Remarks |

When a payment is saved, the system automatically creates a Journal Entry (see Section 15.5).

---

## 15. Accounting Module

HMS has a **fully integrated double-entry accounting system**. Every billing and payment action automatically posts a balanced journal entry.

### 15.1 Chart of Accounts (Ledgers)

#### Ledger Types

| Type | Examples |
|------|----------|
| **ASSET** | Cash in Hand, Bank Account, Accounts Receivable |
| **LIABILITY** | Accounts Payable, GST Payable |
| **INCOME** | Hoarding Revenue / Rental Income |
| **EXPENSE** | Rent Expense, Maintenance Expense |
| **EQUITY** | Capital, Retained Earnings |

#### Ledger Flags (Special Purpose Markers)

| Flag | Purpose |
|------|---------|
| isCash | Marks "Cash in Hand" � used for cash receipts/payments |
| isBank | Marks a "Bank Account" � used for bank receipts/payments |
| isReceivable | Marks parent group for Client Receivable sub-ledgers |
| isPayable | Marks parent group for Vendor Payable sub-ledgers |
| isRevenue | Marks the Revenue ledger for invoice auto-posting |
| isTaxOutput | Marks GST output ledgers (CGST, SGST, IGST Payable) |
| isTaxInput | Marks GST input ledgers (for purchase invoices) |
| isGroup | Group/header ledger � child ledgers hold actual entries |

#### Recommended Initial Ledger Setup

```
Assets
  Cash in Hand              [isCash]
  HDFC Bank Current A/c     [isBank]
  ICICI Bank A/c            [isBank]
  Accounts Receivable       [isReceivable, isGroup]
    ABC Pvt Ltd - Receivable    <- auto-created on first invoice
    XYZ Corp - Receivable       <- auto-created on first invoice

Liabilities
  CGST Payable              [isTaxOutput]
  SGST Payable              [isTaxOutput]
  IGST Payable              [isTaxOutput]
  Accounts Payable          [isPayable, isGroup]
    Ram Landlord - Payable      <- auto-created on first payment
    City Corp - Payable         <- auto-created on first payment

Income
  Hoarding Rental Revenue   [isRevenue]

Expense
  Site Rent Expense
  Maintenance Expense
```

---

### 15.2 Journal Entries � How They Are Auto-Created

Every time a financial document is saved (Invoice / Receipt / Payment), the system:

1. Looks up the relevant ledgers using the flag system
2. Builds a balanced set of debit and credit lines
3. Validates that Total Debits = Total Credits (double-entry rule)
4. Creates a JournalEntry with status POSTED
5. Links the journal entry back to the source document
6. Assigns a unique journal number: JE-YYYY-NNNNN

Manual journal entries can also be created by Admins from Accounting > Journal Entries.

---

### 15.3 Invoice Journal Entry

**Trigger:** When an invoice is created/posted for a client booking.

**What it represents:** HMS has earned revenue and the client owes money.

| # | Account | Debit (Dr) | Credit (Cr) |
|---|---------|-----------|------------|
| 1 | Client Receivable (e.g., ABC Pvt Ltd - Receivable) | Total Invoice Amount | � |
| 2 | Hoarding Rental Revenue | � | Subtotal (before tax) |
| 3 | CGST Payable | � | CGST Amount |
| 4 | SGST Payable | � | SGST Amount |
| 5 | IGST Payable (if inter-state) | � | IGST Amount |

**Example � Invoice of Rs 1,18,000 (Rs 1,00,000 + 9% CGST + 9% SGST):**

| Account | Dr | Cr |
|---------|----|----|
| ABC Pvt Ltd - Receivable | Rs 1,18,000 | � |
| Hoarding Rental Revenue | � | Rs 1,00,000 |
| CGST Payable | � | Rs 9,000 |
| SGST Payable | � | Rs 9,000 |
| **Total** | **Rs 1,18,000** | **Rs 1,18,000** |

Effect on Books:
- Client receivable balance increases (they owe you more)
- Revenue increases
- GST liability to government increases

---

### 15.4 Receipt Journal Entry

**Trigger:** When a receipt is recorded (client pays an invoice).

**What it represents:** Cash/bank balance increases and client outstanding debt decreases.

| # | Account | Debit (Dr) | Credit (Cr) |
|---|---------|-----------|------------|
| 1 | Cash / Bank Ledger (selected at receipt) | Receipt Amount | � |
| 2 | Client Receivable (auto-fetched from client ledger) | � | Receipt Amount |

**Example � Client pays Rs 1,18,000 via NEFT into HDFC Bank:**

| Account | Dr | Cr |
|---------|----|----|
| HDFC Bank Current A/c | Rs 1,18,000 | � |
| ABC Pvt Ltd - Receivable | � | Rs 1,18,000 |
| **Total** | **Rs 1,18,000** | **Rs 1,18,000** |

Effect on Books:
- Bank balance increases by receipt amount
- Client receivable balance decreases (they owe you less)
- Invoice status updated to PAID or PARTIALLY_PAID

---

### 15.5 Vendor Payment Journal Entry

**Trigger:** When a payment is made to a vendor (landlord rent payment).

**What it represents:** Cash/bank decreases and vendor liability is cleared.

| # | Account | Debit (Dr) | Credit (Cr) |
|---|---------|-----------|------------|
| 1 | Vendor Payable (auto-fetched from vendor ledger) | Payment Amount | � |
| 2 | Cash / Bank Ledger (selected at payment) | � | Payment Amount |

**Example � Paying Rs 25,000 rent to Ram Landlord via NEFT from HDFC Bank:**

| Account | Dr | Cr |
|---------|----|----|
| Ram Landlord - Payable | Rs 25,000 | � |
| HDFC Bank Current A/c | � | Rs 25,000 |
| **Total** | **Rs 25,000** | **Rs 25,000** |

Effect on Books:
- Vendor payable balance decreases (liability cleared)
- Bank balance decreases by paid amount

---

### 15.6 Manual Journal Entries

Admins can create manual journal entries for:
- Opening balances
- Corrections and adjustments
- Depreciation and write-offs
- Expenses not covered by vendor payments

Validation Rules:
- Minimum 2 lines per entry
- Each line must have debit OR credit (not both)
- Total Debits must equal Total Credits (enforced by system)
- Status: DRAFT -> POSTED -> VOID

---

## 16. Location Suggestions

Field staff can submit **Location Suggestions** � proposed new hoarding sites discovered during field visits.

| Field | Description |
|-------|-------------|
| Address | Physical address of the proposed site |
| City | City where it is located |
| Landmark | Nearest landmark |
| GPS Coordinates | Latitude / Longitude |
| Description | Details about the site |
| Photos | Multiple site photos |
| Proposed Rent | Estimated rent/cost |
| Owner Name / Phone | Site owner contact |
| Status | PENDING / ACCEPTED / REJECTED |

Admin reviews suggestions and either accepts (converts to a holding) or rejects them.

---

## 17. Reports Module

| Report | Description |
|--------|-------------|
| Revenue Report | Total revenue by period, client, or holding |
| Occupancy Report | Which holdings are booked vs. available |
| Client Outstanding | Pending receivables per client |
| Vendor Payables | Pending payments to vendors |
| Booking Summary | All bookings with status and value |
| Task Summary | Field task completion rates |
| Maintenance Cost Report | Spending on maintenance by holding/type |
| Ledger Balance | Current balance of any ledger account |

---

## 18. System Flow End to End

```
STEP 1 � MASTER SETUP
  Add City -> Add Holding Type -> Add HSN Code

STEP 2 � SITE ACQUISITION
  Create Holding -> Create Ownership Contract -> Create Vendor (landlord)
  (Vendor Payable Ledger is auto-created)

STEP 3 � CLIENT ONBOARDING
  Create Client
  (Client Receivable Ledger auto-created on first invoice)

STEP 4 � BOOKING
  Create Booking (Client + Holding + Period + Rate)
  Holding status changes to BOOKED

STEP 5 � ADVERTISEMENT
  Create Advertisement under Booking
  Assign Installation / Mounting Tasks to field staff

STEP 6 � FIELD OPERATIONS
  Staff logs in, sees assigned Tasks
  Staff executes Task -> Submits GPS + 3 Photos
  Task status -> COMPLETED / UNDER_REVIEW

STEP 7 � BILLING (INCOME SIDE)
  Create Invoice for Booking period
  Journal Entry AUTO-POSTED:
    Dr: Client Receivable
    Cr: Revenue + CGST Payable + SGST Payable

  Record Receipt when client pays
  Journal Entry AUTO-POSTED:
    Dr: Bank / Cash
    Cr: Client Receivable
  Invoice status -> PAID / PARTIALLY_PAID

STEP 8 � VENDOR PAYMENT (EXPENSE SIDE)
  Record Payment to Vendor (monthly rent)
  Journal Entry AUTO-POSTED:
    Dr: Vendor Payable
    Cr: Bank / Cash

STEP 9 � REPORTING
  View outstanding balances, revenue, occupancy, task stats
```

---

## 19. Module Relationship Map

```
City -------------------------------------------------+
                                                       |
HoldingType --------+                                  |
                    v                                  v
HsnCode -------> Holding <-- OwnershipContract <-- Vendor
                    |                                  |
                    v                                  v
Client -------> Booking                            Payment
  |                 |                                  |
  v                 v                                  v
Ledger(AR)    Advertisement                    JournalEntry
  |                 |
  v                 v
Invoice <---    Task --> TaskExecution (GPS + Photos)
  |
  v
Receipt --> JournalEntry --> JournalLines (Dr/Cr)
  |
Ledger (Cash/Bank)
```

---

## 20. Glossary

| Term | Definition |
|------|-----------|
| Holding | A physical hoarding/billboard site managed by HMS |
| Booking | Commercial agreement to display ads on a holding for a period |
| Advertisement | A specific campaign/creative running under a booking |
| Ownership Contract | Agreement with the site land/space owner |
| Vendor | A landlord or space owner to whom rent is paid |
| Client | An advertiser or agency that books holdings |
| Invoice | Tax document raised to a client for services |
| Receipt | Record of money received from a client |
| Payment | Record of money paid out to a vendor |
| Journal Entry | Accounting record with balanced debit/credit lines |
| Ledger | An account in the Chart of Accounts |
| HSN Code | Harmonized System of Nomenclature for GST classification |
| CGST | Central Goods and Services Tax |
| SGST | State Goods and Services Tax |
| IGST | Integrated GST for inter-state transactions |
| Dr (Debit) | Left side of a journal entry |
| Cr (Credit) | Right side of a journal entry |
| Accounts Receivable | Money owed to the company by clients |
| Accounts Payable | Money owed by the company to vendors |
| Task Execution | On-site completion record with GPS and photos |
| Location Suggestion | A field staff proposal for a new hoarding site |

---

*� 2026 HMS � Hoarding Management System. All rights reserved.*
