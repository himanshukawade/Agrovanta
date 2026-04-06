from datetime import timedelta
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

from ..db import users_collection
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
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create new user document
    new_user = {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "hashed_password": hashed_password,
    }

    # Insert into MongoDB
    result = await users_collection.insert_one(new_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(result.inserted_id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
        }
    }


@router.post("/signin", response_model=TokenResponse)
async def signin(user: UserSignIn):
    # Find user
    db_user = await users_collection.find_one({"email": user.email})
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
            "id": str(db_user["_id"]),
            "name": db_user["name"],
            "email": db_user["email"],
            "phone": db_user.get("phone", ""),
        }
    }

@router.post("/update")
async def update_user(user_update: UserUpdate):
    # Find user
    db_user = await users_collection.find_one({"email": user_update.email})
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

    # Build update dict
    update_data = {}
    if user_update.new_password:
        update_data["hashed_password"] = get_password_hash(user_update.new_password)
    if user_update.new_phone is not None:
        update_data["phone"] = user_update.new_phone

    if not update_data:
        return {"message": "No fields to update", "user": {"phone": db_user.get("phone", "")}}

    # Perform update
    await users_collection.update_one(
        {"email": user_update.email},
        {"$set": update_data}
    )
    
    # Return updated fields (excluding password)
    updated_phone = user_update.new_phone if user_update.new_phone is not None else db_user.get("phone", "")
    return {
        "message": "User updated successfully",
        "user": {"phone": updated_phone}
    }
