# Travel Risk Analyzer

A full-stack web application that allows users to monitor travel destinations for potential risks and alerts.

## Tech Stack

* **Frontend**: React, Vite, TypeScript, Tailwind CSS
* **Backend**: Node.js, Express.js
* **Database**: Microsoft SQL Server (MSSQL)
* **Authentication**: Passport.js (Local and Google OAuth)

## Setup and Installation

### Prerequisites

* Node.js (v18 or newer recommended)
* An MSSQL database instance

### 1. Backend Server Setup

Navigate to the server directory and install the required dependencies.

```bash
cd server
npm install
```
Create a .env file in the server directory and add the following environment variables with your database credentials and Google OAuth keys:

```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=your_db_server.database.windows.net
DB_DATABASE=your_db_name

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

JWT_SECRET=a_strong_secret_for_jwt
```

To start the backend server, run:

```bash
npm start
```

The server will be running on http://localhost:5000.

2. Frontend Client Setup
In a separate terminal, navigate to the client directory and install dependencies.

```bash
cd client
npm install
```
To start the frontend development server, run:

```bash
npm run dev
```
The application will be available at http://localhost:5173 (or the address shown in your terminal).