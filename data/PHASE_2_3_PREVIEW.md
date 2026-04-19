# MIZAN — Phase 2.3 Preview: Hardship, History & Account Tab

## Scope

Phase 2.3 completes the borrower account with the hardship/default handling system, loan history view, and the Account tab. This is the "life happens" phase — designed for when borrowers can't make their scheduled payments.

---

## Hardship & Default Handling

The hardship system is core to Mizan's identity as an ethical lending platform. There are no late fees, no penalties, no credit score damage. Instead, three compassionate paths:

### Path 1: Extension
- Borrower requests more time
- System grants a 30-day extension on the next payment
- Maximum 2 extensions per loan
- Logged as a ledger event but does not change the loan terms
- The tone: "Life happens. Take the time you need."

### Path 2: Restructure
- Borrower needs to change their repayment plan
- Options: lower monthly payment (extends duration), skip a month, change payment date
- New terms are recalculated and displayed before confirmation
- Logged as `loan_restructured` in the ledger
- The borrower sees exactly how the change affects their timeline

### Path 3: Sadaqah Conversion
- For genuine hardship where repayment is no longer feasible
- Outstanding balance is converted to sadaqah (charitable gift) by the lending pool
- The borrower's obligation is fully forgiven
- Logged as `loan_converted` in the ledger
- This is funded by the sadaqah reserve in the lending pool (lenders can optionally contribute)
- The tone: "Your community has your back. This loan is now a gift."

### Hardship Entry
- Accessible from the Active Loan Dashboard: "Having trouble?" link
- Opens a warm, supportive screen — not a punitive one
- Borrower selects which path fits their situation
- Each path has its own confirmation flow

---

## Loan History

A chronological view of all past and current loans:

- Each loan shows: amount, purpose, tier, start/end dates, status, time to repay
- Status types: `paid_full`, `active`, `restructured`, `converted`
- Visual indicators: green checkmark for paid, teal dot for active, amber for restructured, purple heart for converted
- Tapping a loan shows its full transaction history from the ledger

### Trust Building
- Community trust level (1-5 stars) displayed prominently
- Trust increases with each fully repaid loan
- Trust level affects future loan applications (higher trust = easier approval, higher tiers)
- Visual: star rating with a brief explanation — "4 stars — 2 loans paid in full"

---

## Account Tab

The borrower's account management screen:

- **Profile section**: name, phone, address, mosque affiliation
- **Bank connection**: linked bank name and last 4 digits, option to update
- **Transaction history**: full ledger view with filters by type
- **Trust level**: current community trust rating with history
- **Loan summary**: total borrowed, total repaid, active loan status
- **Settings**: notification preferences, payment reminders

---

## Data Dependencies from Phase 2.1 & 2.2

- `BorrowerState.hardship_path` — drives which hardship flow renders
- `BorrowerState.extension_granted` and `conversion_pending` — track hardship state
- `BorrowerLedger.log_restructure()` and `log_conversion()` — hardship events
- `BorrowerState.loan_history` — populated from `SEED_LOAN_HISTORY`
- `BorrowerState.community_trust_level` — displayed in history and account
- `BorrowerBankAccount.get_transaction_history()` — full ledger for account tab

---

## UI Notes

- Hardship screens use the warmest tone in the entire app
- No shame, no guilt, no pressure — the design actively counteracts financial stress
- Sadaqah conversion should feel like a gift, not a failure
- History view uses a timeline layout, not a table — more personal, less clinical
- Account tab is the simplest screen — clean, organized, no cognitive load
