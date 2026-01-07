use aiken/collection/list
use aiken/crypto
use cardano/transaction.{OutputReference, Transaction, placeholder}
use smart_saving.{
  Governance, GovernanceDatum, GovernanceRedeemer, GovernanceRules, UpdateRules,
}

validator governance {
  spend(datum: Option<GovernanceDatum>, redeemer: GovernanceRedeemer, _utxo: OutputReference, self: Transaction) {
    expect Some(current_datum) = datum
    let UpdateRules { new_rules } = redeemer
    handle_update_rules(current_datum, new_rules, self)
  }
  else(_) { fail }
}

fn handle_update_rules(
  current_datum: GovernanceDatum,
  _new_rules: GovernanceRules,
  tx: Transaction,
) -> Bool {
  let Governance(old_rules) = current_datum
  // Only leader can update
  // In production, you'd also validate the new_rules are applied in outputs
  list.has(tx.extra_signatories, old_rules.authorized_leader)
}

test update_governance_rules() {
  let leader: crypto.VerificationKeyHash =
    #"00000000000000000000000000000000000000000000000000000000"
  let initial_rules =
    GovernanceRules {
      interest_rate: 5,
      loan_limit: 10000,
      penalty_rate: 10,
      authorized_leader: leader,
    }
  let initial_datum = Governance(initial_rules)
  let new_rules =
    GovernanceRules {
      interest_rate: 6,
      loan_limit: 12000,
      penalty_rate: 12,
      authorized_leader: leader,
    }
  let redeemer = UpdateRules { new_rules }
  let tx = Transaction { ..placeholder, extra_signatories: [leader] }
  let test_utxo = OutputReference { transaction_id: #"00", output_index: 0 }
  governance.spend(Some(initial_datum), redeemer, test_utxo, tx) == True
}
