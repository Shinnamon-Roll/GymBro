# GymBro Management System

Web application for managing a gym, including member management, trainer scheduling, equipment tracking, and class booking. Designed with a clean, modern UI (Brutalism style) using Tailwind CSS.

## Features

### For Administrators (Back Office)

- **Dashboard**: Overview of daily activities, stats, and quick actions.
- **Member Management**: Add, edit, delete, and view member details.
- **Trainer Management**: Manage trainer profiles and specialties.
- **Equipment Management**: Track equipment inventory and status (Available/Maintenance).
- **Session Management**: View and manage training sessions.
- **System Logs**: View system activities and audit logs.

### For Members (Front Office)

- **User Dashboard**: View personal schedule and book new sessions.
- **Booking System**: Real-time availability check for trainers and equipment.
- **Profile**: View membership status and history.

## Tech Stack

- **Frontend**: EJS (Embedded JavaScript templating), Tailwind CSS, Vanilla JavaScript.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (managed via Sequelize ORM).

## Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Shinnamon-Roll/GymBro.git
   cd GymBro
   ```
2. **Backend Setup**

   ```bash
   cd backend
   npm install
   # Create a .env file or set environment variables
   # DATABASE_URL=postgres://user:pass@host:port/dbname
   npm run dev
   ```
3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   # Start the frontend server (default port 5500)
   npm start
   ```
4. **Access the Application**

   - Frontend: `http://localhost:5500`
   - Backend API: `http://localhost:3000`

## Project Structure

- `backend/`: API Server, Database Models, and Logic.
- `frontend/`: Express Server for UI, EJS Views, and Static Assets.
- `laTex/`: Project Documentation and Reports.

## Team Members

| Name                                              | Student ID    |
| ------------------------------------------------- | ------------- |
| นายเมธัส ทองจันทร์               | 6606022610030 |
| นายนพคุณ เหล่าอิ่มจันทร์   | 6606022610013 |
| นายกาญจน์ชญา สู่สุข             | 6606022610048 |
| นางสาวทิพย์สุดา สังข์เงิน | 6606022620060 |

---

**Course**: Full Stack Web Development (Semester 2/2025)
**Deadline**: March 9, 2026
