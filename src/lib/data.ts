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
  ],
};

export type AppData = typeof DATA;
