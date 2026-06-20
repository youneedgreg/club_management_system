import { index, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

import { pk, timestamps } from "./_shared";
import { clubs } from "./clubs";
import { memberRoleEnum } from "./enums";

/**
 * Maps a Neon Auth (Better Auth) user to a club with a role. This is the
 * authorization + multi-tenant source of truth: a user's `role` here gates
 * sensitive modules, and their membership determines which club's data they
 * see. `userId` is the opaque Better Auth user id (text, not UUID).
 *
 * The first user to sign up becomes the club `owner`; owners invite the rest.
 */
export const clubMembers = pgTable(
  "club_members",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    userId: text().notNull(),
    role: memberRoleEnum().notNull().default("cashier"),
    /** Cached email/name for member lists without round-tripping the auth API. */
    email: text(),
    displayName: text(),
    ...timestamps,
  },
  (t) => [
    unique("club_members_club_user_uniq").on(t.clubId, t.userId),
    index("club_members_user_idx").on(t.userId),
  ],
);
