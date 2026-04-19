"""
Mizan Phase 2.1 — Simulated Banking System
Handles loan disbursement, repayment processing, and the cross-account
lending pool loop that connects borrowers to lenders.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from enum import Enum


class TransactionType(Enum):
    LOAN_DISBURSEMENT = "loan_disbursement"
    LOAN_REPAYMENT = "loan_repayment"
    LOAN_RESTRUCTURED = "loan_restructured"
    LOAN_CONVERTED = "loan_converted"
    PARTIAL_PAYMENT = "partial_payment"


@dataclass
class Transaction:
    timestamp: str
    tx_type: TransactionType
    amount: float
    balance_after: float
    description: str


@dataclass
class BorrowerBankAccount:
    """Simulated checking account for the borrower."""

    bank_name: str = "University Credit Union"
    last4: str = "9273"
    checking_balance: float = 847.00
    linked: bool = False
    transactions: List[Transaction] = field(default_factory=list)

    def receive_disbursement(self, amount: float, loan_id: str = "") -> Transaction:
        """
        Credits checking balance when a loan is approved.
        Called from the decision screen after bank linkage.
        """
        self.checking_balance += amount
        tx = Transaction(
            timestamp=datetime.utcnow().isoformat() + "Z",
            tx_type=TransactionType.LOAN_DISBURSEMENT,
            amount=amount,
            balance_after=self.checking_balance,
            description=f"Qard hassan loan deposited — ${amount:.0f} to {self.bank_name} ****{self.last4}",
        )
        self.transactions.append(tx)
        return tx

    def make_payment(self, amount: float, loan_remaining: float) -> Transaction:
        """
        Debits checking balance for a loan repayment.
        Returns the transaction. Caller is responsible for updating
        the loan remaining balance and the lending pool.
        """
        if amount > self.checking_balance:
            raise InsufficientFundsError(
                f"Payment ${amount:.2f} exceeds checking balance ${self.checking_balance:.2f}"
            )
        self.checking_balance -= amount
        tx = Transaction(
            timestamp=datetime.utcnow().isoformat() + "Z",
            tx_type=TransactionType.LOAN_REPAYMENT,
            amount=amount,
            balance_after=self.checking_balance,
            description=f"Loan repayment — ${amount:.0f}",
        )
        self.transactions.append(tx)
        return tx

    def make_partial_payment(self, amount: float) -> Transaction:
        """Partial repayment — less than the scheduled amount."""
        if amount > self.checking_balance:
            raise InsufficientFundsError(
                f"Partial payment ${amount:.2f} exceeds checking balance ${self.checking_balance:.2f}"
            )
        self.checking_balance -= amount
        tx = Transaction(
            timestamp=datetime.utcnow().isoformat() + "Z",
            tx_type=TransactionType.PARTIAL_PAYMENT,
            amount=amount,
            balance_after=self.checking_balance,
            description=f"Partial loan repayment — ${amount:.0f}",
        )
        self.transactions.append(tx)
        return tx

    def get_balance(self) -> float:
        return self.checking_balance

    def get_transaction_history(self) -> List[Transaction]:
        return list(self.transactions)


class InsufficientFundsError(Exception):
    pass


# ---------------------------------------------------------------------------
# Lending Pool Integration
# ---------------------------------------------------------------------------

@dataclass
class LendingPool:
    """
    Simulated lending pool shared between borrower and portfolio contexts.
    When a loan is disbursed, available capital decreases.
    When a repayment comes in, capital re-enters the pool.
    """

    available_capital: float = 12_847.00  # matches portfolio seed data
    total_deployed: float = 0.0

    def disburse(self, amount: float) -> None:
        """Reduce pool when a loan is approved."""
        if amount > self.available_capital:
            raise PoolDepletedError(f"Requested ${amount:.2f} but pool has ${self.available_capital:.2f}")
        self.available_capital -= amount
        self.total_deployed += amount

    def receive_repayment(self, amount: float) -> None:
        """Repayment capital re-enters the pool."""
        self.available_capital += amount
        self.total_deployed -= amount

    def get_utilization(self) -> float:
        total = self.available_capital + self.total_deployed
        if total == 0:
            return 0.0
        return (self.total_deployed / total) * 100


class PoolDepletedError(Exception):
    pass


# ---------------------------------------------------------------------------
# Disbursement + Repayment Orchestration
# ---------------------------------------------------------------------------

def process_disbursement(
    bank: BorrowerBankAccount,
    pool: LendingPool,
    loan_amount: float,
    loan_id: str = "",
) -> Transaction:
    """
    Full disbursement flow:
    1. Pool capital decreases
    2. Borrower checking balance increases
    3. Transaction logged
    """
    pool.disburse(loan_amount)
    bank.linked = True
    tx = bank.receive_disbursement(loan_amount, loan_id)
    return tx


def process_repayment(
    bank: BorrowerBankAccount,
    pool: LendingPool,
    payment_amount: float,
    loan: dict,
) -> Transaction:
    """
    Full repayment flow:
    1. Borrower checking balance decreases
    2. Loan remaining decreases
    3. Capital re-enters the lending pool
    4. Returns transaction for ledger display
    """
    tx = bank.make_payment(payment_amount, loan.get("remaining", 0))
    loan["remaining"] = max(0, loan.get("remaining", 0) - payment_amount)
    pool.receive_repayment(payment_amount)
    return tx
