from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, text
import uuid

from ..db import get_db, User
from ..schemas import AnimalCreate, Animal, TreatmentCreate, Treatment
from .farms import get_current_user

router = APIRouter(prefix="/livestock", tags=["livestock"])

@router.post("/animals", response_model=Animal)
async def create_animal(animal: AnimalCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Verify farm belongs to user
    farm_query = text("SELECT id FROM farms WHERE id = :farm_id AND owner_id = :owner_id")
    farm_result = await db.execute(farm_query, {"farm_id": animal.farm_id, "owner_id": current_user.id})
    if not farm_result.fetchone():
        raise HTTPException(status_code=403, detail="Not authorized to add animals to this farm")

    animal_id = uuid.uuid4()
    
    query = text("""
        INSERT INTO animals (id, farm_id, species, age, weight, tag_number)
        VALUES (:id, :farm_id, :species, :age, :weight, :tag_number)
        RETURNING id, farm_id, species, age, weight, tag_number, created_at
    """)
    try:
        result = await db.execute(query, {
            "id": animal_id,
            "farm_id": animal.farm_id,
            "species": animal.species,
            "age": animal.age,
            "weight": animal.weight,
            "tag_number": animal.tag_number
        })
        await db.commit()
        row = result.fetchone()
        
        return Animal(
            id=row.id,
            farm_id=row.farm_id,
            species=row.species,
            age=row.age,
            weight=row.weight,
            tag_number=row.tag_number,
            created_at=row.created_at
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Could not create animal. Ensure tag_number is unique.") from e

@router.get("/animals", response_model=list[Animal])
async def read_animals(farm_id: str | None = None, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if farm_id:
        query = text("""
            SELECT a.id, a.farm_id, a.species, a.age, a.weight, a.tag_number, a.created_at
            FROM animals a
            JOIN farms f ON a.farm_id = f.id
            WHERE f.owner_id = :owner_id AND a.farm_id = :farm_id
        """)
        result = await db.execute(query, {"owner_id": current_user.id, "farm_id": farm_id})
    else:
        query = text("""
            SELECT a.id, a.farm_id, a.species, a.age, a.weight, a.tag_number, a.created_at
            FROM animals a
            JOIN farms f ON a.farm_id = f.id
            WHERE f.owner_id = :owner_id
        """)
        result = await db.execute(query, {"owner_id": current_user.id})
        
    animals = result.fetchall()
    
    return [
        Animal(
            id=row.id,
            farm_id=row.farm_id,
            species=row.species,
            age=row.age,
            weight=row.weight,
            tag_number=row.tag_number,
            created_at=row.created_at
        ) for row in animals
    ]

@router.post("/treatments", response_model=Treatment)
async def create_treatment(treatment: TreatmentCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Verify animal belongs to user's farm
    animal_query = text("""
        SELECT a.id FROM animals a
        JOIN farms f ON a.farm_id = f.id
        WHERE a.id = :animal_id AND f.owner_id = :owner_id
    """)
    animal_result = await db.execute(animal_query, {"animal_id": treatment.animal_id, "owner_id": current_user.id})
    if not animal_result.fetchone():
        raise HTTPException(status_code=403, detail="Not authorized to add treatments to this animal")

    treatment_id = uuid.uuid4()
    
    query = text("""
        INSERT INTO antimicrobial_usage (id, animal_id, drug_name, compound, dosage_mg, start_date, end_date, created_by)
        VALUES (:id, :animal_id, :drug_name, :compound, :dosage_mg, :start_date, :end_date, :created_by)
        RETURNING id, animal_id, drug_name, compound, dosage_mg, start_date, end_date, created_by, created_at
    """)
    result = await db.execute(query, {
        "id": treatment_id,
        "animal_id": treatment.animal_id,
        "drug_name": treatment.drug_name,
        "compound": treatment.compound,
        "dosage_mg": treatment.dosage_mg,
        "start_date": treatment.start_date,
        "end_date": treatment.end_date,
        "created_by": current_user.id
    })
    await db.commit()
    row = result.fetchone()
    
    return Treatment(
        id=row.id,
        animal_id=row.animal_id,
        drug_name=row.drug_name,
        compound=row.compound,
        dosage_mg=row.dosage_mg,
        start_date=row.start_date,
        end_date=row.end_date,
        created_by=row.created_by,
        created_at=row.created_at
    )

@router.get("/treatments", response_model=list[Treatment])
async def read_treatments(animal_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Optional: Verify animal belongs to user's farm
    query = text("""
        SELECT au.id, au.animal_id, au.drug_name, au.compound, au.dosage_mg, au.start_date, au.end_date, au.created_by, au.created_at
        FROM antimicrobial_usage au
        JOIN animals a ON au.animal_id = a.id
        JOIN farms f ON a.farm_id = f.id
        WHERE au.animal_id = :animal_id AND f.owner_id = :owner_id
    """)
    result = await db.execute(query, {"animal_id": animal_id, "owner_id": current_user.id})
    treatments = result.fetchall()
    
    return [
        Treatment(
            id=row.id,
            animal_id=row.animal_id,
            drug_name=row.drug_name,
            compound=row.compound,
            dosage_mg=row.dosage_mg,
            start_date=row.start_date,
            end_date=row.end_date,
            created_by=row.created_by,
            created_at=row.created_at
        ) for row in treatments
    ]
