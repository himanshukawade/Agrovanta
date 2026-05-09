import os
import uuid
import datetime
import enum
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime, func, Enum as SQLEnum
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback/Default for local development if .env is missing
    # The user provided Admin-14 as the password
    DATABASE_URL = "postgresql+asyncpg://postgres:Admin-14@localhost:5432/livestock_monitoring_db"

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    VET = "VET"
    INSPECTOR = "INSPECTOR"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.uuid_generate_v4())
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50))
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole, name="user_role"), default=UserRole.FARMER, server_default="FARMER", nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
