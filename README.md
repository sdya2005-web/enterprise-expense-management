# Enterprise SpendFlow - Enterprise Expense Management System

A centralized company-level expense management and financial compliance platform built with **Spring Boot 3**, **Spring Security + JWT**, **MySQL**, **React.js**, and **Tailwind CSS**.

---

## 🌟 System Architecture & Features

### 1. Multi-Tier Role-Based Architecture
The system provides tailored, role-governed experiences for four distinct corporate personas:

1. **Administrator (Divi)**
   - **Executive Name**: Displayed as **"Divi"** across the Admin Dashboard banner, sidebar profile, and top navigation.
   - **Corporate Governance**: Complete CRUD management over employees, departments, and corporate projects.
   - **Financial Oversight**: Live monitoring of all company expenses, policy limits, department budgets, and audit logs.
   - **Reports & Analytics**: Visual charts for monthly trends, department share, burn rates, and Excel/PDF report generation.

2. **Employee (Alex Rivera / Jessica Taylor)**
   - **Self-Service Portal**: Register, authenticate, submit expense claims, and track statuses in real time.
   - **Claim Form**: Title, category, amount, date, business purpose, payment method, department, and project selection.
   - **Receipt Upload**: Upload PDF, JPG, and PNG receipts with client-side and server-side **SHA-256 duplicate detection**.
   - **Personal Summary**: Real-time KPI cards tracking monthly spend, pending reviews, cleared reimbursements, and rejected claims.

3. **Department Manager (Sarah Jenkins)**
   - **Approval Workspace**: Department-scoped request queue for verifying expense receipts and checking compliance warnings.
   - **Decision Making**: Single-click approval or rejection with mandatory feedback reasons.
   - **Department Budgets**: Live tracking of department spending vs. monthly budget caps with threshold alerts.

4. **Finance Team (Mark Vance)**
   - **Disbursement Desk**: Review manager-approved expenses ready for reimbursement.
   - **Payment Execution**: Release funds via Direct Deposit (ACH), Wire Transfer, Corporate Card, or Cheque.
   - **Transaction Ledger**: Automatic generation of unique transaction reference numbers, payment dates, and audit notes.

---

## 💼 Complete 7-Step Expense Workflow

```
[Employee Submits Claim]
         │
         ▼
    [Submitted / Pending Approval]
         │
         ├──► Manager Rejects ──► [Rejected] (with mandatory feedback reason)
         │
         ▼
    Manager Approves
         │
         ▼
[Finance Verification] ──► [Processing Payment]
         │
         ▼
   Finance Releases Funds
         │
         ▼
    [Reimbursed] (Generates transaction reference ID & employee notification)
```

---

## 🛡️ Advanced Security & Enterprise Capabilities

- **SHA-256 Duplicate Receipt Detection**:
  Receipt files are cryptographically hashed upon upload. Attempting to submit a previously uploaded receipt (even with a different file name or under a different expense) is detected and blocked with an audit alert.
- **Dynamic Expense Policy Validation**:
  Configurable limits per category (e.g., Travel max $1,500, Food max $150, etc.). Claims exceeding standard policy limits trigger warnings and require senior review.
- **In-App Notification Center**:
  Real-time notification bell with unread counters notifying users when claims are approved, rejected, or reimbursed.
- **Budget Alerts & Utilization**:
  Visual status meters for departments and projects with automatic warning badges when spending exceeds 80% or 100% of allocation.
- **Export to PDF & Excel**:
  Instant client-side export of clean, styled PDF reports (via `jspdf` & `jspdf-autotable`) and Excel spreadsheets (via `xlsx`).
- **Dark Mode & Light Mode**:
  Toggle between Light Grey theme (`#F7F8FC`) and sleek dark mode (`#0B0F19`) with seamless CSS transitions.
- **One-Click Persona Switcher**:
  Convenient top navbar dropdown allowing quick switching between Admin Divi, Manager Sarah, Finance Mark, and Employee Alex for demonstration purposes.

---

## 🗄️ Database Architecture (`enterprise_expense_db`)

The database is built on **MySQL 8.0** with strict referential integrity and foreign keys:

