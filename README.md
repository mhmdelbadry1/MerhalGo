# 🚢 MirhalGO - Modern Shipping & Logistics Platform

MirhalGO is a comprehensive shipping platform connecting customers with logistics companies for local and international shipping, featuring local delivery, international freight, and specialized Chinese store shipping (Shein/AliExpress).

## 🌟 Features

- **Unified Portal:** Seamless experience for Customers, Companies, and Admins.
- **Order Management:** Create and track Local, International, and specialized orders.
- **Bidding System:** Companies can view available orders and submit offers.
- **Real-time Updates:** Status tracking for orders and offers.
- **Admin Dashboard:** Complete oversight of companies, orders, and platform statistics.
- **Secure Authentication:** Role-based access control (RBAC) with Supabase Auth.
- **Document Management:** Secure upload and storage (RLS protected) for shipping docs.

## 🛠️ Tech Stack

- **Frontend:** React + Vite, TailwindCSS (Glassmorphism Design)
- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL) with Row Level Security (RLS)
- **State Management:** React Context API
- **Testing:** Jest + Supertest (50+ Auto-tests)

## 📂 Project Structure

```
d:\mirhago\
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # UI Components
│   │   ├── services/   # API Clients (auth, company, admin)
│   │   └── contexts/   # Auth & Toast Contexts
├── server/             # Express API
│   ├── src/
│   │   ├── controllers/# Business Logic
│   │   ├── routes/     # API Routes
│   │   ├── middleware/ # Auth & Validation
│   │   └── config/     # Supabase Admin Setup
│   └── tests/          # Automated Test Suite
└── supabase-schema.sql # Complete Database Schema
```

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v16+)
- Supabase Project

### 2. Environment Variables

**Frontend (`frontend/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

**Backend (`server/.env`):**
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Test Credentials
TEST_ADMIN_PASSWORD=...
TEST_CUSTOMER_PASSWORD=...
TEST_COMPANY_PASSWORD=...
```

### 3. Database Setup
1. Copy `supabase-schema.sql` content.
2. Run it in your Supabase SQL Editor.
3. (Optional) Run `setup_storage.sql` to configure storage buckets.

### 4. Running the App

**Start Backend:**
```bash
cd server
npm install
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Automated Testing

The project includes a robust test suite covering Security, Auth, Orders, and Company flows.

```bash
cd server
npm test
```

**Test Coverage:**
- ✅ **Security:** XSS, SQLi, Rate Limiting, RBAC
- ✅ **Auth:** Login, Session, Profile Management
- ✅ **Orders:** Creation, Validation, Status Flow
- ✅ **Offers:** Life-cycle (Submit -> View -> Update -> Delete)

## 📝 Deployment

1. **Frontend:** Build for production:
   ```bash
   cd frontend
   npm run build
   # Output is in dist/ folder
   ```
2. **Backend:** Deploy `server/` to a Node.js host (Render, Railway, Heroku).
3. **Database:** Ensure RLS policies are active (included in schema).

---
*Done: Jan 2026*
