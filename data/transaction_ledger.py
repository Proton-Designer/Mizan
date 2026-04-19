"""
Mizan Phase 2.1 — Borrower Transaction Ledger
Logs every monetary event with timestamp, type, amount, balance-after,
and description. Same structure as the portfolio transaction ledger.
"""

from datetime import datetime
from typing import List, Optional
from dataclasses import dataclass, field
from enum import Enum


class LedgerEntryType(Enum):
    LOAN_DISBURSEMENT = "loan_disbursement"
    LOAN_REPAYMENT = "loan_repayment"
    LOAN_RESTRUCTURED = "loan_restructured"
    LOAN_CONVERTED = "loan_converted"
    PARTIAL_PAYMENT = "partial_payment"


@dataclass
class LedgerEntry:
    timestamp: str
    entry_type: LedgerEntryType
    amount: float
    balance_after: float
    description: str
    loan_id: Optional[str] = None
    metadata: dict = field(default_factory=dict)


class BorrowerLedger:
    """
    Transaction ledger for the borrower account.
    Viewable from the Account tab.
    """

    def __init__(self):
        self._entries: List[LedgerEntry] = []

    def log(
        self,
        entry_type: LedgerEntryType,
        amount: float,
        balance_after: float,
        description: str,
        loan_id: Optional[str] = None,
        **metadata,
    ) -> LedgerEntry:
        entry = LedgerEntry(
            timestamp=datetime.utcnow().isoformat() + "Z",
            entry_type=entry_type,
            amount=amount,
            balance_after=balance_after,
            description=description,
            loan_id=loan_id,
            metadata=metadata,
        )
        self._entries.append(entry)
        return entry

    def log_disbursement(self, amount: float, balance_after: float, loan_id: str) -> LedgerEntry:
        return self.log(
            LedgerEntryType.LOAN_DISBURSEMENT,
            amount,
            balance_after,
            f"Qard hassan loan received — ${amount:.0f}",
            loan_id=loan_id,
        )

    def log_repayment(self, amount: float, balance_after: float, loan_id: str, remaining: float) -> LedgerEntry:
        return self.log(
            LedgerEntryType.LOAN_REPAYMENT,
            amount,
            balance_after,
            f"Monthly repayment — ${amount:.0f} (${remaining:.0f} remaining)",
            loan_id=loan_id,
            remaining=remaining,
        )

    def log_restructure(self, loan_id: str, old_payment: float, new_payment: float, balance_after: float) -> LedgerEntry:
        return self.log(
            LedgerEntryType.LOAN_RESTRUCTURED,
            0,
            balance_after,
            f"Repayment plan changed — ${old_payment:.0f}/mo → ${new_payment:.0f}/mo",
            loan_id=loan_id,
            old_payment=old_payment,
            new_payment=new_payment,
        )

    def log_conversion(self, amount: float, balance_after: float, loan_id: str) -> LedgerEntry:
        return self.log(
            LedgerEntryType.LOAN_CONVERTED,
            amount,
            balance_after,
            f"Outstanding balance ${amount:.0f} converted to sadaqah",
            loan_id=loan_id,
        )

    def get_entries(self, limit: Optional[int] = None) -> List[LedgerEntry]:
        entries = sorted(self._entries, key=lambda e: e.timestamp, reverse=True)
        if limit:
            return entries[:limit]
        return entries

    def get_entries_by_type(self, entry_type: LedgerEntryType) -> List[LedgerEntry]:
        return [e for e in self._entries if e.entry_type == entry_type]

    def get_entries_by_loan(self, loan_id: str) -> List[LedgerEntry]:
        return [e for e in self._entries if e.loan_id == loan_id]

    @property
    def total_disbursed(self) -> float:
        return sum(e.amount for e in self._entries if e.entry_type == LedgerEntryType.LOAN_DISBURSEMENT)

    @property
    def total_repaid(self) -> float:
        return sum(
            e.amount for e in self._entries
            if e.entry_type in (LedgerEntryType.LOAN_REPAYMENT, LedgerEntryType.PARTIAL_PAYMENT)
        )
