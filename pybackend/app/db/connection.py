from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "splitwise_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users = db.get_collection("users")
groups = db.get_collection("groups")
expenses = db.get_collection("expenses")
settlements = db.get_collection("settlements")
