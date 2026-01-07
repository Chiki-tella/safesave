use aiken/collection/list
use cardano/transaction.{InlineDatum, Output, OutputReference, Transaction}
use smart_saving.{
  Distribute, Group, Investment, InvestmentCompleted, InvestmentDatum,
  InvestmentRedeemer, SavingsDatum, UpdateProfit,
}

validator investment {
  spend(
    datum: Option<InvestmentDatum>,
    redeemer: InvestmentRedeemer,
    _utxo: OutputReference,
    self: Transaction,
  ) {
    expect Some(current_datum) = datum
    when redeemer is {
      UpdateProfit { profit } ->
        handle_update_profit(current_datum, profit, self.outputs)
      Distribute -> handle_distribute(current_datum, self.outputs)
    }
  }

  else(_) {
    fail
  }
}

fn handle_update_profit(
  current_datum: InvestmentDatum,
  profit: Int,
  outputs: List<Output>,
) -> Bool {
  let Investment(state) = current_datum
  expect Some(_) =
    list.find(
      outputs,
      fn(output) {
        when output.datum is {
          InlineDatum(data) -> {
            expect investment_datum: InvestmentDatum = data
            let Investment(out_state) = investment_datum
            out_state.id == state.id && out_state.real_profit == profit && out_state.status == state.status
          }
          _ -> False
        }
      },
    )
  True
}

fn handle_distribute(
  current_datum: InvestmentDatum,
  outputs: List<Output>,
) -> Bool {
  let Investment(state) = current_datum
  expect Some(_) =
    list.find(
      outputs,
      fn(output) {
        when output.datum is {
          InlineDatum(data) -> {
            expect investment_datum: InvestmentDatum = data
            let Investment(out_state) = investment_datum
            out_state.id == state.id && out_state.status == InvestmentCompleted
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
            expect savings_datum: SavingsDatum = data
            when savings_datum is {
              Group(_) -> True
              _ -> False
            }
          }
          _ -> False
        }
      },
    )
  True
}
