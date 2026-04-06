from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from .dataset import create_feature_from_input


RiskLabel = Literal["LOW", "MODERATE", "HIGH"]
WithdrawalStatus = Literal["IN_WITHDRAWAL", "COMPLIANT"]


@dataclass
class ResiduePrediction:
  probability: float
  risk_label: RiskLabel
  compliant: bool
  message: str
  safe_harvest_date_status: WithdrawalStatus


def _sigmoid(x: float) -> float:
  import math

  return 1.0 / (1.0 + math.exp(-x))


def predict_residue_risk(
  *,
  species: str,
  product_type: str,
  compound: str,
  dosage_mg: float,
  withdrawal_days: int,
  days_since_last_dose: int,
) -> ResiduePrediction:
  """
  Simple interpretable risk model inspired by pharmacokinetic decay.

  This mirrors the logic used in the TypeScript/Next.js implementation and is
  intended for demonstration, not clinical or regulatory use.
  """

  features = create_feature_from_input(
    withdrawal_days=withdrawal_days,
    days_since_last_dose=days_since_last_dose,
    dosage_mg=dosage_mg,
  )

  time_ratio = features["time_ratio"]
  log_dosage = features["log_dosage"]

  # Hand-tuned coefficients, chosen for intuitive behaviour.
  bias = 0.5
  w_time_ratio = -4.0
  w_log_dosage = 0.8

  linear_score = bias + (w_time_ratio * time_ratio) + (w_log_dosage * log_dosage)
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
  )

