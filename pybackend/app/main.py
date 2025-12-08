from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, groups, expenses, settlements
import os

app = FastAPI(title="Splitwise-like API")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",  # your dev front-end origin (Vite default)
    # add production origin(s) here
]
app.add_middleware(
    CORSMiddleware,
   allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(settlements.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Splitwise-like API is running"}
