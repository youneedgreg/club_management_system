/**
 * Black Stars — realistic Nairobi nightclub dataset. All money in KES.
 *
 * Ported from the prototype `data.js`. This is the dev/seed dataset; Phase 3
 * replaces these reads with live database queries (the shapes here inform the
 * Drizzle schema).
 */
import type { PaymentMethod } from "@/types";

export interface HourPoint {
  h: string;
  v: number;
}
export interface CategoryAmount {
  key: string;
  v: number;
  label?: string;
}
export interface PaymentMixPoint {
  key: PaymentMethod;
  pct: number;
  v: number;
}
export interface Sale {
  t: string;
  loc: string;
  desc: string;
  pay: PaymentMethod;
  amt: number;
}
export interface TopSeller {
  name: string;
  cat: string;
  units: number;
  rev: number;
}
export interface StockItem {
  name: string;
  cat: string;
  unit: string;
  onHand: number;
  par: number;
  cost: number;
  sell: number;
  supplier: string;
  delivered: string;
}
export interface ExpenseItem {
  label: string;
  cat: string;
  amt: number;
  recurring: boolean;
  t: string;
}
export interface CreditCustomer {
  name: string;
  note: string;
  phone: string;
  bal: number;
  age: number;
  lastPaid: string;
}
export interface WeeklyPoint {
  day: string;
  rev: number;
  cost: number;
  closed?: boolean;
  label?: string;
  tonight?: boolean;
}
export interface MonthPoint {
  m: string;
  v: number;
  partial?: boolean;
}
/** A role key from `i18n.js` (`securityRole` avoids the `security` clash). */
export type Role =
  | "supervisor"
  | "cashier"
  | "bartender"
  | "waiter"
  | "securityRole"
  | "dj"
  | "mc"
  | "host";
export interface StaffMember {
  name: string;
  role: Role;
  wage: number;
  status: "present" | "absent";
  in: string | null;
  isFee?: boolean;
}
export interface StaffPermanentRow {
  name: string;
  role: Role;
  salary: number;
  nhif: number;
  nssf: number;
  paye: number;
  advance: number;
  status: "pending" | "paid";
}
export interface StaffCasualRow {
  name: string;
  role: Role;
  dailyRate: number;
  daysWorked: number;
  deduction: number;
  advance: number;
  posLinked: boolean;
  posSales: number;
  commissionPct: number;
}
export interface PosFeedRow {
  t: string;
  staff: string;
  table: string;
  amt: number;
  commission: number;
}
export interface Supplier {
  name: string;
  category: "drinks" | "food" | "utilities" | "services";
  owed: number;
  lastOrder: string;
  dueDate: string;
  terms: string;
  phone: string;
  age: number;
}
export interface LineupAct {
  name: string;
  role: "actDj" | "actMc" | "actHost";
  time: string;
  fee: number;
  paid: boolean;
  feeType?: "pct";
  pct?: number;
  guest?: boolean;
}
export interface LineupDay {
  day: string;
  date: string;
  closed?: boolean;
  label?: string;
  flagship?: boolean;
  acts?: LineupAct[];
}
export interface Lineup {
  range: string;
  days: LineupDay[];
}
export interface KitchenOrder {
  t: string;
  table: string;
  item: string;
  qty: number;
  amt: number;
  status: "preparing" | "served";
}
export interface Kitchen {
  incomeByCategory: CategoryAmount[];
  byHour: HourPoint[];
  orders: KitchenOrder[];
  expensesToday: ExpenseItem[];
  expenseByCategory: CategoryAmount[];
}

