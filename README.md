# SmartDesk. AI Assisted Support Ticket Management System

SmartDesk is an AI assisted support ticket management system that lets customers create support tickets and lets administrators handle, sort, search, filter and update those tickets.

When a customer creates a ticket the system sends the ticket subject and description to Gemini AI. The AI gives a category, priority and one line summary. The administrator can look at the AI suggestions. Manage the ticket process.

## Features

### Customer

* Create a support ticket

* Form checks on the customer side

* Fields for name, email, subject and description

* Automatic ticket number generation

* AI helped ticket sorting

* A page that shows the ticket number after submission

### Admin

* admin login

* Authentication using JWT

* Passwords are stored as hashes

* Pages that only admins can see

* Dashboard with numbers and stats

* Search for tickets

* Filter tickets by status, category and priority

* Pagination on the server side

* View details of a ticket

* Check AI sorting results

* Change the status with notes

* Track the history of status changes

### AI Sorting

Gemini AI looks at:

* Subject

* Description

It gives back:

* Category

* Priority

* Summary

Possible categories:

* Technical

* Billing

* Account

* General

priorities:

* Low

* Medium

* High

If the AI sorting doesn't work times out or gives bad values the system uses:

* Category: General

* Priority: Medium

The app records AI sorting problems on the server.



## Technology Stack

### Frontend

* React.js

* React Router

* JavaScript

* HTML and CSS


### Backend

* Python

* FastAPI

* SQLAlchemy

* JWT

* PyJWT

* Password hashing using `pwdlib`

* Gemini AI

### Database

* MySQL

### Development Tools

* VS Code

* Swagger 

* Postman

* Git

* GitHub

---

## Project Structure



smartdesk/

│

├── database/

│   ├── connection.py

│   └── seed_admin.py

│

├── dependencies/

│   └── auth.py

│

├── models/

│   ├── admin.py

│   ├── ticket.py

│   └── status_history.py

│

├── routes/

│   ├── auth_route.py

│   ├── ticket_route.py

│   └── dashboard_route.py

│

├── schemas/

│   ├── auth_schema.py

│   ├── status_schema.py

│   └── ticket_schema.py

│

├── services/

│   ├── auth_service.py

│   └── ai_service.py

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── assets/

│   │   ├── components/

│   │   ├── context/

│   │   ├── pages/

│   │   ├── services/

│   │   └── utils/

│   ├── package.json

│   └── package-lock.json

│

├──.env.example

├──.gitignore

├── main.py

├── requirements.txt

└── README.md


## Prerequisites

Install these before running the project:

* Python 3.13 or any Python 3.x version

* Node.js and npm

* MySQL

* Git



# Backend Setup

## 1. Clone the repository

```bash

git clone https://github.com/Prakash312005-code/smartdesk-fe.git

cd smartdesk-fe

```

## 2. Create a Python environment

Windows:

```powershell

python -m venv venv

```

Activate it:

```powershell

.\venv\Scripts\activate

```

## 3. Install backend dependencies

```powershell

pip install -r requirements.txt

```

---

## 4. Create the MySQL database

Create a database named:

```sql

CREATE DATABASE smartdesk;

```

The app uses MySQL for storing ticket admin and status history information.

---

## 5. Configure backend environment variables

Make a file called:

```text

.env

```

in the project root.

Example:

```env

DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost/smartdesk

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

ADMIN_USERNAME=admin

ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD

JWT_SECRET_KEY=YOUR_32_CHARACTER_OR_LONGER_SECRET

JWT_ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

```
Do not put the `.env` file in GitHub.

Use `.env.example` as the configuration template.



## 6. Add the admin account

Run:

```powershell

python database/seed_admin.py

```

This creates the admin account using the username and password from the `.env` file.

The password is stored as a hash in the database not as plain text.

---

## 7. Start the FastAPI backend

Run:

```powershell

python -m uvicorn main:app --reload

```

Backend:

http://127.0.0.1:8000

```

Swagger documentation:


http://127.0.0.1:8000/docs



# Frontend Setup

Open another terminal.

```powershell

cd frontend

```

## 1. Install dependencies

```powershell

npm install

```

## 2. Configure frontend environment variables

Create:

frontend/.env

REACT_APP_API_BASE_URL=http://localhost:8000



## 3. Start React

```powershell

npm start

```

Frontend:


http://localhost:3000

```

---

# Application Flow

## Customer Flow

```text

Customer

↓

Raise Ticket

↓

Name + Email + Subject + Description

↓

POST /api/tickets/

↓

FastAPI. Saves ticket

↓

Gemini AI sorting

↓

Category + Priority + Summary

↓

Ticket reference given

↓

Confirmation page

```

## Admin Flow



Admin Login

↓

POST /api/auth/login

↓

JWT token

↓

Dashboard

