# Gymbro

Staff-only web application for managing a gym backend system. Clean, minimalist, earth-tone UI. Beginner-friendly codebase with vanilla HTML/CSS/JS on the frontend and Node.js (Express) on the backend, PostgreSQL database, and Sequelize for connection management.

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript (vanilla)
- Backend: Node.js, Express.js
- Database: PostgreSQL
- ORM: Sequelize (raw SQL queries via `sequelize.query`)

## Project Structure
- `/backend` — API server (default port 3000)
- `/frontend` — static site (default port 5500)

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
  - Example: `postgres://USER:PASS@HOST:PORT/DBNAME`
  - This is used by `/backend/db.js` to create the Sequelize connection.
- `BACKEND_PORT` or `PORT`: Backend HTTP port (default 3000)
- `PORT`: Frontend HTTP port (default 5500) when running `node frontend/index.js`

## Setup
### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL

### Database
1. Create a database (e.g. `gymbro_db`)
2. Apply schema:
   ```bash
   psql -d gymbro_db -f backend/schema.sql
   ```

### Backend (API)
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Set your Postgres URL and start the server:
   ```bash
   # replace USER, PASS, HOST, PORT, DBNAME with your actual values
   DATABASE_URL='postgres://USER:PASS@HOST:PORT/DBNAME' BACKEND_PORT=3000 npm run dev
   ```
3. Health check:
   - Open `http://localhost:3000/api/health` (should return `{"ok":true}`)

### Frontend (Static)
- Option A: Node static server
  ```bash
  cd frontend
  node index.js
  # or
  PORT=5500 npm run start
  ```
  Open `http://localhost:5500/index.html`
- Option B: VS Code Live Server
  - Right-click `frontend/index.html` → “Open with Live Server”

## Pages
- Dashboard (`index.html`)
  - Summary cards: customers, trainers, equipments, sessions today
  - Table of today’s training sessions
- Customers (`customers.html`)
  - List, add, edit, delete customers
- Trainers (`trainers.html`)
  - List, add, edit, delete trainers
- Equipment (`equipments.html`)
  - List, add, delete; update status via dropdown (Available/Maintenance)
- Sessions (`sessions.html`)
  - Book session with selects for customer/trainer/equipment and datetime
  - History table with delete

## API Overview
- Customers
  - `GET /api/customers`
  - `GET /api/customers/:id`
  - `POST /api/customers`
  - `PUT /api/customers/:id`
  - `DELETE /api/customers/:id`
- Trainers
  - `GET /api/trainers`
  - `POST /api/trainers`
  - `PUT /api/trainers/:id`
  - `DELETE /api/trainers/:id`
- Equipments
  - `GET /api/equipments`
  - `POST /api/equipments`
  - `PUT /api/equipments/:id`
  - `DELETE /api/equipments/:id`
- Sessions
  - `GET /api/sessions` (supports `?today=true`)
  - `POST /api/sessions`
  - `DELETE /api/sessions/:id`
- Dashboard summary
  - `GET /api/summary`

## Notes
- CORS is enabled on the backend.
- If port 3000 is busy, set `BACKEND_PORT` to a different value.
- Do not hard-code secrets in source code; use environment variables.
