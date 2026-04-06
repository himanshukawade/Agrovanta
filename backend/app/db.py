import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable must be set")

client = AsyncIOMotorClient(MONGODB_URI)
database = client.agrovanta
users_collection = database.get_collection("users")