export const DATA = {
  meta: {
    club: "Black Stars",
    tagline: "Lounge & Nightclub",
    location: "Woodvale Grove, Westlands · Nairobi",
    owner: "Daniel",
    night: "Sat 14 Jun",
    open: "8:00 PM",
    close: "4:00 AM",
    currency: "KSh",
  },

  tonight: {
    doorEntries: 412,
    tablesOpen: 14,
    biggestSale: 19200,
    peakHour: "00:00",
  },

  byHour: [
    { h: "8pm", v: 18000 },
    { h: "9pm", v: 42000 },
    { h: "10pm", v: 88000 },
    { h: "11pm", v: 165000 },
    { h: "12am", v: 240000 },
    { h: "1am", v: 210000 },
    { h: "2am", v: 134000 },
    { h: "3am", v: 61000 },
  ] as HourPoint[],

  incomeByCategory: [
    { key: "spirits", v: 388000 },
    { key: "wine", v: 214000 },
    { key: "beer", v: 196000 },
    { key: "shisha", v: 69000 },
    { key: "soft", v: 53000 },
    { key: "door", v: 38000, label: "Door & cover" },
  ] as CategoryAmount[],

  paymentMix: [
    { key: "mpesa", pct: 62, v: 593960 },
    { key: "cash", pct: 23, v: 220340 },
    { key: "card", pct: 15, v: 143700 },
  ] as PaymentMixPoint[],

  sales: [
    { t: "02:14", loc: "Table 7", desc: "Hennessy VS + mixers", pay: "mpesa", amt: 16500 },
    { t: "02:02", loc: "Bar", desc: "4× Tusker Lager", pay: "cash", amt: 1400 },
    { t: "01:51", loc: "Table 3", desc: "Moët + 4× Red Bull", pay: "card", amt: 19200 },
    { t: "01:39", loc: "Bar", desc: "2× Shisha (Al Fakher)", pay: "mpesa", amt: 3000 },
    { t: "01:22", loc: "Table 12", desc: "JW Black + sodas", pay: "mpesa", amt: 10300 },
    { t: "01:08", loc: "Bar", desc: "6× Guinness", pay: "cash", amt: 2400 },
    { t: "00:55", loc: "Table 5", desc: "Jameson + Red Bull", pay: "mpesa", amt: 8700 },
    { t: "00:41", loc: "Door", desc: "8× entry / cover", pay: "mpesa", amt: 8000 },
    { t: "00:30", loc: "Bar", desc: "3× Smirnoff Ice", pay: "card", amt: 1200 },
    { t: "00:18", loc: "Table 9", desc: "Moët & Chandon", pay: "mpesa", amt: 18000 },
  ] as Sale[],

  topSellers: [
    { name: "Tusker Lager", cat: "beer", units: 142, rev: 49700 },
    { name: "Guinness", cat: "beer", units: 88, rev: 35200 },
    { name: "Red Bull", cat: "soft", units: 71, rev: 21300 },
    { name: "Shisha (Al Fakher)", cat: "shisha", units: 46, rev: 69000 },
    { name: "Moët & Chandon", cat: "wine", units: 9, rev: 162000 },
  ] as TopSeller[],

  stock: [
    {
      name: "Johnnie Walker Black 1L",
      cat: "spirits",
      unit: "btl",
      onHand: 6,
      par: 12,
      cost: 4200,
      sell: 9500,
      supplier: "Maxam Distributors",
      delivered: "10 Jun",
    },
    {
      name: "Jameson 1L",
      cat: "spirits",
      unit: "btl",
      onHand: 3,
      par: 10,
      cost: 3300,
      sell: 7500,
      supplier: "Maxam Distributors",
      delivered: "10 Jun",
    },
    {
      name: "Hennessy VS",
      cat: "spirits",
      unit: "btl",
      onHand: 2,
      par: 6,
      cost: 6800,
      sell: 14000,
      supplier: "Wines of the World",
      delivered: "6 Jun",
    },
    {
      name: "Smirnoff Vodka 1L",
      cat: "spirits",
      unit: "btl",
      onHand: 14,
      par: 12,
      cost: 1500,
      sell: 4500,
      supplier: "Kenya Breweries (EABL)",
      delivered: "13 Jun",
    },
    {
      name: "Gilbey's Gin 1L",
      cat: "spirits",
      unit: "btl",
      onHand: 9,
      par: 10,
      cost: 1400,
      sell: 4000,
      supplier: "Kenya Breweries (EABL)",
      delivered: "13 Jun",
    },
    {
      name: "Captain Morgan 1L",
      cat: "spirits",
      unit: "btl",
      onHand: 7,
      par: 8,
      cost: 1600,
      sell: 4200,
      supplier: "Kenya Breweries (EABL)",
      delivered: "13 Jun",
    },
    {
      name: "Tusker Lager",
      cat: "beer",
      unit: "crate",
      onHand: 11,
      par: 20,
      cost: 2800,
      sell: 350,
      supplier: "Kenya Breweries (EABL)",
      delivered: "13 Jun",
    },
    {
      name: "White Cap",
      cat: "beer",
      unit: "crate",
      onHand: 4,
      par: 15,
      cost: 2800,
      sell: 350,
      supplier: "Kenya Breweries (EABL)",
      delivered: "13 Jun",
    },
    {
      name: "Guinness",
      cat: "beer",
      unit: "crate",
      onHand: 6,
      par: 12,
      cost: 3200,
      sell: 400,
      supplier: "Kenya Breweries (EABL)",
      delivered: "13 Jun",
    },
    {
      name: "Heineken",
      cat: "beer",
      unit: "crate",
      onHand: 3,
      par: 10,
      cost: 3600,
      sell: 450,
      supplier: "Maxam Distributors",
      delivered: "10 Jun",
    },
    {
      name: "Smirnoff Ice",
      cat: "beer",
      unit: "crate",
      onHand: 8,
      par: 10,
      cost: 3000,
      sell: 400,
      supplier: "Kenya Breweries (EABL)",
      delivered: "13 Jun",
    },
    {
      name: "Moët & Chandon",
      cat: "wine",
      unit: "btl",
      onHand: 5,
      par: 8,
      cost: 9500,
      sell: 18000,
      supplier: "Wines of the World",
      delivered: "6 Jun",
    },
    {
      name: "4th Street Red",
      cat: "wine",
      unit: "btl",
      onHand: 18,
      par: 15,
      cost: 850,
      sell: 2500,
      supplier: "Naivas Wholesale",
      delivered: "12 Jun",
    },
    {
      name: "Coca-Cola",
      cat: "soft",
      unit: "crate",
      onHand: 9,
      par: 12,
      cost: 600,
      sell: 150,
      supplier: "Naivas Wholesale",
      delivered: "12 Jun",
    },
    {
      name: "Red Bull",
      cat: "soft",
      unit: "tray",
      onHand: 5,
      par: 8,
      cost: 2400,
      sell: 300,
      supplier: "Naivas Wholesale",
      delivered: "12 Jun",
    },
    {
      name: "Dasani Water",
      cat: "soft",
      unit: "crate",
      onHand: 14,
      par: 10,
      cost: 350,
      sell: 150,
      supplier: "Naivas Wholesale",
      delivered: "12 Jun",
    },
    {
      name: "Al Fakher Shisha",
      cat: "shisha",
      unit: "head",
      onHand: 22,
      par: 30,
      cost: 400,
      sell: 1500,
      supplier: "Maxam Distributors",
      delivered: "10 Jun",
    },
    {
      name: "Dunhill",
      cat: "cigarettes",
      unit: "pack",
      onHand: 7,
      par: 6,
      cost: 280,
      sell: 350,
      supplier: "Naivas Wholesale",
      delivered: "12 Jun",
    },
  ] as StockItem[],

  expensesTonight: [
    { label: "EABL weekly restock", cat: "suppliers", amt: 145000, recurring: true, t: "5:30 PM" },
    {
      label: "DJ Joe Mfalme — set fee",
      cat: "entertainment",
      amt: 35000,
      recurring: false,
      t: "7:00 PM",
    },
    { label: "Floor staff wages", cat: "wages", amt: 42000, recurring: true, t: "7:30 PM" },
    { label: "Securex bouncers (3)", cat: "security", amt: 18000, recurring: true, t: "7:30 PM" },
    { label: "KPLC power tokens", cat: "utilities", amt: 8000, recurring: false, t: "6:15 PM" },
    { label: "Cleaning & consumables", cat: "misc", amt: 6000, recurring: false, t: "6:00 PM" },
  ] as ExpenseItem[],

  expenseByCategory: [
    { key: "suppliers", v: 1850000 },
    { key: "wages", v: 720000 },
    { key: "entertainment", v: 480000 },
    { key: "rentLicense", v: 420000 },
    { key: "security", v: 320000 },
    { key: "utilities", v: 180000 },
    { key: "misc", v: 95000 },
  ] as CategoryAmount[],

  credit: [
    {
      name: "Hon. Kiprop",
      note: "Table 7 regular",
      phone: "+254 7•• ••• 412",
      bal: 48000,
      age: 3,
      lastPaid: "11 Jun",
    },
    {
      name: "Wachira Holdings",
      note: "Corporate booking",
      phone: "+254 7•• ••• 088",
      bal: 120000,
      age: 12,
      lastPaid: "2 Jun",
    },
    {
      name: "DJ Crème",
      note: "Artist tab",
      phone: "+254 7•• ••• 553",
      bal: 22500,
      age: 1,
      lastPaid: "13 Jun",
    },
    {
      name: "Sophie Atieno",
      note: "VIP booth",
      phone: "+254 7•• ••• 217",
      bal: 9000,
      age: 5,
      lastPaid: "9 Jun",
    },
    {
      name: "Brian — Westlands crew",
      note: "Friday regulars",
      phone: "+254 7•• ••• 765",
      bal: 65000,
      age: 21,
      lastPaid: "24 May",
    },
  ] as CreditCustomer[],

  weekly: [
    { day: "Mon", rev: 210000, cost: 120000 },
    { day: "Tue", rev: 0, cost: 15000, closed: true },
    { day: "Wed", rev: 340000, cost: 165000, label: "Ladies night" },
    { day: "Thu", rev: 420000, cost: 180000 },
    { day: "Fri", rev: 880000, cost: 240000 },
    { day: "Sat", rev: 958000, cost: 254000, tonight: true },
    { day: "Sun", rev: 0, cost: 0, closed: true },
  ] as WeeklyPoint[],

  monthly: [
    { m: "Jan", v: 14200000 },
    { m: "Feb", v: 12800000 },
    { m: "Mar", v: 15600000 },
    { m: "Apr", v: 16900000 },
    { m: "May", v: 18300000 },
    { m: "Jun", v: 11400000, partial: true },
  ] as MonthPoint[],

  // Staff roster tonight
  staff: [
    { name: "Faith Achieng", role: "supervisor", wage: 3500, status: "present", in: "7:45 PM" },
    { name: "Mercy Wanjiru", role: "cashier", wage: 2200, status: "present", in: "7:40 PM" },
    { name: "Brian Otieno", role: "bartender", wage: 2000, status: "present", in: "7:50 PM" },
    { name: "Kevin Kamau", role: "bartender", wage: 2000, status: "present", in: "8:05 PM" },
    { name: "Cynthia Njeri", role: "waiter", wage: 1500, status: "present", in: "8:10 PM" },
    { name: "Otieno Junior", role: "waiter", wage: 1500, status: "absent", in: null },
    { name: "James Mwangi", role: "securityRole", wage: 2500, status: "present", in: "7:30 PM" },
    { name: "Hassan Ali", role: "securityRole", wage: 2500, status: "present", in: "7:30 PM" },
    {
      name: "DJ Joe Mfalme",
      role: "dj",
      wage: 35000,
      status: "present",
      in: "9:30 PM",
      isFee: true,
    },
  ] as StaffMember[],

  // Permanent staff — monthly salary, statutory deductions, advances
  staffPermanent: [
    {
      name: "Faith Achieng",
      role: "supervisor",
      salary: 45000,
      nhif: 1700,
      nssf: 1080,
      paye: 4250,
      advance: 5000,
      status: "pending",
    },
    {
      name: "Mercy Wanjiru",
      role: "cashier",
      salary: 32000,
      nhif: 1700,
      nssf: 1080,
      paye: 2100,
      advance: 0,
      status: "paid",
    },
    {
      name: "Brian Otieno",
      role: "bartender",
      salary: 28000,
      nhif: 1700,
      nssf: 1080,
      paye: 1450,
      advance: 3000,
      status: "pending",
    },
    {
      name: "Kevin Kamau",
      role: "bartender",
      salary: 28000,
      nhif: 1700,
      nssf: 1080,
      paye: 1450,
      advance: 0,
      status: "paid",
    },
    {
      name: "James Mwangi",
      role: "securityRole",
      salary: 26000,
      nhif: 1700,
      nssf: 1080,
      paye: 1150,
      advance: 0,
      status: "paid",
    },
  ] as StaffPermanentRow[],

  // Casuals — daily wage, deductions, POS-linked commission
  staffCasuals: [
    {
      name: "Cynthia Njeri",
      role: "waiter",
      dailyRate: 1500,
      daysWorked: 5,
      deduction: 200,
      advance: 1000,
      posLinked: true,
      posSales: 86000,
      commissionPct: 1,
    },
    {
      name: "Otieno Junior",
      role: "waiter",
      dailyRate: 1500,
      daysWorked: 4,
      deduction: 200,
      advance: 0,
      posLinked: true,
      posSales: 52000,
      commissionPct: 1,
    },
    {
      name: "Hassan Ali",
      role: "securityRole",
      dailyRate: 1800,
      daysWorked: 6,
      deduction: 0,
      advance: 0,
      posLinked: false,
      posSales: 0,
      commissionPct: 0,
    },
    {
      name: "Grace Mwende",
      role: "bartender",
      dailyRate: 1700,
      daysWorked: 5,
      deduction: 200,
      advance: 2000,
      posLinked: true,
      posSales: 134000,
      commissionPct: 1.5,
    },
    {
      name: "Peter Omondi",
      role: "waiter",
      dailyRate: 1500,
      daysWorked: 3,
      deduction: 0,
      advance: 0,
      posLinked: true,
      posSales: 28000,
      commissionPct: 1,
    },
  ] as StaffCasualRow[],

  // Live POS feed — sample of sales auto-attributed to casual staff tonight
  posFeed: [
    { t: "02:14", staff: "Grace Mwende", table: "Table 7", amt: 16500, commission: 248 },
    { t: "01:51", staff: "Cynthia Njeri", table: "Table 3", amt: 19200, commission: 192 },
    { t: "01:22", staff: "Otieno Junior", table: "Table 12", amt: 10300, commission: 103 },
    { t: "00:55", staff: "Peter Omondi", table: "Table 5", amt: 8700, commission: 87 },
  ] as PosFeedRow[],

  // Suppliers — accounts payable (what Black Stars owes them)
  suppliers: [
    {
      name: "Kenya Breweries (EABL)",
      category: "drinks",
      owed: 145000,
      lastOrder: "13 Jun",
      dueDate: "20 Jun",
      terms: "7 days",
      phone: "+254 7•• ••• 100",
      age: 2,
    },
    {
      name: "Maxam Distributors",
      category: "drinks",
      owed: 86000,
      lastOrder: "10 Jun",
      dueDate: "17 Jun",
      terms: "7 days",
      phone: "+254 7•• ••• 220",
      age: 5,
    },
    {
      name: "Wines of the World",
      category: "drinks",
      owed: 54000,
      lastOrder: "6 Jun",
      dueDate: "13 Jun",
      terms: "7 days",
      phone: "+254 7•• ••• 330",
      age: 9,
    },
    {
      name: "Naivas Wholesale",
      category: "drinks",
      owed: 21000,
      lastOrder: "12 Jun",
      dueDate: "19 Jun",
      terms: "7 days",
      phone: "+254 7•• ••• 440",
      age: 3,
    },
    {
      name: "Greenspoon Fresh Produce",
      category: "food",
      owed: 38000,
      lastOrder: "14 Jun",
      dueDate: "21 Jun",
      terms: "7 days",
      phone: "+254 7•• ••• 550",
      age: 1,
    },
    {
      name: "Capwell Meats",
      category: "food",
      owed: 62000,
      lastOrder: "12 Jun",
      dueDate: "19 Jun",
      terms: "7 days",
      phone: "+254 7•• ••• 660",
      age: 3,
    },
    {
      name: "Pro Gas Kenya",
      category: "utilities",
      owed: 13000,
      lastOrder: "9 Jun",
      dueDate: "16 Jun",
      terms: "30 days",
      phone: "+254 7•• ••• 770",
      age: 6,
    },
    {
      name: "Securex Security Services",
      category: "services",
      owed: 18000,
      lastOrder: "1 Jun",
      dueDate: "15 Jun",
      terms: "Monthly",
      phone: "+254 7•• ••• 880",
      age: 14,
    },
  ] as Supplier[],

  // Next week's lineup — DJs / hosts / MCs and their fees
  lineup: {
    range: "15–21 Jun",
    days: [
      { day: "Mon", date: "15", closed: true },
      { day: "Tue", date: "16", closed: true },
      {
        day: "Wed",
        date: "17",
        label: "Ladies Night",
        acts: [
          { name: "DJ Pierra", role: "actDj", time: "10:00 PM", fee: 18000, paid: true },
          { name: "MC Jose", role: "actMc", time: "9:30 PM", fee: 8000, paid: true },
        ],
      },
      {
        day: "Thu",
        date: "18",
        label: "Throwback Thursday",
        acts: [
          { name: "DJ Crème", role: "actDj", time: "10:00 PM", fee: 22000, paid: false },
          { name: "DJ Stixx", role: "actDj", time: "8:30 PM", fee: 12000, paid: true },
        ],
      },
      {
        day: "Fri",
        date: "19",
        label: "Trap House",
        acts: [
          { name: "DJ Joe Mfalme", role: "actDj", time: "11:00 PM", fee: 35000, paid: false },
          { name: "DJ Lyttmal", role: "actDj", time: "9:00 PM", fee: 20000, paid: true },
          { name: "Sophie Atieno", role: "actHost", time: "10:00 PM", fee: 12000, paid: false },
        ],
      },
      {
        day: "Sat",
        date: "20",
        label: "Black Stars Saturday",
        flagship: true,
        acts: [
          { name: "DJ Joe Mfalme", role: "actDj", time: "12:00 AM", fee: 40000, paid: false },
          { name: "DJ Crème", role: "actDj", time: "10:30 PM", fee: 25000, paid: false },
          {
            name: "DJ Protégé",
            role: "actDj",
            time: "9:00 PM",
            feeType: "pct",
            pct: 15,
            fee: 0,
            paid: false,
            guest: true,
          },
          { name: "MC Fullstop", role: "actMc", time: "all night", fee: 10000, paid: false },
        ],
      },
      {
        day: "Sun",
        date: "21",
        label: "Sunday Rhumba",
        acts: [{ name: "DJ Stixx", role: "actDj", time: "7:00 PM", fee: 15000, paid: false }],
      },
    ],
  } as Lineup,

  // Kitchen — food side (income + expenses, separate from the bar)
  kitchen: {
    incomeByCategory: [
      { key: "grills", v: 86000 },
      { key: "mainCourse", v: 64000 },
      { key: "snacksSides", v: 38000 },
      { key: "soupsStews", v: 21000 },
      { key: "desserts", v: 9000 },
    ],
    byHour: [
      { h: "8pm", v: 6000 },
      { h: "9pm", v: 14000 },
      { h: "10pm", v: 27000 },
      { h: "11pm", v: 45000 },
      { h: "12am", v: 57000 },
      { h: "1am", v: 40000 },
      { h: "2am", v: 21000 },
      { h: "3am", v: 8000 },
    ],
    orders: [
      {
        t: "02:05",
        table: "Table 7",
        item: "Beef short ribs + fries",
        qty: 1,
        amt: 2800,
        status: "served",
      },
      {
        t: "01:48",
        table: "Table 3",
        item: "Grilled tilapia + ugali",
        qty: 2,
        amt: 3600,
        status: "served",
      },
      { t: "01:30", table: "Bar", item: "Loaded nachos", qty: 3, amt: 2700, status: "served" },
      {
        t: "01:10",
        table: "Table 12",
        item: "Chicken wings (1kg)",
        qty: 1,
        amt: 1800,
        status: "served",
      },
      {
        t: "00:52",
        table: "Table 9",
        item: "Beef samosas (6pc)",
        qty: 2,
        amt: 1200,
        status: "served",
      },
      {
        t: "00:35",
        table: "Table 5",
        item: "Pilau + beef stew",
        qty: 2,
        amt: 2400,
        status: "preparing",
      },
    ],
    expensesToday: [
      {
        label: "Meat & poultry — Capwell Meats",
        cat: "ingredients",
        amt: 32000,
        recurring: true,
        t: "3:00 PM",
      },
      {
        label: "Fresh produce — Greenspoon",
        cat: "ingredients",
        amt: 18000,
        recurring: false,
        t: "4:30 PM",
      },
      { label: "Cooking gas refill", cat: "gas", amt: 6500, recurring: false, t: "5:00 PM" },
      {
        label: "Kitchen staff wages",
        cat: "kitchenWages",
        amt: 12000,
        recurring: true,
        t: "7:30 PM",
      },
      { label: "Takeaway packaging", cat: "packaging", amt: 3200, recurring: false, t: "6:00 PM" },
    ],
    expenseByCategory: [
      { key: "ingredients", v: 620000 },
      { key: "kitchenWages", v: 240000 },
      { key: "gas", v: 48000 },
      { key: "packaging", v: 36000 },
      { key: "maintenance", v: 28000 },
    ],
  } as Kitchen,
};

export type AppData = typeof DATA;
