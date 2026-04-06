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
) -> dict[str, float]:
  safe_withdrawal = max(withdrawal_days, 1)
  safe_days_since = max(days_since_last_dose, 0)

  time_ratio = safe_days_since / safe_withdrawal

  # Avoid log(0)
  clamped_dosage = max(dosage_mg, 1.0)

  import math

  log_dosage = math.log10(clamped_dosage)

  return {
    "time_ratio": float(time_ratio),
    "log_dosage": float(log_dosage),
  }

