from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from ..db import User, get_db, UserRole
from ..auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

class UserSignUp(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    password: str

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str | None = None
    new_phone: str | None = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/signup", response_model=TokenResponse)
async def signup(user: UserSignUp, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create new user record
    new_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_password,
        role=UserRole.FARMER # Default role
    )

    # Insert into PostgreSQL
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        ) from e
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(new_user.id),
            "name": new_user.name,
            "email": new_user.email,
            "phone": new_user.phone,
        }
    }


@router.post("/signin", response_model=TokenResponse)
async def signin(user: UserSignIn, db: AsyncSession = Depends(get_db)):
    # Find user
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(db_user.id),
            "name": db_user.name,
            "email": db_user.email,
            "phone": db_user.phone or "",
        }
    }

@router.post("/update")
async def update_user(user_update: UserUpdate, db: AsyncSession = Depends(get_db)):
    # Find user
    result = await db.execute(select(User).where(User.email == user_update.email))
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Verify current password
    if not verify_password(user_update.current_password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect current password",
        )

    # Build update data
    update_data = {}
    
    if user_update.new_password:
        update_data["hashed_password"] = get_password_hash(user_update.new_password)
        
    if user_update.new_phone is not None:
        update_data["phone"] = user_update.new_phone

    if not update_data:
        return {"message": "No fields to update", "user": {"phone": db_user.phone or ""}}

    # Perform update
    await db.execute(
        update(User)
        .where(User.email == user_update.email)
        .values(**update_data)
    )
    await db.commit()
    
    # Return updated fields (excluding password)
    updated_phone = user_update.new_phone if user_update.new_phone is not None else (db_user.phone or "")
    return {
        "message": "User updated successfully",
        "user": {"phone": updated_phone}
    }