↓

Ticket List

↓

Search / Filter / Pagination

↓

Ticket Detail

↓

Check AI Suggestions

↓

Change Status + Note

↓

Status History

```

---

# Ticket Status Workflow

Tickets go through these steps:



Open

↓

In Progress

↓

Resolved

↓

Closed

```

The administrator can change the ticket status at any time.

Each status change is saved in the status history, with:

* status

* New status

* Note

* Admin username

*. Time of change

---

# Database Design

## Admin

Stores admin login details.

Main fields:


id

username

hashed_password

created_at

```

## Ticket

Stores customer support tickets.

Main fields:



id

reference_number

name

email

subject

description

status

category

priority

summary

created_at

```

## Status History

Stores every status change for a ticket.

Main fields:


id

ticket_id

old_status

new_status

remark

changed_by

changed_at

```

The `ticket_id` field refers to the ticket record.

---

# REST API

## Authentication

### Login

```http

POST /api/auth/login

```

Request:

```json

{
  "username": "admin",
  "password": "YOUR_PASSWORD"
}

```

Response:

```json

{

"access_token": "JWT_TOKEN"

"token_type": "bearer"

}

```

---

## Customer Ticket

### Create Ticket

```http

POST /api/tickets/

```

This is an endpoint.

Request:

```json

{

"name": "John Doe"

"email": "john@example.com"

"subject": "Payment failed"

"description": "My money was. My order was not created."

}

```

Response includes the ticket number and AI sorting results.

---

## Admin Ticket APIs

All these endpoints need:


Authorization: Bearer <JWT_TOKEN>

```

### Get Tickets

```

GET /api/tickets/

```

Supported query parameters:


page

page_size

search

status

category

priority

```

Example:

```http

GET /api/tickets/?page=1&page_size=10&search=payment&status=Open&category=Billing&priority=High

```

### Get Ticket Details

```http

GET /api/tickets/{ticket_id}

```

Returns ticket details and status history.

### Update Ticket Status

```http

PATCH /api/tickets/{ticket_id}/status

```

Request:

```json

{

"status": "In Progress"

"remark": "Support team is investigating the issue."

}



Allowed status values:


Open

In Progress

Resolved

Closed

```

---

## Dashboard

### Get Dashboard Statistics

```http

GET /api/dashboard/stats

```

Returns:

* Ticket counts by status

* Ticket counts by category

* Ticket counts by priority

* Tickets created during the 7 days

---

# Authentication

SmartDesk uses JWT-based authentication for protected administrator APIs.

The authentication process is:


Admin Login

↓

Username + Password

↓

Password verification

↓

JWT generation

↓

JWT stored by React

↓

Bearer token sent with protected API requests

```

Protected frontend pages include:



/admin/dashboard

/admin/tickets

/admin/tickets/:id

```

Users without authentication are redirected to the login page.

---

# AI Approach

The backend uses Gemini AI for ticket classification.

The model receives:


Subject

Description

```

The application asks the model to return JSON containing:

```json

{

"category": "Billing"

"priority": "High"

"summary": "Customers payment was deducted but the order was not created."

}

```

The backend validates the returned category and priority against the applications allowed values.

If the AI response is invalid or unavailable the application uses:


Category → General

Priority → Medium

Summary  → None

```

This ensures ticket creation can continue when AI classification is unavailable.

---

# Error Handling

The API follows standard HTTP status codes.

```text

200 → request

201 → Resource created

401 → Unauthorized

404 → Resource not found

422 → Validation error

```

Validation errors are returned without saving invalid ticket data.

Frontend pages display user- error messages and loading states.

---

# CORS

During development:


Frontend → http://localhost:3000

Backend  → http://localhost:8000

```

FastAPI CORS middleware allows the React frontend to communicate with the backend during development.

---

# Development Notes

The application is designed to run for demonstration.

No cloud deployment is required.

Start the backend first:

```powershell

python -m uvicorn main:app --reload

```

Then start the frontend:

```powershell

cd frontend

npm start

```

---

# Git Workflow

The project uses Git for version control.

Meaningful commits are maintained throughout development than relying on a single final commit.

Repository:


https://github.com/Prakash312005-code/smartdesk-fe

```

---

# Assumptions

* One seeded administrator account is used for the system setup.

* Customers can raise tickets without logging in.

* AI provides classification suggestions. Does not directly solve customer issues.

* Administrators are responsible for reviewing AI suggestions and managing ticket status.

* Ticket status changes are recorded in status history.

* The application is intended for technical-assessment demonstration.

---

# Future Enhancements

Possible future enhancements include:

* Automated email notifications

* generated draft replies

* CSV ticket export

* Automated tests

* administrator roles and permissions

---

# License

This project was developed as a technical assessment project, for demonstration and evaluation purposes.
