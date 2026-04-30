from datetime import timedelta
import asyncpg
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from ..db import get_pool
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
async def signup(user: UserSignUp):
    pool = get_pool()
    async with pool.acquire() as conn:
        # Check if user already exists
        existing_user = await conn.fetchval("SELECT id FROM users WHERE email = $1", user.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Hash the password
        hashed_password = get_password_hash(user.password)

        # Insert into PostgreSQL
        query = """
            INSERT INTO users (name, email, phone, hashed_password)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        """
        try:
            inserted_id = await conn.fetchval(query, user.name, user.email, user.phone, hashed_password)
        except asyncpg.UniqueViolationError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(inserted_id),
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
            }
        }


@router.post("/signin", response_model=TokenResponse)
async def signin(user: UserSignIn):
    pool = get_pool()
    async with pool.acquire() as conn:
        # Find user
        db_user = await conn.fetchrow(
            "SELECT id, name, email, phone, hashed_password FROM users WHERE email = $1", 
            user.email
        )
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify password
        if not verify_password(user.password, db_user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user["email"]}, expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(db_user["id"]),
                "name": db_user["name"],
                "email": db_user["email"],
                "phone": db_user.get("phone", ""),
            }
        }

@router.post("/update")
async def update_user(user_update: UserUpdate):
    pool = get_pool()
    async with pool.acquire() as conn:
        # Find user
        db_user = await conn.fetchrow(
            "SELECT id, hashed_password, phone FROM users WHERE email = $1", 
            user_update.email
        )
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Verify current password
        if not verify_password(user_update.current_password, db_user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect current password",
            )

        # Build update queries
        updates = []
        args = []
        arg_idx = 1
        
        if user_update.new_password:
            updates.append(f"hashed_password = ${arg_idx}")
            args.append(get_password_hash(user_update.new_password))
            arg_idx += 1
            
        if user_update.new_phone is not None:
            updates.append(f"phone = ${arg_idx}")
            args.append(user_update.new_phone)
            arg_idx += 1

        if not updates:
            return {"message": "No fields to update", "user": {"phone": db_user.get("phone", "")}}

        # Perform update
        args.append(user_update.email)
        update_query = f"UPDATE users SET {', '.join(updates)} WHERE email = ${arg_idx}"
        await conn.execute(update_query, *args)
        
        # Return updated fields (excluding password)
        updated_phone = user_update.new_phone if user_update.new_phone is not None else db_user.get("phone", "")
        return {
            "message": "User updated successfully",
            "user": {"phone": updated_phone}
        }
