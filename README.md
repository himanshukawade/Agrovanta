# Agrovanta

**Agrovanta** is a full-stack livestock antimicrobial residue risk assessment platform. It uses an interpretable AI model grounded in pharmacokinetic principles to estimate whether animal products (milk or meat) are within safe residue limits, based on treatment scenarios entered by the user.

> ⚠️ This is a demonstration/research platform. Results should not be used as a basis for regulatory, clinical, or commercial decisions.

---

## Features

- **AI-Assisted Residue Risk Prediction** — Pharmacokinetic-inspired logistic regression model that estimates contamination risk from animal treatment data
- **Automatic Withdrawal Period Lookup** — Withdrawal days are auto-detected from a built-in EU/EC MRL reference table based on compound and product type — users don't need to know them
- **Smart Date-Based Compliance** — Enter the treatment date; the system automatically calculates elapsed days since the last dose
- **Multi-language UI** — Full support for English, Hindi (हिंदी), and Marathi (मराठी)
- **Secure Authentication** — JWT-based signup/signin with bcrypt password hashing
- **Modern Dashboard** — Glassmorphism-inspired, fully responsive UI with Framer Motion animations
- **PostgreSQL Backend** — Async database using `asyncpg` with a connection pool

---

## Tech Stack

### Frontend

| Technology | Role |
|---|---|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations and transitions |
| TypeScript | Type-safe frontend code |

### Backend

