# 💰 Expense Tracker App

A full-stack Expense Tracker application to manage and visualize your spending habits. Built with **React (TypeScript)** on the frontend and **NestJS** on the backend.

---


## 📁 Project Structure
```
root/ │ 
├── backend/ # NestJS backend │ 
     ├── src/ │ 
        └── ... │ 
├── frontend/ # React frontend (TypeScript) │ 
      ├── src/ │ 
          └── ... │ 
└── README.md

```



---

## 🔧 Features

### 🧠 Frontend (React)
- Add, edit, and delete expenses 💸
- Categorize expenses 🗂️
- View monthly breakdown via charts 📊
- Filter by date, category, and type 🔍
- Responsive UI (mobile & desktop) 📱💻

### 🚀 Backend (NestJS)
- CRUD operations for expenses
- Category management
- MongoDB for data storage
- RabbitMQ integration for background jobs/notifications 
- DTO validation with `class-validator`
- `.env`-based config management

---

## 🛠️ Tech Stack

| Frontend | Backend | Infra |
|----------|---------|-------|
| React (TypeScript) | NestJS | MongoDB |
| Axios | Mongoose | RabbitMQ |
| Recharts / Chart.js | ConfigModule | Docker / Docker Compose |
| TailwindCSS or CSS Modules | JWT (if using auth) | Railway / Render / Fly.io |

---

## 🚀 Getting Started

### 📦 Prerequisites
- Node.js (v18+)
- MongoDB (cloud or local)
- RabbitMQ (if using queues)


---

## ⚙️ Backend Setup (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

## Environment variables in backend
```
PORT=3000
MONGODB_URI=mongodb+srv://your-mongo-uri
RABBITMQ_URL=amqp://localhost
FRONTEND_URL=http://localhost:5173
```


## Frontend Set up
```bash
cd frontend
npm install
npm run dev
```

