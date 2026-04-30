from __future__ import annotations

from dataclasses import dataclass
from typing import Literal
from datetime import datetime, timezone

from .dataset import create_feature_from_input


RiskLabel = Literal["LOW", "MODERATE", "HIGH"]
WithdrawalStatus = Literal["IN_WITHDRAWAL", "COMPLIANT"]


# Standard withdrawal periods (days) by compound and product type.
# Sources: EC/EMEA MRL reference tables (demonstration only).
_WITHDRAWAL_TABLE: dict[tuple[str, str], int] = {
  ("oxytetracycline", "milk"): 7,
  ("oxytetracycline", "meat"): 28,
  ("enrofloxacin", "milk"): 5,
  ("enrofloxacin", "meat"): 14,
  ("penicillin g", "milk"): 4,
  ("penicillin g", "meat"): 10,
  ("amoxicillin", "milk"): 3,
  ("amoxicillin", "meat"): 10,
  ("streptomycin", "milk"): 5,
  ("streptomycin", "meat"): 18,
  ("tylosin", "milk"): 5,
  ("tylosin", "meat"): 21,
  ("sulfadiazine", "milk"): 5,
  ("sulfadiazine", "meat"): 10,
}
_DEFAULT_WITHDRAWAL = 14  # fallback if compound not in table


def _get_withdrawal_days(compound: str, product_type: str) -> int:
  key = (compound.lower().strip(), product_type.lower().strip())
  return _WITHDRAWAL_TABLE.get(key, _DEFAULT_WITHDRAWAL)


@dataclass
class ResiduePrediction:
  probability: float
  risk_label: RiskLabel
  compliant: bool
  message: str
  safe_harvest_date_status: WithdrawalStatus
  withdrawal_days: int


def _sigmoid(x: float) -> float:
  import math
  # Numerically stable sigmoid
  if x >= 0:
    z = math.exp(-x)
    return 1.0 / (1.0 + z)
  else:
    # If x is very negative (e.g. -1000), exp(x) is near 0.
    # We use the alternate form: exp(x) / (1 + exp(x))
    try:
        z = math.exp(x)
        return z / (1.0 + z)
    except OverflowError:
        return 0.0


def predict_residue_risk(
  *,
  species: str,
  product_type: str,
  compound: str,
  dosage_mg: float,
  weight_kg: float,
  age_months: int,
  treatment_date: str,
  frequency: str,
) -> ResiduePrediction:
  """
  Simple interpretable risk model inspired by pharmacokinetic decay.
  Withdrawal period is looked up automatically from the compound table.
  """

  withdrawal_days = _get_withdrawal_days(compound, product_type)

  try:
    if len(treatment_date.split("-")) == 3 and "T" not in treatment_date:
      treated_on = datetime.strptime(treatment_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    else:
      treated_on = datetime.fromisoformat(treatment_date)
      if treated_on.tzinfo is None:
        treated_on = treated_on.replace(tzinfo=timezone.utc)
  except ValueError:
    treated_on = datetime.now(timezone.utc)

  now = datetime.now(timezone.utc)
  delta = now - treated_on
  days_since_last_dose = max(0, delta.days)

  features = create_feature_from_input(
    withdrawal_days=withdrawal_days,
    days_since_last_dose=days_since_last_dose,
    dosage_mg=dosage_mg,
    weight_kg=weight_kg,
    age_months=age_months,
    frequency=frequency,
  )

  time_ratio = features["time_ratio"]
  log_dosage_per_kg = features["log_dosage_per_kg"]

  bias = 0.5
  w_time_ratio = -5.0
  w_log_dosage_per_kg = 1.5

  linear_score = bias + (w_time_ratio * time_ratio) + (w_log_dosage_per_kg * log_dosage_per_kg)
  probability = float(_sigmoid(linear_score))

  if probability < 0.33:
    risk_label: RiskLabel = "LOW"
  elif probability < 0.66:
    risk_label = "MODERATE"
  else:
    risk_label = "HIGH"

  compliant = time_ratio >= 1.0
  status: WithdrawalStatus = "COMPLIANT" if compliant else "IN_WITHDRAWAL"

  if not compliant:
    remaining = max(0, int(round(withdrawal_days - days_since_last_dose)))
    if remaining == 0:
      message = (
        "The animal is at the edge of the withdrawal period. "
        "Consider waiting at least one more day before harvesting."
      )
    else:
      plural = "s" if remaining != 1 else ""
      message = (
        f"Product is still within the withdrawal period. "
        f"Wait at least {remaining} more day{plural} before sending to market."
      )
  else:
    if risk_label == "LOW":
      message = (
        "The sample is past the recommended withdrawal period with a low "
        "estimated residue risk. Continue routine monitoring."
      )
    elif risk_label == "MODERATE":
      message = (
        "The sample is past the withdrawal period but the estimated risk is "
        "moderate. Consider additional screening tests before release."
      )
    else:
      message = (
        "Despite meeting the withdrawal period, the estimated residue risk is "
        "still high. Conduct confirmatory laboratory testing before release."
      )

  return ResiduePrediction(
    probability=probability,
    risk_label=risk_label,
    compliant=compliant,
    message=message,
    safe_harvest_date_status=status,
    withdrawal_days=withdrawal_days,
  )


