from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, text
import uuid

from ..db import get_db, User
from ..schemas import FarmCreate, Farm
from .auth import router as auth_router

# We need to get the current user, but there's no get_current_user in auth.py exported directly.
# Wait, auth.py only has signup/signin. We need a dependency to get the current user from token.
# I'll create a simple get_current_user in auth.py or just decode the token here for now.
from ..auth import verify_password, ALGORITHM, JWT_SECRET_KEY
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/farms", tags=["farms"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/signin")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

@router.post("", response_model=Farm)
async def create_farm(farm: FarmCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    farm_id = uuid.uuid4()
    
    # Using raw SQL or we can define Farm model in db.py
    # Since db.py doesn't have Farm, we can use raw SQL for now, or better: add Farm to db.py.
    # Actually, SQLAlchemy with raw queries is fine since models are in setup.sql
    query = text("""
        INSERT INTO farms (id, owner_id, name, location)
        VALUES (:id, :owner_id, :name, :location)
        RETURNING id, owner_id, name, location, created_at
    """)
    result = await db.execute(query, {
        "id": farm_id,
        "owner_id": current_user.id,
        "name": farm.name,
        "location": farm.location
    })
    await db.commit()
    row = result.fetchone()
    
    return Farm(
        id=row.id,
        owner_id=row.owner_id,
        name=row.name,
        location=row.location,
        created_at=row.created_at
    )

@router.get("", response_model=list[Farm])
async def read_farms(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    query = text("""
        SELECT id, owner_id, name, location, created_at
        FROM farms
        WHERE owner_id = :owner_id
    """)
    result = await db.execute(query, {"owner_id": current_user.id})
    farms = result.fetchall()
    
    return [
        Farm(
            id=row.id,
            owner_id=row.owner_id,
            name=row.name,
            location=row.location,
            created_at=row.created_at
        ) for row in farms
    ]
