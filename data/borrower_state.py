"""
Mizan Phase 2.1 — BorrowerContext State Definitions
All state for the borrower account, separate from PortfolioContext.
"""

from dataclasses import dataclass, field
from typing import Optional, List, Literal
from datetime import datetime


# ---------------------------------------------------------------------------
# Application State
# ---------------------------------------------------------------------------

ApplicationStage = Literal[
    "pre_application", "intake", "verification", "review", "decided", "active_loan"
]

DecisionOutcome = Literal["approved", "reduced", "denied"]

HardshipPath = Literal["extension", "restructure", "conversion"]


@dataclass
class DraftApplication:
    loan_amount: Optional[float] = None
    purpose: Optional[str] = None
    purpose_category: Optional[str] = None
    urgency: Optional[str] = None
    gross_monthly_income: Optional[float] = None
    monthly_debts: Optional[float] = None
    household_size: Optional[int] = None
    dependents: Optional[int] = None
    mosque_name: Optional[str] = None
    mosque_tenure: Optional[str] = None
    imam_name: Optional[str] = None
    imam_phone: Optional[str] = None
    repayment_frequency: Optional[str] = None
    proposed_monthly_payment: Optional[float] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


@dataclass
class ExtractedData:
    """What Claude pulled from natural language input before user confirmation."""
    raw_text: str = ""
    parsed_fields: dict = field(default_factory=dict)
    confidence_scores: dict = field(default_factory=dict)


@dataclass
class BorrowerState:
    """Full borrower account state — mirrors BorrowerContext.jsx."""

    # Application state
    application_stage: ApplicationStage = "pre_application"
    draft_application: Optional[DraftApplication] = None
    extracted_data: Optional[ExtractedData] = None
    submitted_application: Optional[dict] = None
    extracting: bool = False

    # Decision state
    decision_outcome: Optional[DecisionOutcome] = None
    offered_amount: Optional[float] = None
    decision_reason: Optional[str] = None

    # Loan state
    active_loan: Optional[dict] = None
    loan_history: List[dict] = field(default_factory=list)
    community_trust_level: int = 1  # 1-5

    # Banking state
    checking_balance: float = 847.00
    bank_name: str = "University Credit Union"
    bank_last4: str = "9273"
    bank_linked: bool = False
    borrower_transactions: List[dict] = field(default_factory=list)

    # Hardship state
    hardship_path: Optional[HardshipPath] = None
    extension_granted: bool = False
    conversion_pending: bool = False
