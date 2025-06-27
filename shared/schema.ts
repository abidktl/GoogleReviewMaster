import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerInitials: text("customer_initials").notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  datePosted: timestamp("date_posted").notNull(),
  responseStatus: text("response_status", { enum: ["pending", "responded", "draft", "priority"] }).notNull().default("pending"),
  response: text("response"),
  responseDate: timestamp("response_date"),
  category: text("category").default("general"),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id).notNull(),
  content: text("content").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false).notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;

export type ReviewWithResponse = Review & {
  responses?: Response[];
};

export type DashboardStats = {
  totalReviews: number;
  pendingResponses: number;
  averageRating: number;
  responseRate: number;
  monthlyGrowth: {
    reviews: number;
    rating: number;
    responses: number;
  };
};
