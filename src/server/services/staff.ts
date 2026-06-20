import { and, asc, desc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { casualPay, permanentPay, sumBy } from "./calc";

const { staff, attendance, staffPermanent, staffCasuals, posAttributions } = schema;

// ----- Tonight roster -----

export async function getTonightRoster(clubId: string, businessDate: string) {
  const rows = await db
    .select({
      staffId: staff.id,
      name: staff.name,
      role: staff.role,
      status: attendance.status,
      clockIn: attendance.clockIn,
      wage: attendance.wage,
      isFee: attendance.isFee,
    })
    .from(attendance)
    .innerJoin(staff, eq(attendance.staffId, staff.id))
    .where(and(eq(staff.clubId, clubId), eq(attendance.businessDate, businessDate)))
    .orderBy(asc(staff.name));

  const present = rows.filter((r) => r.status === "present");
  return {
    rows,
    present,
    absent: rows.filter((r) => r.status === "absent"),
    presentCount: present.length,
    // Wage cost excludes flat-fee acts (the DJ), mirroring the prototype.
    wageCost: sumBy(
      present.filter((r) => !r.isFee),
      (r) => r.wage,
    ),
    djFee: rows.find((r) => r.isFee) ?? null,
  };
}

// ----- Permanent payroll -----

export async function getPermanentPayroll(clubId: string) {
  const rows = await db
    .select({ name: staff.name, role: staff.role, p: staffPermanent })
    .from(staffPermanent)
    .innerJoin(staff, eq(staffPermanent.staffId, staff.id))
    .where(eq(staff.clubId, clubId))
    .orderBy(asc(staff.name));

  const computed = rows.map(({ name, role, p }) => {
    const { deductions, net } = permanentPay(p);
    return {
      staffId: p.staffId,
      name,
      role,
      salary: p.salary,
      nhif: p.nhif,
      nssf: p.nssf,
      paye: p.paye,
      advance: p.advance,
      payStatus: p.payStatus,
      deductions,
      net,
    };
  });

  return {
    rows: computed,
    totalGross: sumBy(computed, (r) => r.salary),
    totalDeductions: sumBy(computed, (r) => r.deductions),
    totalAdvances: sumBy(computed, (r) => r.advance),
    totalNet: sumBy(computed, (r) => r.net),
  };
}

// ----- Casual payroll -----

export async function getCasualPayroll(clubId: string) {
  const rows = await db
    .select({ name: staff.name, role: staff.role, c: staffCasuals })
    .from(staffCasuals)
    .innerJoin(staff, eq(staffCasuals.staffId, staff.id))
    .where(eq(staff.clubId, clubId))
    .orderBy(asc(staff.name));

  const computed = rows.map(({ name, role, c }) => {
    const commissionPct = Number(c.commissionPct);
    const { base, commission, gross, net } = casualPay({
      dailyRate: c.dailyRate,
      daysWorked: c.daysWorked,
      deduction: c.deduction,
      advance: c.advance,
      posSales: c.posSales,
      commissionPct,
    });
    return {
      staffId: c.staffId,
      name,
      role,
      dailyRate: c.dailyRate,
      daysWorked: c.daysWorked,
      deduction: c.deduction,
      advance: c.advance,
      posLinked: c.posLinked,
      posSales: c.posSales,
      commissionPct,
      base,
      commission,
      gross,
      net,
    };
  });

  return {
    rows: computed,
    linkedCount: computed.filter((r) => r.posLinked).length,
    totalWageBill: sumBy(computed, (r) => r.gross),
    totalCommission: sumBy(computed, (r) => r.commission),
    totalDeductions: sumBy(computed, (r) => r.deduction + r.advance),
    totalNet: sumBy(computed, (r) => r.net),
  };
}

/** POS-linked casual staff as `{ id, name }` options (sale attribution). */
export function listSaleStaff(clubId: string) {
  return db
    .select({ id: staff.id, name: staff.name })
    .from(staffCasuals)
    .innerJoin(staff, eq(staffCasuals.staffId, staff.id))
    .where(and(eq(staff.clubId, clubId), eq(staffCasuals.posLinked, true)))
    .orderBy(asc(staff.name));
}

// ----- POS attribution feed -----

export function getPosFeed(clubId: string, businessDate: string) {
  return db
    .select({
      staffName: staff.name,
      occurredAt: posAttributions.occurredAt,
      location: posAttributions.location,
      amount: posAttributions.amount,
      commission: posAttributions.commission,
    })
    .from(posAttributions)
    .innerJoin(staff, eq(posAttributions.staffId, staff.id))
    .where(and(eq(posAttributions.clubId, clubId), eq(posAttributions.businessDate, businessDate)))
    .orderBy(desc(posAttributions.occurredAt));
}
