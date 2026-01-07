use aiken/collection/list
use aiken/crypto
use aiken/interval.{Finite, Interval, IntervalBound, NegativeInfinity}
use cardano/assets.{PolicyId, from_lovelace}
use cardano/address.{Address, Script}
use cardano/transaction.{
  InlineDatum, Output, Transaction, ValidityRange, placeholder,
}
use smart_saving.{
  BadgeRedeemer, Cleared, Loan, LoanDatum, LoanState, Member, MemberState,
  MintEarlyRepayBadge, MintStreakBadge, SavingsDatum,
}

validator rewards {
  mint(redeemer: BadgeRedeemer, _policy_id: PolicyId, self: Transaction) {
    when redeemer is {
      MintStreakBadge -> check_streak(self.outputs)
      MintEarlyRepayBadge ->
        check_early_repay(self.outputs, self.validity_range)
    }
  }

  else(_) {
    fail
  }
}

fn check_streak(outputs: List<Output>) -> Bool {
  expect Some(_) =
    list.find(
      outputs,
      fn(output) {
        when output.datum is {
          InlineDatum(data) -> {
            expect savings_datum: SavingsDatum = data
            when savings_datum is {
              Member(state) -> state.streak >= 10
              _ -> False
            }
          }
          _ -> False
        }
      },
    )
  True
}

fn check_early_repay(
  outputs: List<Output>,
  validity_range: ValidityRange,
) -> Bool {
  expect Finite(upper_bound) = validity_range.upper_bound.bound_type
  expect Some(_) =
    list.find(
      outputs,
      fn(output) {
        when output.datum is {
          InlineDatum(data) -> {
            expect loan_datum: LoanDatum = data
            let Loan(state) = loan_datum
            state.status == Cleared && state.due_date > upper_bound
          }
          _ -> False
        }
      },
    )
  True
}


// Tests
test mint_streak_badge() {
  let wallet: crypto.VerificationKeyHash =
    #"00000000000000000000000000000000000000000000000000000000"
  let member_state =
    MemberState {
      wallet,
      total_savings: 1000,
      streak: 10,
      last_deposit: 1000,
    }
  let member_datum = Member(member_state)
  let test_address =
    Address {
      payment_credential: Script(#"00"),
      stake_credential: None,
    }
  let output =
    Output {
      address: test_address,
      value: from_lovelace(0),
      datum: InlineDatum(member_datum),
      reference_script: None,
    }
  let tx = Transaction { ..placeholder, outputs: [output] }
  let test_policy_id = #"00"
  rewards.mint(MintStreakBadge, test_policy_id, tx) == True
}

test mint_early_repay_badge() {
  let borrower: crypto.VerificationKeyHash =
    #"00000000000000000000000000000000000000000000000000000000"
  let loan_state =
    LoanState {
      borrower,
      loan_amount: 1000,
      interest: 100,
      due_date: 200000,
      repaid_amount: 1100,
      status: Cleared,
    }
  let loan_datum = Loan(loan_state)
  let test_address =
    Address {
      payment_credential: Script(#"00"),
      stake_credential: None,
    }
  let output =
    Output {
      address: test_address,
      value: from_lovelace(0),
      datum: InlineDatum(loan_datum),
      reference_script: None,
    }
  // Create validity range with Finite upper bound (current time = 100000, before due_date = 200000)
  let test_validity_range =
    Interval {
      lower_bound: IntervalBound {
        bound_type: NegativeInfinity,
        is_inclusive: True,
      },
      upper_bound: IntervalBound {
        bound_type: Finite(100000),
        is_inclusive: True,
      },
    }
  let tx =
    Transaction { ..placeholder, outputs: [output], validity_range: test_validity_range }
  let test_policy_id = #"00"
  rewards.mint(MintEarlyRepayBadge, test_policy_id, tx) == True
}
