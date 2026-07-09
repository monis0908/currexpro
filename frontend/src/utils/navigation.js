import {
  FiGrid,
  FiRepeat,
  FiList,
  FiUsers,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: FiGrid },
  {
    label: "Currency",
    icon: FiRepeat,
    children: [
      { label: "Buy", path: "/currency/buy" },
      { label: "Sell", path: "/currency/sell" },
      { label: "Rates", path: "/currency/rates" },
    ],
  },
  { label: "Transactions", path: "/transactions", icon: FiList },
  { label: "Customers", path: "/customers", icon: FiUsers },
  {
    label: "Bank Accounts",
    icon: FiCreditCard,
    children: [
      { label: "Cash", path: "/bank/cash" },
      { label: "Transfer", path: "/bank/transfer" },
    ],
  },
  { label: "Reports", path: "/reports", icon: FiBarChart2 },
  {
    label: "Settings",
    icon: FiSettings,
    children: [
      { label: "Users", path: "/settings/users" },
      { label: "Activity Logs", path: "/settings/activity-logs" },
      { label: "Backup", path: "/settings/backup" },
      { label: "Language", path: "/settings/language" },
    ],
  },
];
