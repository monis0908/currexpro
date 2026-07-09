import BankAccountsView from "../components/bank/BankAccountsView";

export default function BankCash() {
  return (
    <BankAccountsView
      type="cash"
      title="Cash Accounts"
      description="Manage physical cash tills and vaults."
    />
  );
}
