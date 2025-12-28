import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const memories = pgTable("memories", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
