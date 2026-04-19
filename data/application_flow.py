"""
Mizan Phase 2.1 — Application Flow Controller
Manages the borrower's progression through the 3-page application:
  Page 1: Natural Language Intake (Claude-powered conversational form)
  Page 2: Verification & Trust Building
  Page 3: Application Review (step tracker with live simulation)
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

from .algorithms import (
    assign_tier,
    compute_need_score,
    compute_vouch_score,
    compute_feasibility,
    determine_routing,
)


class IntakeMode(Enum):
    NATURAL_LANGUAGE = "natural_language"  # Claude-powered conversational form
    QUICK_QUESTIONS = "quick_questions"    # Structured Q&A alternative


class VerificationStatus(Enum):
    NOT_STARTED = "not_started"
    IDENTITY_CONFIRMED = "identity_confirmed"
    VOUCH_PENDING = "vouch_pending"
    VOUCH_RECEIVED = "vouch_received"
    COMPLETE = "complete"


@dataclass
class IntakeResult:
    """Output from the intake step (either mode)."""
    mode: IntakeMode
    raw_input: str = ""
    extracted_fields: dict = field(default_factory=dict)
    confirmed_by_user: bool = False
    completed_at: Optional[str] = None


@dataclass
class VerificationResult:
    """Output from the verification step."""
    identity_confirmed: bool = False
    imam_name: Optional[str] = None
    imam_phone: Optional[str] = None
    imam_notified: bool = False
    imam_vouched: bool = False
    community_vouches: int = 0
    repayment_proposal: Optional[dict] = None
    completed_at: Optional[str] = None


@dataclass
class ReviewStep:
    step_number: int
    label: str
    status: str  # "complete" | "pending" | "waiting" | "failed"
    detail: Optional[str] = None


class ApplicationFlow:
    """
    Controls the borrower's progression through intake → verification → review.
    Each step produces data that feeds into the next.
    """

    def __init__(self):
        self.intake_result: Optional[IntakeResult] = None
        self.verification_result: Optional[VerificationResult] = None
        self.review_steps: List[ReviewStep] = []
        self.current_page: int = 1  # 1=intake, 2=verification, 3=review
        self.algorithm_results: dict = {}

    # ----- Page 1: Intake -----

    def start_intake(self, mode: IntakeMode = IntakeMode.NATURAL_LANGUAGE) -> IntakeResult:
        """Initialize the intake step."""
        self.intake_result = IntakeResult(mode=mode)
        self.current_page = 1
        return self.intake_result

    def submit_natural_language(self, raw_text: str) -> dict:
        """
        Process natural language input through Claude.
        In the real app, this calls the Claude API to extract structured fields.
        Here we return the extraction structure for the frontend to populate.
        """
        if self.intake_result is None:
            self.start_intake(IntakeMode.NATURAL_LANGUAGE)
        self.intake_result.raw_input = raw_text
        # Extraction happens on the frontend via Claude API
        # This returns the structure the frontend expects
        return {
            "status": "extracting",
            "raw_text": raw_text,
            "fields_to_extract": [
                "loan_amount", "purpose", "urgency",
                "gross_monthly_income", "monthly_debts",
                "household_size", "dependents",
            ],
        }

    def confirm_extraction(self, extracted_fields: dict) -> None:
        """User confirms the extracted data is correct."""
        self.intake_result.extracted_fields = extracted_fields
        self.intake_result.confirmed_by_user = True
        self.intake_result.completed_at = datetime.utcnow().isoformat() + "Z"

    def submit_quick_questions(self, answers: dict) -> None:
        """Submit structured Q&A answers."""
        if self.intake_result is None:
            self.start_intake(IntakeMode.QUICK_QUESTIONS)
        self.intake_result.extracted_fields = answers
        self.intake_result.confirmed_by_user = True
        self.intake_result.completed_at = datetime.utcnow().isoformat() + "Z"

    # ----- Page 2: Verification -----

    def start_verification(self) -> VerificationResult:
        """Initialize the verification step."""
        self.verification_result = VerificationResult()
        self.current_page = 2
        return self.verification_result

    def confirm_identity(self, full_name: str, dob: str, phone: str, address: str) -> None:
        """Mark identity as confirmed."""
        self.verification_result.identity_confirmed = True

    def submit_imam_vouch(self, imam_name: str, imam_phone: str) -> None:
        """Submit imam vouch request."""
        self.verification_result.imam_name = imam_name
        self.verification_result.imam_phone = imam_phone
        self.verification_result.imam_notified = True

    def submit_repayment_proposal(self, frequency: str, monthly_amount: float) -> None:
        """Borrower proposes their repayment plan."""
        self.verification_result.repayment_proposal = {
            "frequency": frequency,
            "monthly_amount": monthly_amount,
        }
        self.verification_result.completed_at = datetime.utcnow().isoformat() + "Z"

    # ----- Page 3: Review -----

    def start_review(self, application_data: dict) -> List[ReviewStep]:
        """
        Initialize the review step with live algorithm simulation.
        Builds the step tracker and runs scoring.
        """
        self.current_page = 3

        # Run algorithms
        tier = assign_tier(application_data.get("loan_amount", 0))
        need_score, breakdown = compute_need_score(
            application_data.get("gross_monthly_income", 0),
            application_data.get("urgency", "medium"),
            application_data.get("dependents", 0),
            application_data.get("vouch_score", 0),
        )
        feasibility = compute_feasibility(
            application_data.get("gross_monthly_income", 0),
            application_data.get("monthly_debts", 0),
            application_data.get("proposed_monthly_payment", 0),
            application_data.get("household_size", 1),
            application_data.get("loan_amount", 0),
        )
        routing = determine_routing(need_score, application_data.get("vouch_score", 0), tier["name"], feasibility)

        self.algorithm_results = {
            "tier": tier,
            "need_score": need_score,
            "need_breakdown": breakdown,
            "feasibility": feasibility,
            "routing": routing,
        }

        # Build review steps
        self.review_steps = [
            ReviewStep(1, "Identity confirmed", "complete"),
            ReviewStep(2, "Imam vouch pending", "pending", "Sheikh Abdullah notified"),
            ReviewStep(3, "Algorithm review", "waiting"),
            ReviewStep(4, "Pool availability check", "waiting"),
            ReviewStep(5, "Decision", "waiting"),
        ]
        return self.review_steps

    def get_progress(self) -> dict:
        """Current flow progress for display."""
        return {
            "current_page": self.current_page,
            "intake_complete": self.intake_result is not None and self.intake_result.confirmed_by_user,
            "verification_complete": self.verification_result is not None and self.verification_result.completed_at is not None,
            "review_started": len(self.review_steps) > 0,
            "algorithm_results": self.algorithm_results,
        }