| Technology | Role |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | Async REST API framework |
| [asyncpg](https://magicstack.github.io/asyncpg/) | High-performance async PostgreSQL driver |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [bcrypt](https://pypi.org/project/bcrypt/) | Password hashing |
| [python-jose](https://pypi.org/project/python-jose/) | JWT token creation and verification |
| [Pydantic v2](https://docs.pydantic.dev/) | Request/response schema validation |
| [Uvicorn](https://www.uvicorn.org/) | ASGI server |

---

## AI Model — Residue Risk Estimator

### Overview

The residue risk estimator uses an **interpretable logistic regression model** inspired by first-order pharmacokinetic drug elimination. This approach mirrors how veterinary MRL compliance is assessed in practice — by comparing time elapsed since dosing against the labeled withdrawal period, normalised by dose and animal characteristics.

### Input Features

| Field | Description |
|---|---|
| `species` | Animal species (cattle, sheep, goat) |
| `product_type` | Output product (`milk` or `meat`) |
| `compound` | Antimicrobial compound name |
| `dosage_mg` | Administered dose in milligrams |
| `weight_kg` | Animal body weight in kg |
| `age_months` | Animal age in months |
| `treatment_date` | Date of last treatment (YYYY-MM-DD) |
| `frequency` | Dosing frequency (once / daily / twice / weekly) |

### Automatically Derived Inputs

These values are **not entered by the user** — they are computed server-side:

| Derived Value | How it is Computed |
|---|---|
| `withdrawal_days` | Looked up from built-in EU/EC MRL compound table by `(compound, product_type)` |
| `days_since_last_dose` | `today − treatment_date` (calculated at request time) |

### Withdrawal Period Lookup Table

Standard withdrawal periods (days) embedded in the backend:

| Compound | Milk | Meat |
|---|---|---|
| Oxytetracycline | 7 | 28 |
| Enrofloxacin | 5 | 14 |
| Penicillin G | 4 | 10 |
| Amoxicillin | 3 | 10 |
| Streptomycin | 5 | 18 |
| Tylosin | 5 | 21 |
| Sulfadiazine | 5 | 10 |

Unlisted compounds fall back to a default of **14 days**.

### Feature Engineering

```
time_ratio         = days_since_last_dose / max(withdrawal_days, 1)

freq_multiplier    = { "twice": 2.0, "daily": 1.0, "once": 0.5, "weekly": 0.14 }

dosage_per_kg      = (dosage_mg × freq_multiplier) / max(weight_kg, 1.0)

age_factor         = 1.0 + (age_months / 120.0)   # older → slower clearance

log_dosage_per_kg  = log₁₀(max(dosage_per_kg × age_factor, 0.01))
```

### Scoring Function

```
linear_score = 0.5
             + (−5.0 × time_ratio)
             + ( 1.5 × log_dosage_per_kg)

probability  = sigmoid(linear_score)
             = 1 / (1 + e^(−linear_score))
```

**Coefficient rationale:**
- `w_time_ratio = −5.0` — A strong negative weight: as more time has passed relative to the withdrawal window, risk drops sharply.
- `w_log_dosage_per_kg = +1.5` — Higher weight-adjusted accumulated dosage increases residue risk.
- `bias = 0.5` — Centres the prior probability around a neutral position.

### Risk Classification

| Probability Range | Risk Label |
|---|---|
| `< 0.33` | 🟢 **LOW** |
| `0.33 – 0.66` | 🟡 **MODERATE** |
| `> 0.66` | 🔴 **HIGH** |

### Compliance Decision

```
compliant = (time_ratio >= 1.0)
```

If `days_since_last_dose >= withdrawal_days`, the animal is past its withdrawal period and is marked **COMPLIANT**. Otherwise it is **IN_WITHDRAWAL** and the response includes the number of remaining days to wait.

---

## Database

Agrovanta uses **PostgreSQL** with the `livestock_monitoring_db` database.

### Authentication Schema (users table)

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  phone           VARCHAR(30),
  hashed_password TEXT NOT NULL,
  role            VARCHAR(50) NOT NULL DEFAULT 'farmer',
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

The database connection uses an `asyncpg` connection pool initialised at FastAPI startup.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/signin` | Sign in, returns JWT |
| `POST` | `/api/predict-residue` | Run residue risk prediction |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/self-test` | Model sanity check |

### POST /api/predict-residue

**Request body:**
```json
{
  "species": "cattle",
  "product_type": "milk",
  "compound": "Oxytetracycline",
  "dosage_mg": 500,
  "weight_kg": 600,
  "age_months": 36,
  "treatment_date": "2025-04-10",
  "frequency": "daily"
}
```

**Response:**
```json
{
  "input": { ... },
  "prediction": {
    "probability": 0.72,
    "risk_label": "HIGH",
    "compliant": false,
    "message": "Product is still within the withdrawal period. Wait at least 3 more days before sending to market.",
    "safe_harvest_date_status": "IN_WITHDRAWAL",
    "withdrawal_days": 7
  }
}
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.12 recommended; v3.14 supported)
- PostgreSQL (v14+) running locally

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1        # Windows PowerShell
# source .venv/bin/activate          # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create the database (password: Admin by default)
$env:PGPASSWORD="Admin"
psql -U postgres -c "CREATE DATABASE livestock_monitoring_db;"
psql -U postgres -d livestock_monitoring_db -f database/setup.sql

# Run the backend server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

### Environment Variables (backend)

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:Admin@localhost:5432/livestock_monitoring_db
JWT_SECRET_KEY=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### Frontend Setup

```bash
cd frontend

npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables (frontend)

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=""
```

Setting this to an empty string makes all `/api/*` calls relative to the frontend dev server, which proxies them to the backend via the Next.js `rewrites` configuration.

---

## Project Structure

```
Agrovanta/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── dataset.py       # CSV loader and feature engineering
│   │   │   └── model.py         # Pharmacokinetic risk model + withdrawal lookup table
│   │   ├── routers/
│   │   │   └── auth.py          # Signup/signin routes with asyncpg
│   │   ├── auth.py              # JWT helpers and password utilities
│   │   ├── db.py                # asyncpg connection pool management
│   │   ├── main.py              # FastAPI app, CORS, routes
│   │   └── schemas.py           # Pydantic input/output models
│   ├── data/
│   │   └── residue_samples.csv  # Training dataset (28 labelled samples)
│   ├── database/
│   │   └── setup.sql            # PostgreSQL schema
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── dashboard/       # Main app dashboard
    │   │   ├── signin/          # Auth pages
    │   │   └── signup/
    │   └── components/
    │       ├── ResidueRiskForm.tsx   # AI prediction form + result panel
    │       └── LanguageProvider.tsx  # EN/HI/MR i18n context
    ├── next.config.mjs          # API proxy rewrites to backend
    └── package.json
```

---

## Dataset

The training dataset (`data/residue_samples.csv`) contains **28 labelled veterinary treatment samples** across three compounds (Oxytetracycline, Enrofloxacin, Penicillin G) for cattle.

**Columns:**

| Column | Description |
|---|---|
| `species` | Animal species |
| `product_type` | `milk` or `meat` |
| `compound` | Antimicrobial name |
| `dosage_mg` | Dose in mg |
| `weight_kg` | Animal weight in kg |
| `age_months` | Animal age in months |
| `treatment_date` | Date of treatment |
| `frequency` | Dosing frequency |
| `withdrawal_days` | Standard withdrawal period |
| `days_since_last_dose` | Elapsed days (for historical records) |
| `compliant` | Ground truth label (0/1) |

---

## Deployment

### Vercel (Frontend)

The frontend includes `vercel.json` for correct client-side routing. Set the environment variable `NEXT_PUBLIC_BACKEND_URL` to your deployed backend URL.

### Render / Railway (Backend)

Set the `DATABASE_URL` environment variable to your hosted PostgreSQL connection string and `JWT_SECRET_KEY` to a strong random secret.

---

## License

This project is licensed under the **MIT License**.
