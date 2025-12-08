# Splitwise-like Backend (FastAPI + Motor)

This is a starter backend for an expense-sharing app built with **FastAPI** and **MongoDB (Motor)**.
It includes JWT auth, user/group/expense routes, splitting logic and a simple structure to connect with your React frontend.

## Features
- FastAPI
- Async MongoDB (motor)
- JWT authentication (python-jose)
- Password hashing (passlib)
- Basic routes: auth, groups, expenses, settlements
- Dockerfile + docker-compose example

## Run locally
1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` from `.env.example` and set MONGO_URL and SECRET_KEY.
3. Run:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Docker (optional)
```bash
docker compose up --build
```

