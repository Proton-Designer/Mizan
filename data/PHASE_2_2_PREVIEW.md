# MIZAN — Phase 2.2 Preview: Decision, Active Loan & Payments

## Scope

Phase 2.2 picks up where 2.1 ends — once the application review is complete, the borrower lands on the decision screen. This phase covers the three possible outcomes, the active loan dashboard, and the payment flow.

---

## Decision Screen (3 Outcomes)

### Approved
- Full amount granted at the requested tier
- Borrower sees: congratulations message, loan terms summary, "Link bank account to receive funds" button
- On bank linkage: disbursement fires immediately (simulated), balance updates in real time
- Notification: "Your $500 qard hassan loan has been deposited to University Credit Union ****9273"

### Reduced
- Partial amount offered (e.g., requested $500, offered $350)
- Borrower sees: explanation of why the amount was reduced, adjusted repayment terms
- Option to accept the reduced amount or decline entirely
- If accepted: same disbursement flow as approved, just with the reduced amount

### Denied
- Application did not meet minimum criteria
- Borrower sees: compassionate denial message (not a rejection — a redirection)
- Suggestions: reapply with an imam vouch, try a smaller amount, connect with community resources
- No punitive language — the tone is supportive and forward-looking

---

## Active Loan Dashboard

Once funds are disbursed, the borrower's home screen becomes the Active Loan Dashboard:

- **Loan summary card**: amount, remaining balance, monthly payment, next due date
- **Repayment progress bar**: visual indicator of how much has been paid
- **Schedule timeline**: each payment date with status (paid / due / upcoming)
- **Redeployment story**: where your repaid dollars went — "Your $100 repayment helped fund a student in Chicago covering tuition"
- **Quick action**: "Make a Payment" button prominently placed

---

## Make a Payment

The payment flow is intentionally simple:

1. Borrower taps "Make a Payment"
2. Sees their checking balance and the payment amount
3. Confirms payment
4. Balance updates immediately (checking decreases, loan remaining decreases)
5. Transaction logged in both the borrower ledger and the lending pool
6. Redeployment story updates — the borrower sees their repayment helping someone else
7. If this payment completes a cycle, the lender's portfolio updates too

### Partial payments
- Borrower can pay less than the scheduled amount
- Logged as `partial_payment` in the ledger
- Remaining balance adjusts accordingly
- No penalty — the system is designed to be flexible

---

## Data Dependencies from Phase 2.1

- `BorrowerBankAccount.receive_disbursement()` — called on approved/reduced decision
- `BorrowerBankAccount.make_payment()` — called from payment screen
- `LendingPool.disburse()` and `LendingPool.receive_repayment()` — pool integration
- `BorrowerLedger` — all transactions logged here
- `BorrowerState.decision_outcome` — drives which decision screen renders
- `BorrowerState.active_loan` — populated after disbursement, drives the dashboard

---

## UI Notes

- Decision screen uses large type and generous whitespace — this is an emotional moment
- Teal accent color throughout (not gold — that's the portfolio)
- Active loan dashboard should feel calm and manageable, not stressful
- Payment confirmation uses a simple modal, not a new page
