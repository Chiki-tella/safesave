use aiken/crypto.{VerificationKeyHash}

pub type LoanStatus {
  Active
  Cleared
  Late
}

pub type LoanState {
  borrower: VerificationKeyHash,
  loan_amount: Int,
  interest: Int,
  due_date: Int,
  repaid_amount: Int,
  status: LoanStatus,
}

pub type LoanDatum {
  Loan(LoanState)
}

pub type LoanRedeemer {
  RepayLoan { amount: Int }
  CheckLate
}

pub type SavingsDatum {
  Group(GroupState)
  Member(MemberState)
}

pub type GroupState {
  total_balance: Int
}

pub type MemberState {
  wallet: VerificationKeyHash,
  total_savings: Int,
  streak: Int,
  last_deposit: Int,
}

pub type SavingsRedeemer {
  Deposit { amount: Int }
  Penalize
  Borrow { amount: Int, due_date: Int }
  Invest { amount: Int, name: ByteArray, roi: Int }
}

pub type InvestmentStatus {
  InvestmentActive
  InvestmentCompleted
}

pub type InvestmentState {
  id: ByteArray,
  project_name: ByteArray,
  amount_invested: Int,
  expected_roi: Int,
  real_profit: Int,
  status: InvestmentStatus,
}

pub type InvestmentDatum {
  Investment(InvestmentState)
}

pub type InvestmentRedeemer {
  UpdateProfit { profit: Int }
  Distribute
}

pub type BadgeRedeemer {
  MintStreakBadge
  MintEarlyRepayBadge
}

pub type GovernanceRules {
  interest_rate: Int,
  loan_limit: Int,
  penalty_rate: Int,
  authorized_leader: VerificationKeyHash,
}

pub type GovernanceDatum {
  Governance(GovernanceRules)
}

pub type GovernanceRedeemer {
  UpdateRules { new_rules: GovernanceRules }
}
