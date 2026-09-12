# 🎓 Cloud-Native Multi-Tenant Student Records Management System

A production-grade, decoupled full-stack MERN application featuring Google OAuth 2.0 authentication with cross-domain session handoff, strict user-level data isolation (multi-tenancy), memory-buffered CSV streaming, and automated first-time user data seeding.

---

## 🖼️ Application Preview

<p align="center">
  <img src="client/public/image.png" alt="Student Record System Dashboard Preview" width="100%" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

---

## 🚀 Live Deployments

* **Frontend Client (Vercel):** [https://mern-student-records.vercel.app](https://mern-student-records.vercel.app)
* **Backend API (Render):** `https://mern-student-records.onrender.com`

---

## ⚡ Key Architectural Features

* **Multi-Tenant Data Isolation:** Every student record is strictly tied to the authenticated user (`req.user.id`). All CRUD, search, filter, and batch CSV operations are scoped to prevent cross-tenant data leakage.
* **Automated Demo Data Seeding:** When a new user logs in for the first time, the backend automatically seeds a rich set of mock student records directly into their isolated workspace.
* **Decoupled Cross-Domain Authentication:** Overcomes Safari ITP and mobile third-party cookie restrictions using an automated URL token handoff pattern from Google OAuth 2.0 to client-side storage.
* **Streaming CSV Ingestion & Export:** 
  * **Import:** Parses multi-field CSVs via memory buffers and Node.js streams without writing temporary files to disk. Handles delimiter splitting for array-based courses and boolean flags.
  * **Export:** Direct-to-stream dynamic CSV download with no-cache prevention headers.
* **Schema Validation & Error Handling:** Centralized Zod request body validation coupled with custom Mongoose schemas and modular async error handling middleware.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | Passport.js (Google OAuth 2.0), JSON Web Tokens (JWT) |
| **File Processing** | Multer (Memory Storage), `csv-parser`, `json2csv` |
| **Deployment** | Vercel (Client SPA), Render (REST API Web Service) |

---

## 📁 Project Architecture

```text
mern-student-records/
├── client/                     # Frontend Single Page App (Vite + React)
│   ├── public/                 # Static assets & dashboard preview
│   └── src/
│       ├── components/         # Modals, Navbar, Table, and UI elements
│       ├── pages/              # Dashboard and Auth views
│       ├── services/           # Axios API configuration & token interceptors
│       └── App.jsx
│
└── server/                     # Backend REST API (Express + Node.js)
    └── src/
        ├── config/             # MongoDB connection & Passport strategy
        ├── controllers/        # studentController.js, authController.js
        ├── middleware/         # auth.js (protect), errorHandler.js
        ├── models/             # Students.js, User.js
        ├── routes/             # studentRoutes.js, authRoutes.js
        ├── utils/              # sampleStudents.js, asyncHandler.js
        ├── validators/         # studentValidator.js (Zod schemas)
        └── server.js           # Express app bootstrap & middleware pipeline
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
* `GET /api/auth/google` – Initiate Google OAuth flow.
* `GET /api/auth/google/callback` – Google OAuth callback and JWT handoff.
* `GET /api/auth/me` – Retrieve current authenticated user profile (`protect` required).
* `POST /api/auth/logout` – Invalidate current user session.

### Student Management Routes (`/api/students`)
*All student endpoints require `Authorization: Bearer <token>`.*

* `GET /api/students` – Fetch all user-owned records (triggers auto-seeding if empty; supports `?city=` filter).
* `POST /api/students` – Create a new student record scoped to `req.user.id`.
* `PATCH /api/students/:id` – Update an existing record with owner-verification.
* `DELETE /api/students/:id` – Remove a student record with owner-verification.
* `GET /api/students/export/csv` – Stream all user-isolated records to a `.csv` file.
* `POST /api/students/import/csv` – Parse and insert batch records from uploaded CSV.

---

## 💻 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/](https://github.com/)<your-username>/mern-student-records.git
cd mern-student-records
```

### 2. Configure Backend
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/student_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Configure Frontend
```bash
cd ../client
npm install
```

Create a `.env` file inside `client/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend server:
```bash
npm run dev
```

---

## 📊 CSV Import Specification

Uploaded CSV files must include the following column headers:

```csv
Name,Age,City,GPA,Courses,HasPenCard,HasAdhaarCard
Alex Johnson,21,New York,8.5,React; NodeJS; MongoDB,Yes,Yes
Priya Sharma,23,San Francisco,9.1,Python; Data Science; SQL,No,Yes
```

* **Courses:** Delimited with semicolons (`;`) to prevent collision with standard comma separators.
* **ID Cards:** Accepts `Yes`/`No` or `true`/`false`.
