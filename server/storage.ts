import { 
  users, subscriptionPlans, subscriptions, platforms, bots, trades, notifications, payments, discountCodes, contactMessages,
  type User, type InsertUser,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type Subscription, type InsertSubscription,
  type Platform, type InsertPlatform,
  type Bot, type InsertBot,
  type Trade, type InsertTrade,
  type Notification, type InsertNotification,
  type Payment, type InsertPayment,
  type DiscountCode, type InsertDiscountCode,
  type ContactMessage, type InsertContactMessage
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  toggleUserStatus(id: number): Promise<User | undefined>;
  toggleAdminRights(id: number): Promise<User | undefined>;
  
  // Subscription Plans
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
  
  // Subscriptions
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  
  // Platforms
  getUserPlatforms(userId: number): Promise<Platform[]>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: number, platform: Partial<InsertPlatform>): Promise<Platform | undefined>;
  deletePlatform(id: number): Promise<boolean>;
  
  // Bots
  getUserBots(userId: number): Promise<Bot[]>;
  getBotsByPlatform(platformId: number): Promise<Bot[]>;
  createBot(bot: InsertBot): Promise<Bot>;
  updateBot(id: number, bot: Partial<InsertBot>): Promise<Bot | undefined>;
  
  // Trades
  getUserTrades(userId: number, limit?: number): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  
  // Notifications
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Payments
  getUserPayments(userId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // Discount Codes
  getDiscountCode(code: string): Promise<DiscountCode | undefined>;
  getAllDiscountCodes(): Promise<DiscountCode[]>;
  createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: number, discountCode: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined>;
  
  // Contact Messages
  getAllContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, message: Partial<InsertContactMessage>): Promise<ContactMessage | undefined>;
  
  // Payment Settings
  getPaymentSettings(): Promise<any>;
  savePaymentSettings(settings: any): Promise<boolean>;
  
  // Admin
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeSubscribers: number;
    monthlyRevenue: number;
    pendingPayments: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private subscriptionPlans: Map<number, SubscriptionPlan> = new Map();
  private subscriptions: Map<number, Subscription> = new Map();
  private platforms: Map<number, Platform> = new Map();
  private bots: Map<number, Bot> = new Map();
  private trades: Map<number, Trade> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private payments: Map<number, Payment> = new Map();
  private discountCodes: Map<number, DiscountCode> = new Map();
  private contactMessages: Map<number, ContactMessage> = new Map();
  private paymentSettings: any = {
    vodafone: {
      enabled: true,
      number: '01115000273',
      instructions: 'اتصل بـ *9*رقم المحفظة*المبلغ# أو حول المبلغ للرقم المذكور',
      name: 'فودافون كاش'
    },
    instapay: {
      enabled: true,
      number: '01115000273',
      instructions: 'حول المبلغ للرقم المذكور عبر انستاباي وارفق لقطة شاشة',
      name: 'انستاباي'
    },
    bank: {
      enabled: true,
      bankName: 'البنك الأهلي المصري',
      accountNumber: '1234567890123',
      accountName: 'شركة إداية للتقنية',
      swiftCode: 'NBEGEGCX',
      instructions: 'قم بالتحويل للحساب المذكور وارفق إيصال التحويل'
    },
    stripe: { enabled: false, publicKey: '' },
    paypal: { enabled: false, clientId: '' },
    supportEmail: 'support@idaya.com',
    whatsapp: '01115000273',
    location: 'القاهرة، مصر',
    workingHours: {
      weekdays: '9:00 ص - 6:00 م',
      weekends: '10:00 ص - 4:00 م'
    },
    tax: {
      enabled: false,
      rate: 14,
      name: 'ضريبة القيمة المضافة',
      description: 'سيتم إضافة الضريبة للمبلغ الإجمالي'
    }
  };
  
  private currentId = 1;

  constructor() {
    // Initialize subscription plans and discount codes
    this.initializeSubscriptionPlans();
    this.initializeDiscountCodes();
  }

  private initializeSubscriptionPlans() {
    const plans: SubscriptionPlan[] = [
      {
        id: this.currentId++,
        name: "Trial",
        nameAr: "تجريبي",
        planType: "trial",
        monthlyPrice: "0.00",
        yearlyPrice: "0.00",
        maxPlatforms: 1,
        features: ["5 أيام مجاناً", "1 منصة تداول فقط", "استراتيجية المخاطرة المنخفضة", "تنبيهات أساسية"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        name: "Basic",
        nameAr: "أساسي",
        planType: "basic",
        monthlyPrice: "99.00",
        yearlyPrice: "999.00",
        maxPlatforms: 1,
        features: ["1 منصة تداول", "استراتيجية المخاطرة المنخفضة", "تنبيهات أساسية", "دعم فني"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        name: "Premium",
        nameAr: "متميز",
        planType: "premium",
        monthlyPrice: "199.00",
        yearlyPrice: "1999.00",
        maxPlatforms: 3,
        features: ["3 منصات تداول", "جميع الاستراتيجيات", "تنبيهات ذكية", "تحليلات متقدمة", "دعم أولوية"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        name: "Enterprise",
        nameAr: "مؤسسات",
        planType: "enterprise",
        monthlyPrice: "399.00",
        yearlyPrice: "3999.00",
        maxPlatforms: 999,
        features: ["منصات غير محدودة", "جميع الاستراتيجيات", "تنبيهات فورية", "تحليلات شاملة", "دعم 24/7", "API مخصص"],
        isActive: true,
        createdAt: new Date(),
      }
    ];
    
    plans.forEach(plan => {
      this.subscriptionPlans.set(plan.id, plan);
    });
  }

  private initializeDiscountCodes() {
    const codes: DiscountCode[] = [
      {
        id: this.currentId++,
        code: "WELCOME50",
        discount: 50,
        isActive: true,
        maxUses: 100,
        currentUses: 0,
        expiryDate: new Date('2025-12-31'),
      },
      {
        id: this.currentId++,
        code: "NEWUSER25", 
        discount: 25,
        isActive: true,
        maxUses: 50,
        currentUses: 0,
        expiryDate: new Date('2025-06-30'),
      }
    ];

    codes.forEach(code => {
      this.discountCodes.set(code.id, code);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      // جعل ibrahim19777@me.com أدمن تلقائياً مع حماية كاملة
      isAdmin: insertUser.email === 'ibrahim19777@me.com' ? true : insertUser.isAdmin,
      isActive: insertUser.email === 'ibrahim19777@me.com' ? true : insertUser.isActive
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateUser };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    // حماية الأدمن الرئيسي من الحذف
    const user = this.users.get(id);
    if (user?.email === 'ibrahim19777@me.com') {
      return false; // منع حذف الأدمن الرئيسي
    }
    return this.users.delete(id);
  }

  async toggleUserStatus(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    // حماية الأدمن الرئيسي من التعطيل
    if (user.email === 'ibrahim19777@me.com') {
      return user; // إرجاع المستخدم بدون تغيير
    }
    
    const updatedUser = { ...user, isActive: !user.isActive };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async toggleAdminRights(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    // حماية الأدمن الرئيسي من إزالة الصلاحيات
    if (user.email === 'ibrahim19777@me.com') {
      return user; // إرجاع المستخدم بدون تغيير صلاحيات الإدارة
    }
    
    const updatedUser = { ...user, isAdmin: !user.isAdmin };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Subscription Plans
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values()).filter(plan => plan.isActive);
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentId++;
    const plan: SubscriptionPlan = {
      ...insertPlan,
      id,
      createdAt: new Date(),
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  async updateSubscriptionPlan(id: number, updatePlan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const plan = this.subscriptionPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updatePlan };
    this.subscriptionPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    return this.subscriptionPlans.delete(id);
  }

  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    // تحقق من أن المستخدم أدمن
    const user = this.users.get(userId);
    if (user?.isAdmin) {
      // إرجاع اشتراك افتراضي دائم للأدمن
      return {
        id: -1,
        userId: userId,
        planId: 3, // Enterprise Plan
        plan: 'enterprise',
        status: 'active',
        billingCycle: 'yearly',
        amount: '0',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2030-12-31'),
        autoRenew: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    return Array.from(this.subscriptions.values()).find(sub => sub.userId === userId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentId++;
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      startDate: new Date(),
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, updateSubscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updated = { ...subscription, ...updateSubscription };
    this.subscriptions.set(id, updated);
    return updated;
  }

  async getUserPlatforms(userId: number): Promise<Platform[]> {
    return Array.from(this.platforms.values()).filter(platform => platform.userId === userId);
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    // تحقق من وجود منصة مماثلة للمستخدم
    const existing = Array.from(this.platforms.values()).find(
      p => p.userId === insertPlatform.userId && p.platform === insertPlatform.platform
    );
    
    if (existing) {
      // إذا وجدت، حدثها
      return await this.updatePlatform(existing.id, insertPlatform) || existing;
    }
    
    const id = this.currentId++;
    const platform: Platform = {
      ...insertPlatform,
      id,
    };
    this.platforms.set(id, platform);
    return platform;
  }

  async updatePlatform(id: number, updatePlatform: Partial<InsertPlatform>): Promise<Platform | undefined> {
    const platform = this.platforms.get(id);
    if (!platform) return undefined;
    
    const updated = { ...platform, ...updatePlatform };
    this.platforms.set(id, updated);
    return updated;
  }

  async deletePlatform(id: number): Promise<boolean> {
    return this.platforms.delete(id);
  }

  async getUserBots(userId: number): Promise<Bot[]> {
    return Array.from(this.bots.values()).filter(bot => bot.userId === userId);
  }

  async getBotsByPlatform(platformId: number): Promise<Bot[]> {
    return Array.from(this.bots.values()).filter(bot => bot.platformId === platformId);
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const id = this.currentId++;
    const bot: Bot = {
      ...insertBot,
      id,
    };
    this.bots.set(id, bot);
    return bot;
  }

  async updateBot(id: number, updateBot: Partial<InsertBot>): Promise<Bot | undefined> {
    const bot = this.bots.get(id);
    if (!bot) return undefined;
    
    const updated = { ...bot, ...updateBot };
    this.bots.set(id, updated);
    return updated;
  }

  async getUserTrades(userId: number, limit?: number): Promise<Trade[]> {
    const userTrades = Array.from(this.trades.values())
      .filter(trade => trade.userId === userId)
      .sort((a, b) => b.executedAt!.getTime() - a.executedAt!.getTime());
    
    return limit ? userTrades.slice(0, limit) : userTrades;
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = this.currentId++;
    const trade: Trade = {
      ...insertTrade,
      id,
      executedAt: new Date(),
    };
    this.trades.set(id, trade);
    return trade;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentId++;
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentId++;
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: number, updatePayment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updated = { ...payment, ...updatePayment };
    this.payments.set(id, updated);
    return updated;
  }

  async getDiscountCode(code: string): Promise<DiscountCode | undefined> {
    return Array.from(this.discountCodes.values()).find(dc => dc.code === code);
  }

  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    return Array.from(this.discountCodes.values());
  }

  async createDiscountCode(insertDiscountCode: InsertDiscountCode): Promise<DiscountCode> {
    const id = this.currentId++;
    const discountCode: DiscountCode = {
      ...insertDiscountCode,
      id,
    };
    this.discountCodes.set(id, discountCode);
    return discountCode;
  }

  async updateDiscountCode(id: number, updateDiscountCode: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined> {
    const discountCode = this.discountCodes.get(id);
    if (!discountCode) return undefined;
    
    const updated = { ...discountCode, ...updateDiscountCode };
    this.discountCodes.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeSubscribers: number;
    monthlyRevenue: number;
    pendingPayments: number;
  }> {
    const totalUsers = this.users.size;
    const activeSubscribers = Array.from(this.subscriptions.values())
      .filter(sub => sub.status === 'active').length;
    const monthlyRevenue = Array.from(this.subscriptions.values())
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + parseFloat(sub.amount || '0'), 0);
    const pendingPayments = Array.from(this.payments.values())
      .filter(payment => payment.status === 'pending').length;

    return {
      totalUsers,
      activeSubscribers,
      monthlyRevenue,
      pendingPayments,
    };
  }

  // Contact Messages
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.currentId++;
    const message: ContactMessage = {
      id,
      ...insertMessage,
      status: 'pending',
      adminReply: null,
      createdAt: new Date(),
      repliedAt: null,
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async updateContactMessage(id: number, updateMessage: Partial<InsertContactMessage>): Promise<ContactMessage | undefined> {
    const message = this.contactMessages.get(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, ...updateMessage };
    if (updateMessage.adminReply) {
      updatedMessage.repliedAt = new Date();
      updatedMessage.status = 'replied';
    }
    
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Payment Settings
  async getPaymentSettings(): Promise<any> {
    return this.paymentSettings;
  }

  async savePaymentSettings(settings: any): Promise<boolean> {
    console.log('💾 حفظ إعدادات الدفع:', settings);
    // دمج عميق للإعدادات للحفاظ على البيانات المحفوظة مسبقاً
    this.paymentSettings = {
      ...this.paymentSettings,
      ...settings,
      // التأكد من عدم فقدان البيانات المهمة
      vodafone: { ...this.paymentSettings.vodafone, ...(settings.vodafone || {}) },
      instapay: { ...this.paymentSettings.instapay, ...(settings.instapay || {}) },
      bank: { ...this.paymentSettings.bank, ...(settings.bank || {}) },
      tax: { ...this.paymentSettings.tax, ...(settings.tax || {}) },
      workingHours: { ...this.paymentSettings.workingHours, ...(settings.workingHours || {}) }
    };
    console.log('✅ تم حفظ الإعدادات:', this.paymentSettings);
    return true;
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
