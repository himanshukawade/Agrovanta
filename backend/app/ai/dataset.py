from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import csv


ProductType = Literal["milk", "meat", "eggs", "honey"]


@dataclass
class ResidueSample:
  species: str
  product_type: ProductType
  compound: str
  dosage_mg: float
  weight_kg: float
  age_months: int
  treatment_date: str
  frequency: str
  withdrawal_days: int
  days_since_last_dose: int
  compliant: bool


def _dataset_path() -> Path:
  """
  Resolve the absolute path to data/residue_samples.csv from anywhere
  inside the backend package.
  """
  # backend/app/ai/dataset.py -> parents[2] == backend root
  backend_root = Path(__file__).resolve().parents[2]
  return backend_root / "data" / "residue_samples.csv"


def load_residue_dataset() -> list[ResidueSample]:
  path = _dataset_path()

  if not path.exists():
    return []

  samples: list[ResidueSample] = []

  with path.open("r", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
      try:
        species = (row.get("species") or "").strip()
        product_type = (row.get("product_type") or "").strip() or "milk"
        compound = (row.get("compound") or "").strip()

        if not species or not compound:
          continue

        dosage_mg = float(row.get("dosage_mg") or 0)
        weight_kg = float(row.get("weight_kg") or 500.0)
        age_months = int(row.get("age_months") or 24)
        treatment_date = (row.get("treatment_date") or "").strip()
        frequency = (row.get("frequency") or "").strip().lower()
        withdrawal_days = int(row.get("withdrawal_days") or 0)
        days_since_last_dose = int(row.get("days_since_last_dose") or 0)
        compliant_flag = (row.get("compliant") or "").strip().lower()
        compliant = compliant_flag in {"1", "true", "yes"}

        samples.append(
          ResidueSample(
            species=species,
            product_type=product_type,  # type: ignore[assignment]
            compound=compound,
            dosage_mg=dosage_mg,
            weight_kg=weight_kg,
            age_months=age_months,
            treatment_date=treatment_date,
            frequency=frequency,
            withdrawal_days=withdrawal_days,
            days_since_last_dose=days_since_last_dose,
            compliant=compliant,
          )
        )
      except (TypeError, ValueError):
        # Skip malformed rows
        continue

  return samples


def create_feature_from_input(
  *,
  withdrawal_days: int,
  days_since_last_dose: int,
  dosage_mg: float,
  weight_kg: float,
  age_months: int,
  frequency: str,
) -> dict[str, float]:
  safe_withdrawal = max(withdrawal_days, 1)
  safe_days_since = max(days_since_last_dose, 0)

  time_ratio = safe_days_since / safe_withdrawal

  # Determine frequency multiplier
  freq_multiplier = 1.0
  freq_lower = frequency.lower()
  if freq_lower in {"twice a day", "twice", "2x"}:
    freq_multiplier = 2.0
  elif freq_lower in {"daily", "once a day", "1x"}:
    freq_multiplier = 1.0
  elif freq_lower in {"weekly", "once a week"}:
    freq_multiplier = 0.14
  elif freq_lower in {"once", "single dose"}:
    freq_multiplier = 0.5
    
  # Estimate log dosage per kg
  dosage_per_kg = (dosage_mg * freq_multiplier) / max(weight_kg, 1.0)
  
  # Limit age multiplier, standardizing heavily on older age having slightly less clearance speed
  age_factor = 1.0 + (max(age_months, 1) / 120.0)

  import math

  log_dosage_per_kg = math.log10(max(dosage_per_kg * age_factor, 0.01))

  return {
    "time_ratio": float(time_ratio),
    "log_dosage_per_kg": float(log_dosage_per_kg),
  }
