import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const memories = pgTable("memories", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rssFeeds = pgTable("rss_feeds", {
  id: uuid("id").primaryKey(),
  url: text("url").notNull(),
  lastPolled: timestamp("last_polled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  due: timestamp("due"),
  priority: text("priority").default("medium"),
  notes: text("notes"),
  completed: timestamp("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  content: text("content").notNull(), // base64 encoded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  chatMessages: text("chat_messages").notNull(), // JSON stringified
  conversationItems: text("conversation_items").notNull(), // JSON stringified
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
