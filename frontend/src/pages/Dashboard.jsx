import { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatPKR } from "../utils/formatCurrency";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiPlusCircle,
  FiMinusCircle,
  FiUsers,
} from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useCollection } from "../hooks/useCollection";
import { transactionService } from "../services/transactionService";
import { bankService } from "../services/bankService";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/dashboard/StatCard";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Loader from "../components/common/Loader";
import { useAuth } from "../context/AuthContext";

function isToday(ts) {
  if (!ts?.toDate) return false;
  const d = ts.toDate();
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: transactions, loading } = useCollection(transactionService, [], []);
  const { data: accounts, loading: accountsLoading } = useCollection(bankService, [], []);

  const stats = useMemo(() => {
    const todays = transactions.filter((t) => isToday(t.createdAt));
    const buyTotal = todays.filter((t) => t.type === "buy").reduce((s, t) => s + (t.total || 0), 0);
    const sellTotal = todays.filter((t) => t.type === "sell").reduce((s, t) => s + (t.total || 0), 0);
    const profit = sellTotal - buyTotal;
    return { buyTotal, sellTotal, profit, count: todays.length };
  }, [transactions]);

  const balances = useMemo(() => {
    const cash = accounts.filter((a) => a.type === "cash").reduce((s, a) => s + (a.balance || 0), 0);
    const bank = accounts.filter((a) => a.type === "transfer").reduce((s, a) => s + (a.balance || 0), 0);
    return { cash, bank };
  }, [accounts]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { key: d.toDateString(), label: d.toLocaleDateString(undefined, { weekday: "short" }), buy: 0, sell: 0 };
    });
    transactions.forEach((t) => {
      if (!t.createdAt?.toDate) return;
      const key = t.createdAt.toDate().toDateString();
      const day = days.find((d) => d.key === key);
      if (day) day[t.type === "buy" ? "buy" : "sell"] += t.total || 0;
    });
    return days;
  }, [transactions]);

  const recent = transactions.slice(0, 6);

  if (loading || accountsLoading) return <Loader full label="Loading dashboard..." />;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's what's happening at your bureau today."
        actions={
          <>
            <Link to="/currency/buy">
              <Button variant="mint" icon={FiPlusCircle}>Buy Currency</Button>
            </Link>
            <Link to="/currency/sell">
              <Button variant="coral" icon={FiMinusCircle}>Sell Currency</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's Buy" value={formatPKR(stats.buyTotal)} icon={FiTrendingUp} tone="mint" />
        <StatCard label="Today's Sell" value={formatPKR(stats.sellTotal)} icon={FiTrendingDown} tone="coral" />
        <StatCard label="Today's Profit" value={formatPKR(stats.profit)} icon={FiDollarSign} tone="accent" sub={`${stats.count} deals today`} />
        <StatCard
          label="Cash + Bank Balance"
          value={formatPKR(balances.cash + balances.bank)}
          icon={FiCreditCard}
          tone="amber"
          sub={`Cash ${formatPKR(balances.cash)} · Bank ${formatPKR(balances.bank)}`}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink">Buy vs Sell — last 7 days</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="buyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA976" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0EA976" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sellGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E23B5D" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E23B5D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)" }} />
              <Area type="monotone" dataKey="buy" stroke="#0EA976" fill="url(#buyGrad)" strokeWidth={2} name="Buy" />
              <Area type="monotone" dataKey="sell" stroke="#E23B5D" fill="url(#sellGrad)" strokeWidth={2} name="Sell" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-ink mb-4">Quick actions</h3>
          <div className="flex flex-col gap-2">
            <Link to="/currency/buy" className="flex items-center gap-3 p-3 rounded-xl hover:bg-paper border border-black/5">
              <FiPlusCircle className="text-mint" /> <span className="text-sm font-medium">New Buy Deal</span>
            </Link>
            <Link to="/currency/sell" className="flex items-center gap-3 p-3 rounded-xl hover:bg-paper border border-black/5">
              <FiMinusCircle className="text-coral" /> <span className="text-sm font-medium">New Sell Deal</span>
            </Link>
            <Link to="/customers" className="flex items-center gap-3 p-3 rounded-xl hover:bg-paper border border-black/5">
              <FiUsers className="text-accent" /> <span className="text-sm font-medium">Add Customer</span>
            </Link>
            <Link to="/currency/rates" className="flex items-center gap-3 p-3 rounded-xl hover:bg-paper border border-black/5">
              <FiTrendingUp className="text-amber" /> <span className="text-sm font-medium">Update Rates</span>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ink">Recent transactions</h3>
          <Link to="/transactions" className="text-sm text-accent font-medium">View all</Link>
        </div>
        <div className="flex flex-col divide-y divide-black/5">
          {recent.length === 0 && <p className="text-sm text-muted py-6 text-center">No transactions yet.</p>}
          {recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.type === "buy" ? "bg-mint-light text-mint" : "bg-coral-light text-coral"}`}>
                  {t.type === "buy" ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{t.customerName || "Walk-in customer"}</p>
                  <p className="text-xs text-muted">{t.amount} {t.currencyCode} @ {t.rate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-tabular text-sm font-semibold text-ink">{formatPKR(t.total || 0)}</p>
                <Badge color={t.type === "buy" ? "mint" : "coral"}>{t.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
