# University Research Laboratory

Budget management system for a research lab or team, built with a Next.js frontend and an Express backend using Prisma and PostgreSQL.

Project repository on GitHub: https://github.com/ayadseghairi/university-research-laboratory

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL 14 or newer
- Git for cloning the project

## Clone the Project

```bash
git clone https://github.com/ayadseghairi/university-research-laboratory.git
cd university-research-laboratory
```

## Install Dependencies

Install the dependencies for each part of the project separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Database Setup

1. Create a new PostgreSQL database, such as `labbudget_db`.
2. Create a user and assign the appropriate permissions if you are using a local database or a separate server.
3. Create the `backend/.env` file and add the required values.

Example:

```env
DATABASE_URL="postgresql://labbudget_user:your_secure_password@localhost:5432/labbudget_db"
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_key_change_this_in_production_12345
JWT_EXPIRATION=24h
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
UPLOAD_PATH=./uploads
CORS_ORIGIN=http://localhost:3000
```

If you want to point the frontend to a different API URL in production, set:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Database Migration

This project uses PostgreSQL only. After setting up the database and `.env` file, run the migrations from the `backend` folder:

```bash
cd backend
npx prisma migrate dev
```

To open Prisma Studio:

```bash
npx prisma studio
```

To reset the database in development:

```bash
npx prisma migrate reset
```

## Development

Start the backend first:

```bash
cd backend
npm run dev
```

Then start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

- The backend runs by default at `http://localhost:5000`
- The frontend runs by default at `http://localhost:3000`
- Health checks are available at `GET /api/health`

## Production Build and Run

### Build and run the backend

```bash
cd backend
npm run build
npm start
```

### Build and run the frontend

```bash
cd frontend
npm run build
npm start
```

## Useful Commands

### Backend

- `npm run dev` to run the server in development mode
- `npm run build` to build TypeScript
- `npm start` to run the built version
- `npm run db:migrate` to apply migrations
- `npm run db:seed` to run the seed file
- `npm run db:studio` to open Prisma Studio
- `npm run db:reset` to reset the database

### Frontend

- `npm run dev` to run the frontend in development mode
- `npm run build` to build the Next.js app
- `npm start` to run the built version

## Project Structure

- `backend/` contains the API, Prisma, and database logic
- `frontend/` contains the Next.js interface
- `backend/uploads/` stores uploaded files

## Runtime Notes

- Make sure PostgreSQL is running before starting migrations or the backend server.
- Make sure `CORS_ORIGIN` matches the frontend URL.
- If you use a different host or port, update `.env` and `NEXT_PUBLIC_API_URL` accordingly.
