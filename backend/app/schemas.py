from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator


ProductType = Literal["milk", "meat", "eggs", "honey"]
RiskLabel = Literal["LOW", "MODERATE", "HIGH"]
WithdrawalStatus = Literal["IN_WITHDRAWAL", "COMPLIANT"]


class ResidueInput(BaseModel):
  species: str = Field(..., description="Animal species, e.g. cattle, sheep, goat")
  product_type: ProductType = Field(..., description="Output product, e.g. milk or meat")
  compound: str = Field(..., description="Active compound name, e.g. Oxytetracycline")
  dosage_mg: float = Field(..., gt=0, description="Approximate administered dose in mg")
  withdrawal_days: int = Field(..., ge=0, description="Labeled withdrawal period in days")
  days_since_last_dose: int = Field(..., ge=0, description="Days elapsed since the last dose")

  @field_validator("species", "compound")
  @classmethod
  def not_empty(cls, value: str) -> str:
    if not value or not value.strip():
      raise ValueError("must not be empty")
    return value.strip()


class ResiduePrediction(BaseModel):
  probability: float = Field(..., ge=0.0, le=1.0)
  risk_label: RiskLabel
  compliant: bool
  message: str
  safe_harvest_date_status: WithdrawalStatus


class PredictionResponse(BaseModel):
  input: ResidueInput
  prediction: ResiduePrediction


class SelfTestResponse(BaseModel):
  status: str
  dataset_loaded: bool
  sanity_check: bool
  example_prediction: ResiduePrediction