1. `users` - Corporate identity, roles (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_FINANCE`, `ROLE_EMPLOYEE`), departments, and hashed passwords.
2. `departments` - Business units (Engineering, Sales, Product, Finance, HR) with monthly budget limits and assigned leads.
3. `projects` - Strategic company initiatives with funding allocations.
4. `expenses` - Core expense records with unique expense numbers (`EXP-YYYYMMDD-...`), amounts, categories, and workflow statuses.
5. `expense_receipts` - Stored file metadata, file URLs, and indexed `file_hash` (SHA-256).
6. `approvals` - Formal decisions logged by managers and administrators with comments.
7. `budgets` - Monthly department and project budget tracking with utilization calculations.
8. `reimbursements` - Payout ledger containing transaction references, disbursement methods, and release dates.
9. `notifications` - In-app notification messages and read/unread flags.
10. `audit_logs` - Immutable compliance audit trail tracking user actions, entity IDs, timestamps, and IP addresses.
11. `expense_policies` - Category spending rules, maximum auto-approval caps, and receipt requirements.

---

## 🔑 Pre-Configured Demo Accounts

| Role | Name | Email | Password | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | **Divi** | `admin@enterprise.com` | `admin123` | Full company control, employees, departments, projects, budgets, analytics |
| **Department Manager** | Sarah Jenkins | `manager@enterprise.com` | `manager123` | Engineering department review, approve/reject claims, team budget monitoring |
| **Finance Team** | Mark Vance | `finance@enterprise.com` | `finance123` | Disburse approved claims, manage reimbursement ledger, financial reports |
| **Employee** | Alex Rivera | `employee@enterprise.com` | `employee123` | Submit claims, upload receipts, track approvals and reimbursement status |

*All accounts are automatically seeded into MySQL on first application startup.*

---

## 🚀 Execution & Running Instructions

### Prerequisites
- **Java**: JDK 21+ or JDK 26 installed.
- **Maven**: 3.9+ installed.
- **Node.js**: v18+ or v24+ with npm.
- **MySQL**: 8.0+ running on `localhost:3306`.

---

### Step 1: Database Setup
1. Verify MySQL is running on `localhost:3306`.
2. Ensure the database `enterprise_expense_db` exists:
   ```sql
   CREATE DATABASE IF NOT EXISTS enterprise_expense_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Update credentials in `backend/src/main/resources/application.properties` if needed:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/enterprise_expense_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata&createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=sdya@12345
   ```

---

### Step 2: Start the Java Spring Boot Backend
Open a terminal in the project root:
```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-26.0.2.1"
mvn spring-boot:run
```
- The backend starts on: **`http://localhost:8080`**
- It automatically seeds default departments, users (including Admin **Divi**), policies, projects, budgets, and sample expenses.

---

### Step 3: Start the React Frontend
Open another terminal:
```powershell
cd frontend
npm install
npm run dev
```
- The frontend will launch at: **`http://localhost:5173`**
- Requests to `/api/...` and `/uploads/...` are automatically proxied to Spring Boot at `http://localhost:8080`.

---

## 🎨 UI/UX Theme Specifications

- **Primary Color**: Deep Purple (`#6C3CE8`)
- **Primary Hover**: `#5A2FD1`
- **Background**: Light Grey (`#F7F8FC`) in Light Mode / Navy Slate (`#0B0F19`) in Dark Mode
- **Cards**: Pure White (`#FFFFFF`) / Dark Slate (`#1E293B`)
- **Text**: Dark Navy (`#0F172A`) / Crisp White (`#F8FAFC`)
- **Success / Reimbursed**: Emerald Green (`#10B981`)
- **Warning / Review**: Amber Orange (`#F59E0B`)
- **Danger / Rejected**: Crimson Red (`#EF4444`)

---

## 🧪 Verification & API Testing

### Test Login via REST API:
```bash
curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@enterprise.com","password":"admin123"}'
```

### Test Duplicate Receipt Detection:
Submitting the same receipt binary twice will trigger:
```json
{
  "message": "DUPLICATE RECEIPT DETECTED: This exact receipt file was already submitted for Expense #EXP-.... Potential duplicate claim!",
  "errorType": "DUPLICATE_RECEIPT"
}
```
