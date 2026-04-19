"""
Mizan Phase 2.1 — Scoring & Tier Algorithms (Python mirror)
Python equivalents of src/utils/algorithms.js for data analysis,
testing, and backend validation.
"""

from typing import Dict, Tuple, Optional


# ---------------------------------------------------------------------------
# Tier Assignment
# ---------------------------------------------------------------------------

TIERS = [
    {"name": "Micro",       "min": 0,    "max": 500,   "expected_months": 3},
    {"name": "Standard",    "min": 500,  "max": 2000,  "expected_months": 5},
    {"name": "Growth",      "min": 2000, "max": 5000,  "expected_months": 8},
    {"name": "Enterprise",  "min": 5000, "max": 15000, "expected_months": 12},
]

TIER_THRESHOLDS = {
    "Micro":      {"min_score": 30, "min_trust": 10},
    "Standard":   {"min_score": 50, "min_trust": 18},
    "Growth":     {"min_score": 65, "min_trust": 25},
    "Enterprise": {"min_score": 80, "min_trust": 35},
}


def assign_tier(loan_amount: float) -> dict:
    """Assign a tier based on the requested loan amount."""
    for tier in TIERS:
        if tier["min"] <= loan_amount <= tier["max"]:
            return tier
    # Above max — cap at Enterprise
    return TIERS[-1]


# ---------------------------------------------------------------------------
# Need Score (0–100)
# ---------------------------------------------------------------------------

def compute_need_score(
    gross_monthly_income: float,
    urgency: str,
    dependents: int,
    vouch_score: int,
) -> Tuple[int, Dict[str, int]]:
    """
    Compute the need score and its breakdown.
    Returns (total_score, breakdown_dict).
    """
    # Income component (0-25): lower income = higher need
    if gross_monthly_income <= 1500:
        income_score = 25
    elif gross_monthly_income <= 2500:
        income_score = 20
    elif gross_monthly_income <= 4000:
        income_score = 15
    elif gross_monthly_income <= 6000:
        income_score = 10
    else:
        income_score = 5

    # Urgency component (0-25)
    urgency_map = {"critical": 25, "high": 20, "medium": 15, "low": 10}
    urgency_score = urgency_map.get(urgency, 10)

    # Dependents component (0-25)
    dependents_score = min(25, dependents * 7 + 1) if dependents > 0 else 0

    # Trust / vouch component (0-25)
    trust_score = min(25, vouch_score)

    breakdown = {
        "income": income_score,
        "urgency": urgency_score,
        "dependents": dependents_score,
        "trust": trust_score,
    }
    total = sum(breakdown.values())
    return min(100, total), breakdown


# ---------------------------------------------------------------------------
# Vouch Score
# ---------------------------------------------------------------------------

def compute_vouch_score(
    mosque_tenure: str,
    imam_vouched: bool = False,
    community_vouches: int = 0,
    previous_loans_paid: int = 0,
) -> int:
    """
    Vouch / community trust score.
    Tenure alone gives partial credit; imam vouch and history add more.
    """
    score = 0

    # Mosque tenure
    tenure_map = {"long": 10, "medium": 6, "short": 3, "new": 1}
    score += tenure_map.get(mosque_tenure, 1)

    # Imam vouch
    if imam_vouched:
        score += 8

    # Community vouches (max 4 counted)
    score += min(4, community_vouches) * 2

    # Loan history (each fully paid loan adds trust)
    score += min(5, previous_loans_paid) * 3

    return score


# ---------------------------------------------------------------------------
# Feasibility Check
# ---------------------------------------------------------------------------

# Minimum residual income per household size (monthly, after debts + payment)
MIN_RESIDUAL = {
    1: 800,
    2: 1200,
    3: 1600,
    4: 2000,
    5: 2400,
}


def compute_feasibility(
    gross_monthly_income: float,
    monthly_debts: float,
    proposed_payment: float,
    household_size: int,
    loan_amount: float,
) -> dict:
    """
    Check whether the borrower can feasibly repay.
    Returns a dict with feasibility assessment.
    """
    residual = gross_monthly_income - monthly_debts - proposed_payment
    min_required = MIN_RESIDUAL.get(household_size, MIN_RESIDUAL[5])
    utilization = (proposed_payment / gross_monthly_income * 100) if gross_monthly_income > 0 else 100

    # Feasible if residual >= minimum, OR if it's close and there are
    # mitigating factors (the "tight but feasible" case)
    margin = residual - min_required
    if margin >= 0:
        feasible = True
        note = "Meets minimum residual income threshold"
    elif margin >= -200:
        # Within $200 of threshold — flag as tight but workable
        feasible = True
        note = "Tight but feasible — below minimum residual but not dangerously low"
    else:
        feasible = False
        note = "Below minimum residual income — may need reduced amount"

    return {
        "feasible": feasible,
        "monthly_payment": proposed_payment,
        "residual_income": residual,
        "min_residual_required": min_required,
        "margin": margin,
        "utilization_percent": round(utilization, 1),
        "note": note,
    }


# ---------------------------------------------------------------------------
# Approval Routing
# ---------------------------------------------------------------------------

def determine_routing(
    need_score: int,
    vouch_score: int,
    tier_name: str,
    feasibility: dict,
) -> str:
    """
    Determine the approval path:
    - 'auto_approve': meets all thresholds
    - 'circle_vote': borderline — needs community circle review
    - 'manual_review': requires manual committee review
    - 'deny': does not meet minimum criteria
    """
    thresholds = TIER_THRESHOLDS.get(tier_name, TIER_THRESHOLDS["Standard"])

    if not feasibility.get("feasible", False):
        return "deny"

    score_ok = need_score >= thresholds["min_score"]
    trust_ok = vouch_score >= thresholds["min_trust"]

    if score_ok and trust_ok:
        return "auto_approve"
    elif score_ok and not trust_ok:
        # Score is fine but trust is borderline
        trust_gap = thresholds["min_trust"] - vouch_score
        if trust_gap <= 3:
            return "circle_vote"
        return "manual_review"
    elif trust_ok and not score_ok:
        return "manual_review"
    else:
        return "deny"
