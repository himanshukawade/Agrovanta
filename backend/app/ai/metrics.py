from __future__ import annotations

from typing import TypedDict
from .dataset import load_residue_dataset
from .model import predict_residue_risk
from datetime import datetime, timedelta, timezone

class ConfusionMatrix(TypedDict):
    tp: int
    tn: int
    fp: int
    fn: int

class MetricsResult(TypedDict):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: ConfusionMatrix
    sample_count: int

def calculate_model_metrics() -> MetricsResult:
    samples = load_residue_dataset()
    if not samples:
        return {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "confusion_matrix": {"tp": 0, "tn": 0, "fp": 0, "fn": 0},
            "sample_count": 0
        }

    tp = tn = fp = fn = 0
    now = datetime.now(timezone.utc)

    for s in samples:
        # Use a dummy treatment date to match the 'days_since_last_dose' in the sample
        dummy_date = (now - timedelta(days=s.days_since_last_dose)).strftime("%Y-%m-%d")

        prediction = predict_residue_risk(
            species=s.species,
            product_type=s.product_type,
            compound=s.compound,
            dosage_mg=s.dosage_mg,
            weight_kg=s.weight_kg,
            age_months=s.age_months,
            treatment_date=dummy_date,
            frequency=s.frequency
        )

        actual = s.compliant
        predicted = prediction.compliant

        if actual is True and predicted is True:
            tp += 1
        elif actual is False and predicted is False:
            tn += 1
        elif actual is False and predicted is True:
            fp += 1
        elif actual is True and predicted is False:
            fn += 1

    count = len(samples)
    accuracy = (tp + tn) / count
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "confusion_matrix": {"tp": tp, "tn": tn, "fp": fp, "fn": fn},
        "sample_count": count
    }

def print_metrics_table(metrics: MetricsResult):
    """Prints a beautiful ASCII table to the console."""
    print("\n" + "="*50)
    print("AGROVANTA AI MODEL PERFORMANCE")
    print("="*50)
    print(f"{'Metric':<20} | {'Score':<10}")
    print("-" * 35)
    print(f"{'Accuracy':<20} | {metrics['accuracy']:.2%}")
    print(f"{'Precision':<20} | {metrics['precision']:.2%}")
    print(f"{'Recall':<20} | {metrics['recall']:.2%}")
    print(f"{'F1-Score':<20} | {metrics['f1_score']:.2%}")
    print("-" * 35)
    print(f"Total Samples Analyzed: {metrics['sample_count']}")
    
    cm = metrics['confusion_matrix']
    print("\nConfusion Matrix:")
    print(f"  TP: {cm['tp']} | FN: {cm['fn']}")
    print(f"  FP: {cm['fp']} | TN: {cm['tn']}")
    print("="*50 + "\n")
