import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

# We'll set this from environment variable or default to local credentials
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Admin@localhost:5432/livestock_monitoring_db")

pool: asyncpg.Pool = None

async def init_db_pool():
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL)

async def close_db_pool():
    global pool
    if pool is not None:
        await pool.close()

def get_pool() -> asyncpg.Pool:
    if pool is None:
        raise RuntimeError("Database pool has not been initialized.")
    return pool
