import { db } from "./db";
import { 
  users, subscriptionPlans, subscriptions, platforms, bots, trades, 
  notifications, payments, discountCodes, contactMessages, paymentSettings,
  type User, type InsertUser, type SubscriptionPlan, type InsertSubscriptionPlan,
  type Subscription, type InsertSubscription, type Platform, type InsertPlatform,
  type Bot, type InsertBot, type Trade, type InsertTrade, type Notification,
  type InsertNotification, type Payment, type InsertPayment, type DiscountCode,
  type InsertDiscountCode, type ContactMessage, type InsertContactMessage
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async toggleUserStatus(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ isActive: !user.isActive })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async toggleAdminRights(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ isAdmin: !user.isAdmin })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Subscription Plans
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  async updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updatedPlan] = await db.update(subscriptionPlans).set(plan).where(eq(subscriptionPlans.id, id)).returning();
    return updatedPlan;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    await db.update(subscriptionPlans).set({ isActive: false }).where(eq(subscriptionPlans.id, id));
    return true;
  }

  // Subscriptions
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db.update(subscriptions).set(subscription).where(eq(subscriptions.id, id)).returning();
    return updatedSubscription;
  }

  // Platforms
  async getUserPlatforms(userId: number): Promise<Platform[]> {
    return await db.select().from(platforms).where(eq(platforms.userId, userId));
  }

  async createPlatform(platform: InsertPlatform): Promise<Platform> {
    const [newPlatform] = await db.insert(platforms).values(platform).returning();
    return newPlatform;
  }

  async updatePlatform(id: number, platform: Partial<InsertPlatform>): Promise<Platform | undefined> {
    const [updatedPlatform] = await db.update(platforms).set(platform).where(eq(platforms.id, id)).returning();
    return updatedPlatform;
  }

  async deletePlatform(id: number): Promise<boolean> {
    await db.delete(platforms).where(eq(platforms.id, id));
    return true;
  }

  // Bots
  async getUserBots(userId: number): Promise<Bot[]> {
    return await db.select().from(bots).where(eq(bots.userId, userId));
  }

  async getBotsByPlatform(platformId: number): Promise<Bot[]> {
    return await db.select().from(bots).where(eq(bots.platformId, platformId));
  }

  async createBot(bot: InsertBot): Promise<Bot> {
    const [newBot] = await db.insert(bots).values(bot).returning();
    return newBot;
  }

  async updateBot(id: number, bot: Partial<InsertBot>): Promise<Bot | undefined> {
    const [updatedBot] = await db.update(bots).set(bot).where(eq(bots.id, id)).returning();
    return updatedBot;
  }

  // Trades
  async getUserTrades(userId: number, limit?: number): Promise<Trade[]> {
    let query = db.select().from(trades).where(eq(trades.userId, userId)).orderBy(desc(trades.executedAt));
    if (limit) {
      query = query.limit(limit) as any;
    }
    return await query;
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const [newTrade] = await db.insert(trades).values(trade).returning();
    return newTrade;
  }

  // Notifications
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    return true;
  }

  // Payments
  async getUserPayments(userId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return updatedPayment;
  }

  // Discount Codes
  async getDiscountCode(code: string): Promise<DiscountCode | undefined> {
    const [discountCode] = await db.select().from(discountCodes).where(and(eq(discountCodes.code, code), eq(discountCodes.isActive, true)));
    return discountCode;
  }

  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    return await db.select().from(discountCodes);
  }

  async createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode> {
    const [newDiscountCode] = await db.insert(discountCodes).values(discountCode).returning();
    return newDiscountCode;
  }

  async updateDiscountCode(id: number, discountCode: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined> {
    const [updatedDiscountCode] = await db.update(discountCodes).set(discountCode).where(eq(discountCodes.id, id)).returning();
    return updatedDiscountCode;
  }

  // Contact Messages
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async updateContactMessage(id: number, message: Partial<InsertContactMessage>): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await db.update(contactMessages).set(message).where(eq(contactMessages.id, id)).returning();
    return updatedMessage;
  }

  // Payment Settings
  async getPaymentSettings(): Promise<any> {
    const [settings] = await db.select().from(paymentSettings).orderBy(desc(paymentSettings.updatedAt)).limit(1);
    return settings?.settings || {};
  }

  async savePaymentSettings(settings: any): Promise<boolean> {
    try {
      // Delete old settings and insert new ones
      await db.delete(paymentSettings);
      await db.insert(paymentSettings).values({ settings });
      return true;
    } catch (error) {
      console.error('Error saving payment settings:', error);
      return false;
    }
  }

  // Admin Stats
  async getUserStats(): Promise<{
    totalUsers: number;
    activeSubscribers: number;
    monthlyRevenue: number;
    pendingPayments: number;
  }> {
    const totalUsers = await db.select().from(users);
    const activeSubscriptions = await db.select().from(subscriptions).where(eq(subscriptions.status, 'active'));
    const pendingPayments = await db.select().from(payments).where(eq(payments.status, 'pending'));
    
    // Calculate monthly revenue (simplified)
    const approvedPayments = await db.select().from(payments).where(eq(payments.status, 'approved'));
    const monthlyRevenue = approvedPayments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);

    return {
      totalUsers: totalUsers.length,
      activeSubscribers: activeSubscriptions.length,
      monthlyRevenue,
      pendingPayments: pendingPayments.length,
    };
  }
}