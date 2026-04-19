"""
Mizan Phase 2.1 — Mock / Seed Data
Pre-seeded demo state so judges land on the review screen immediately.
"""

from datetime import datetime


# ---------------------------------------------------------------------------
# Submitted Application (demo starts at applicationStage: 'review')
# ---------------------------------------------------------------------------

SEED_APPLICATION = {
    "application_id": "QH-2847",
    "loan_amount": 500,
    "purpose": "Car repair",
    "purpose_category": "car_repair",
    "urgency": "high",
    "gross_monthly_income": 2000,
    "monthly_debts": 1200,   # rent $950 + utilities $250
    "household_size": 3,      # applicant + 2 children
    "dependents": 2,
    "mosque_name": "UT Austin MSA",
    "mosque_tenure": "long",  # 2+ years
    "imam_name": "Sheikh Abdullah",
    "imam_phone": "+1 (512) 555-0192",
    "repayment_frequency": "monthly",
    "proposed_monthly_payment": 100,
    "submitted_at": "2026-04-18T15:42:00Z",
    "full_name": "Omar Al-Rashid",
    "date_of_birth": "1994-07-15",
    "phone": "+1 (512) 555-8847",
    "phone_verified": True,
    "address": "2400 Nueces St, Austin, TX 78705",
    # Pre-computed algorithm outputs
    "need_score": 72,
    "need_breakdown": {"income": 20, "urgency": 20, "dependents": 15, "trust": 17},
    "vouch_score": 17,
    "tier": {"name": "Standard", "max_amount": 2000, "expected_months": 5},
    "feasibility": {
        "feasible": True,
        "monthly_payment": 100,
        "discretionary_income": 700,
        "utilization_percent": 14.3,
    },
}


# ---------------------------------------------------------------------------
# Algorithm Outputs (pre-computed for the demo)
# ---------------------------------------------------------------------------

ALGORITHM_OUTPUTS = {
    "assigned_tier": "Standard ($500-$2,000)",
    "monthly_payment": 100,        # 500 / 5 months
    "residual_income": 700,         # $2,000 - $1,200 - $100
    "min_residual_household_3": 1600,
    "feasibility_note": "Tight but feasible — below minimum residual but not dangerously low given urgency",
    "need_score": 72,
    "vouch_score": 17,
    "standard_threshold_score": 50,
    "standard_threshold_trust": 18,
    "routing": "circle_vote",       # trust 17 < 18 threshold, borderline
}


# ---------------------------------------------------------------------------
# Review Screen Steps
# ---------------------------------------------------------------------------

APPLICATION_STEPS = [
    {"step": 1, "label": "Identity confirmed",       "status": "complete", "icon": "check"},
    {"step": 2, "label": "Imam vouch pending",        "status": "pending",  "icon": "clock", "detail": "Sheikh Abdullah notified"},
    {"step": 3, "label": "Algorithm review",          "status": "waiting",  "icon": "circle"},
    {"step": 4, "label": "Pool availability check",   "status": "waiting",  "icon": "circle"},
    {"step": 5, "label": "Decision",                  "status": "waiting",  "icon": "circle"},
]


# ---------------------------------------------------------------------------
# Active Loan (for when demo is switched to active state)
# ---------------------------------------------------------------------------

SEED_ACTIVE_LOAN = {
    "id": "loan-active-1",
    "amount": 500,
    "remaining": 400,
    "monthly_payment": 100,
    "tier": "Standard",
    "purpose": "Car repair",
    "start_date": "2026-04-18",
    "schedule": [
        {"date": "2026-04-18", "amount": 100, "status": "paid"},
        {"date": "2026-05-18", "amount": 100, "status": "due"},
        {"date": "2026-06-18", "amount": 100, "status": "upcoming"},
        {"date": "2026-07-18", "amount": 100, "status": "upcoming"},
        {"date": "2026-08-18", "amount": 100, "status": "upcoming"},
    ],
    "redeployment_stories": [
        "a student in Chicago covering tuition — $300 loan",
        "a family in Phoenix for utility bills — $200 loan",
    ],
}


# ---------------------------------------------------------------------------
# Loan History (past completed loans — builds trust)
# ---------------------------------------------------------------------------

SEED_LOAN_HISTORY = [
    {
        "id": "loan-hist-1",
        "amount": 200,
        "tier": "Micro",
        "start_date": "2024-10-01",
        "end_date": "2024-12-03",
        "months_taken": 2.1,
        "status": "paid_full",
        "purpose": "Utility bills",
    },
    {
        "id": "loan-hist-2",
        "amount": 300,
        "tier": "Standard",
        "start_date": "2025-03-01",
        "end_date": "2025-07-15",
        "months_taken": 4.5,
        "status": "paid_full",
        "purpose": "Medical co-pay",
    },
]


# ---------------------------------------------------------------------------
# Banking Defaults
# ---------------------------------------------------------------------------

BORROWER_BANK = {
    "bank_name": "University Credit Union",
    "bank_last4": "9273",
    "checking_balance": 847.00,
    "bank_linked": False,
}

# Community trust: 4/5 stars (two previous loans paid in full)
COMMUNITY_TRUST_LEVEL = 4
