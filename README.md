# InventIQ — Inventory & Order Management System

A production-ready, fully containerised full-stack application built with:

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | React 18 + React Router  |
| Backend     | Python 3.11 + FastAPI    |
| Database    | PostgreSQL 16            |
| Container   | Docker + Docker Compose  |
| Web Server  | nginx (Alpine)           |

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── main.py            # FastAPI app & CORS
│   ├── database.py        # SQLAlchemy engine & session
│   ├── models.py          # ORM models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── routers/
│   │   ├── products.py
│   │   ├── customers.py
│   │   ├── orders.py
│   │   └── dashboard.py
│   ├── entrypoint.sh      # Waits for DB then starts uvicorn
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js / App.css
│   │   ├── index.js
│   │   ├── context/AppContext.js
│   │   ├── services/api.js
│   │   ├── components/Sidebar.js
│   │   └── pages/
│   │       ├── Dashboard.js
│   │       ├── Products.js
│   │       ├── Customers.js
│   │       └── Orders.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── .dockerignore
├── postgres/
│   └── init.sql
├── docker-compose.yml
├── .env                   # Local secrets (git-ignored)
├── .env.example           # Template to share
├── .gitignore
└── README.md
```

---

## Quick Start (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Git

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd inventory-system
```

### 2. Configure environment variables
```bash
cp .env.example .env
# Edit .env if you want custom DB credentials (defaults work fine locally)
```

### 3. Build & start all services
```bash
docker compose up --build
```

> First build takes ~2–3 minutes (downloads images, installs deps, compiles React).  
> Subsequent starts are fast: `docker compose up`

### 4. Open the app
| Service  | URL                           |
|----------|-------------------------------|
| Frontend | http://localhost:3000         |
| Backend API | http://localhost:8000      |
| API Docs | http://localhost:8000/docs    |

---

## All Docker Commands

```bash
# Build and start (foreground – see logs)
docker compose up --build

# Build and start (background / detached)
docker compose up --build -d

# Start already-built containers
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (wipes database!)
docker compose down -v

# Restart a single service
docker compose restart backend
docker compose restart frontend

# View logs
docker compose logs -f              # all services
docker compose logs -f backend      # backend only
docker compose logs -f frontend     # frontend only
docker compose logs -f db           # database only

# Rebuild a single service
docker compose build backend
docker compose build frontend

# Open a shell inside a container
docker exec -it inventiq_backend sh
docker exec -it inventiq_frontend sh
docker exec -it inventiq_db psql -U inventiq -d inventory_db

# Check running containers
docker compose ps

# Check container health
docker inspect inventiq_db --format='{{.State.Health.Status}}'
```

---

## Running Without Docker (Local Development)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set env variable (use your local Postgres connection)
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Set the API base URL
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start React dev server
npm start
```

---

## API Reference

### Health
| Method | Endpoint  | Description    |
|--------|-----------|----------------|
| GET    | `/`       | Health check   |

### Products `/products`
| Method | Endpoint         | Description       |
|--------|------------------|-------------------|
| GET    | `/products/`     | List all products |
| POST   | `/products/`     | Create product    |
| GET    | `/products/{id}` | Get product       |
| PUT    | `/products/{id}` | Update product    |
| DELETE | `/products/{id}` | Delete product    |

### Customers `/customers`
| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| GET    | `/customers/`       | List all customers |
| POST   | `/customers/`       | Create customer    |
| GET    | `/customers/{id}`   | Get customer       |
| DELETE | `/customers/{id}`   | Delete customer    |

### Orders `/orders`
| Method | Endpoint        | Description       |
|--------|-----------------|-------------------|
| GET    | `/orders/`      | List all orders   |
| POST   | `/orders/`      | Place new order   |
| GET    | `/orders/{id}`  | Get order details |
| DELETE | `/orders/{id}`  | Cancel order      |

### Dashboard
| Method | Endpoint           | Description    |
|--------|--------------------|----------------|
| GET    | `/dashboard/stats` | Summary stats  |

Interactive API docs: **http://localhost:8000/docs**

---

## Business Rules Implemented

- ✅ Product SKU must be unique
- ✅ Customer email must be unique
- ✅ Product quantity cannot be negative
- ✅ Orders blocked if inventory is insufficient
- ✅ Stock automatically reduced on order creation
- ✅ Stock automatically restored on order cancellation
- ✅ Total amount calculated automatically by backend
- ✅ All endpoints return proper HTTP status codes
- ✅ Full request validation via Pydantic v2

---

## Deployment (Free Hosting)

### Backend → [Render](https://render.com)
1. Push `backend/` to GitHub
2. New Web Service → Docker → set `DATABASE_URL` env var
3. Render provides a free PostgreSQL instance too

### Frontend → [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
1. Push `frontend/` to GitHub
2. Set `REACT_APP_API_URL` to your Render backend URL
3. Deploy — Vercel/Netlify auto-detect React

### Database → [Supabase](https://supabase.com) or [Render Postgres](https://render.com/docs/databases)
- Free PostgreSQL with connection string ready to paste

---

## Tech Stack Versions

| Tool            | Version |
|-----------------|---------|
| Python          | 3.11    |
| FastAPI         | 0.111   |
| SQLAlchemy      | 2.0     |
| Pydantic        | v2      |
| PostgreSQL      | 16      |
| React           | 18.2    |
| Node.js (build) | 20 LTS  |
| nginx           | 1.25    |
| Docker Compose  | v3.9    |
