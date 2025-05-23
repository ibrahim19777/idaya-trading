import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  firebaseUid: text("firebase_uid").unique(),
  isAdmin: boolean("is_admin").default(false),
  hasUsedTrial: boolean("has_used_trial").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // 'Basic', 'Premium', 'Enterprise'
  nameAr: text("name_ar").notNull(), // 'أساسي', 'متميز', 'مؤسسات'
  planType: text("plan_type").notNull(), // 'basic', 'premium', 'enterprise'
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }).notNull(),
  maxPlatforms: integer("max_platforms").notNull(),
  features: jsonb("features").notNull(), // Array of features
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  plan: text("plan").notNull(), // 'basic', 'premium', 'enterprise'
  status: text("status").notNull(), // 'active', 'inactive', 'expired'
  billingCycle: text("billing_cycle").notNull(), // 'monthly', 'yearly'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
});

export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(), // 'binance', 'mt5', 'bybit'
  apiKey: text("api_key"),
  secretKey: text("secret_key"),
  serverInfo: text("server_info"), // for MT5
  isConnected: boolean("is_connected").default(false),
  connectionStatus: text("connection_status").default("disconnected"),
});

export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platformId: integer("platform_id").references(() => platforms.id).notNull(),
  strategy: text("strategy").notNull(), // 'low-risk', 'medium-risk', 'high-risk', 'islamic'
  isActive: boolean("is_active").default(false),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  dailyProfit: decimal("daily_profit", { precision: 10, scale: 2 }).default("0"),
  lastTrade: timestamp("last_trade"),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  botId: integer("bot_id").references(() => bots.id).notNull(),
  platform: text("platform").notNull(),
  pair: text("pair").notNull(),
  type: text("type").notNull(), // 'buy', 'sell'
  amount: decimal("amount", { precision: 15, scale: 8 }),
  entryPrice: decimal("entry_price", { precision: 15, scale: 8 }),
  exitPrice: decimal("exit_price", { precision: 15, scale: 8 }),
  profit: decimal("profit", { precision: 10, scale: 2 }),
  status: text("status").notNull(), // 'open', 'closed', 'cancelled'
  executedAt: timestamp("executed_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'profit', 'loss', 'system', 'market'
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // 'stripe', 'paypal', 'vodafone', 'bank'
  status: text("status").notNull(), // 'pending', 'approved', 'rejected'
  receiptUrl: text("receipt_url"),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount: integer("discount").notNull(), // percentage
  maxUses: integer("max_uses").default(100),
  currentUses: integer("current_uses").default(0),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'visa', 'paypal', 'instapay', 'vodafone_cash', 'bank_transfer'
  apiKey: text("api_key"),
  secretKey: text("secret_key"),
  phoneNumber: text("phone_number"),
  accountDetails: text("account_details"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentReceipts = pgTable("payment_receipts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  transactionId: text("transaction_id"),
  phoneNumber: text("phone_number"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"), // 'pending', 'replied', 'closed'
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow(),
  repliedAt: timestamp("replied_at"),
});

export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  settings: jsonb("settings").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  startDate: true,
});

export const insertPlatformSchema = createInsertSchema(platforms).omit({
  id: true,
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  executedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentReceiptSchema = createInsertSchema(paymentReceipts).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  repliedAt: true,
});

export const insertPaymentSettingsSchema = createInsertSchema(paymentSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;

export type Bot = typeof bots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type PaymentReceipt = typeof paymentReceipts.$inferSelect;
export type InsertPaymentReceipt = z.infer<typeof insertPaymentReceiptSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type InsertPaymentSettings = z.infer<typeof insertPaymentSettingsSchema>;
