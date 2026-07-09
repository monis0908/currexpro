import { useMemo, useState } from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Select from "../components/common/Select";
import StatCard from "../components/dashboard/StatCard";
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiList } from "react-icons/fi";
import { useCollection } from "../hooks/useCollection";
import { transactionService } from "../services/transactionService";
import { formatPKR } from "../utils/formatCurrency";

const RANGES = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

export default function Reports() {
  const [range, setRange] = useState("weekly");
  const { data: transactions } = useCollection(transactionService, [], []);

  const filtered = useMemo(() => {
    const days = RANGES[range];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return transactions.filter((t) => t.createdAt?.toDate && t.createdAt.toDate() >= cutoff);
  }, [transactions, range]);

  const summary = useMemo(() => {
    const buy = filtered.filter((t) => t.type === "buy").reduce((s, t) => s + (t.total || 0), 0);
    const sell = filtered.filter((t) => t.type === "sell").reduce((s, t) => s + (t.total || 0), 0);
    return { buy, sell, profit: sell - buy, count: filtered.length };
  }, [filtered]);

  const chartData = useMemo(() => {
    const byCurrency = {};
    filtered.forEach((t) => {
      if (!byCurrency[t.currencyCode]) byCurrency[t.currencyCode] = { code: t.currencyCode, buy: 0, sell: 0 };
      byCurrency[t.currencyCode][t.type] += t.total || 0;
    });
    return Object.values(byCurrency);
  }, [filtered]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("CurrExPro — Transaction Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Range: ${range.charAt(0).toUpperCase() + range.slice(1)} · Generated: ${new Date().toLocaleString()}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["Date", "Customer", "Type", "Currency", "Amount", "Rate", "Total"]],
      body: filtered.map((t) => [
        t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : "-",
        t.customerName || "Walk-in",
        t.type,
        t.currencyCode,
        t.amount,
        t.rate,
        formatPKR(t.total),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save(`currexpro-report-${range}-${Date.now()}.pdf`);
  };

  return (
    <div className="print:p-0">
      <PageHeader
        title="Reports"
        description="Review performance across daily, weekly, monthly and yearly periods."
        actions={
          <div className="flex items-center gap-2 print:hidden">
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
            />
            <Button variant="outline" icon={FiPrinter} onClick={() => window.print()}>Print</Button>
            <Button icon={FiDownload} onClick={exportPDF}>Export PDF</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Buy" value={formatPKR(summary.buy)} icon={FiTrendingUp} tone="mint" />
        <StatCard label="Total Sell" value={formatPKR(summary.sell)} icon={FiTrendingDown} tone="coral" />
        <StatCard label="Net Profit" value={formatPKR(summary.profit)} icon={FiDollarSign} tone="accent" />
        <StatCard label="Transactions" value={summary.count} icon={FiList} tone="amber" />
      </div>

      <Card>
        <h3 className="font-display font-semibold text-ink mb-4">Volume by currency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.06)" />
            <XAxis dataKey="code" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)" }} />
            <Bar dataKey="buy" fill="#0EA976" radius={[6, 6, 0, 0]} name="Buy" />
            <Bar dataKey="sell" fill="#E23B5D" radius={[6, 6, 0, 0]} name="Sell" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}