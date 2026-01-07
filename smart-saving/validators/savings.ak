use aiken/collection/list
use aiken/crypto
use aiken/interval.{Finite}
use cardano/assets.{from_lovelace}
use cardano/address.{Address, Script}
use cardano/transaction.{
  InlineDatum, Output, OutputReference, Transaction, ValidityRange, placeholder,
}
use smart_saving.{
  Active, Borrow, Deposit, Group, GroupState, Invest, Investment,
  InvestmentActive, InvestmentDatum, Loan, LoanDatum, Member, MemberState,
  Penalize, SavingsDatum, SavingsRedeemer,
}

validator savings {
  spend(
    datum: Option<SavingsDatum>,
    redeemer: SavingsRedeemer,
    _utxo: OutputReference,
    self: Transaction,
  ) {
    expect Some(current_datum) = datum
    when redeemer is {
      Deposit { amount } -> handle_deposit(current_datum, amount, self.outputs)
      Penalize ->
        handle_penalize(current_datum, self.validity_range, self.outputs)
      Borrow { amount, due_date } ->
        handle_borrow(
          current_datum,
          amount,
          due_date,
          self.outputs,
          self.extra_signatories,
        )
      Invest { amount, name, roi } ->
        handle_invest(current_datum, amount, name, roi, self.outputs)
    }
  }

  else(_) {
    fail
  }
}

fn handle_deposit(
  current_datum: SavingsDatum,
  amount: Int,
  outputs: List<Output>,
) -> Bool {
  when current_datum is {
    Group(state) -> {
      let expected_balance = state.total_balance + amount
      expect Some(_) =
        list.find(
          outputs,
          fn(output) {
            when output.datum is {
              InlineDatum(data) -> {
                expect savings_datum: SavingsDatum = data
                when savings_datum is {
                  Group(out_state) ->
                    out_state.total_balance == expected_balance
                  _ -> False
                }
              }
              _ -> False
            }
          },
        )
      True
    }
    Member(state) -> {
      let expected_savings = state.total_savings + amount
      let expected_streak = state.streak + 1
      expect Some(_) =
        list.find(
          outputs,
          fn(output) {
            when output.datum is {
              InlineDatum(data) -> {
                expect savings_datum: SavingsDatum = data
                when savings_datum is {
                  Member(out_state) ->
                    out_state.wallet == state.wallet && out_state.total_savings == expected_savings && out_state.streak == expected_streak
                  _ -> False
                }
              }
              _ -> False
            }
          },
        )
      True
    }
  }
}

fn handle_penalize(
  current_datum: SavingsDatum,
  validity_range: ValidityRange,
  outputs: List<Output>,
) -> Bool {
  when current_datum is {
    Member(state) -> {
      let one_week = 604800000
      let deadline = state.last_deposit + one_week
      expect Finite(lower_bound) = validity_range.lower_bound.bound_type
      if lower_bound > deadline {
        expect Some(_) =
          list.find(
            outputs,
            fn(output) {
              when output.datum is {
                InlineDatum(data) -> {
                  expect savings_datum: SavingsDatum = data
                  when savings_datum is {
                    Member(out_state) ->
                      out_state.wallet == state.wallet && out_state.total_savings == state.total_savings && out_state.streak == 0
                    _ -> False
                  }
                }
                _ -> False
              }
            },
          )
        True
      } else {
        False
      }
    }
    Group(_) -> False
  }
}

fn handle_borrow(
  current_datum: SavingsDatum,
  amount: Int,
  due_date: Int,
  outputs: List<Output>,
  signatories: List<crypto.VerificationKeyHash>,
) -> Bool {
  when current_datum is {
    Group(state) -> {
      let expected_balance = state.total_balance - amount
      expect Some(_) =
        list.find(
          outputs,
          fn(output) {
            when output.datum is {
              InlineDatum(data) -> {
                expect savings_datum: SavingsDatum = data
                when savings_datum is {
                  Group(out_state) ->
                    out_state.total_balance == expected_balance
                  _ -> False
                }
              }
              _ -> False
            }
          },
        )
      expect Some(borrower) = list.head(signatories)
      expect Some(_) =
        list.find(
          outputs,
          fn(output) {
            when output.datum is {
              InlineDatum(data) -> {
                expect loan_datum: LoanDatum = data
                let Loan(loan_state) = loan_datum
                loan_state.borrower == borrower && loan_state.loan_amount == amount && loan_state.due_date == due_date && loan_state.status == Active
              }
              _ -> False
            }
          },
        )
      True
    }
    Member(_) -> False
  }
}

fn handle_invest(
  current_datum: SavingsDatum,
  amount: Int,
  name: ByteArray,
  roi: Int,
  outputs: List<Output>,
) -> Bool {
  when current_datum is {
    Group(state) -> {
      let expected_balance = state.total_balance - amount
      expect Some(_) =
        list.find(
          outputs,
          fn(output) {
            when output.datum is {
              InlineDatum(data) -> {
                expect savings_datum: SavingsDatum = data
                when savings_datum is {
                  Group(out_state) ->
                    out_state.total_balance == expected_balance
                  _ -> False
                }
              }
              _ -> False
            }
          },
        )
      expect Some(_) =
        list.find(
          outputs,
          fn(output) {
            when output.datum is {
              InlineDatum(data) -> {
                expect investment_datum: InvestmentDatum = data
                let Investment(inv_state) = investment_datum
                inv_state.project_name == name && inv_state.amount_invested == amount && inv_state.expected_roi == roi && inv_state.status == InvestmentActive
              }
              _ -> False
            }
          },
        )
      True
    }
    Member(_) -> False
  }
}


// Tests
test deposit_success() {
  let initial_group_state = GroupState { total_balance: 1000 }
  let initial_datum = Group(initial_group_state)
  let redeemer = Deposit { amount: 500 }
  let expected_group_state = GroupState { total_balance: 1500 }
  let output_datum = Group(expected_group_state)
  let test_address =
    Address {
      payment_credential: Script(#"00"),
      stake_credential: None,
    }
  let output =
    Output {
      address: test_address,
      value: from_lovelace(1500),
      datum: InlineDatum(output_datum),
      reference_script: None,
    }
  let tx = Transaction { ..placeholder, outputs: [output] }
  let test_utxo = OutputReference { transaction_id: #"00", output_index: 0 }
  savings.spend(Some(initial_datum), redeemer, test_utxo, tx) == True
}
