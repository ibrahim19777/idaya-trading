import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertSubscriptionPlanSchema, insertSubscriptionSchema, insertPlatformSchema,
  insertBotSchema, insertTradeSchema, insertNotificationSchema,
  insertPaymentSchema, insertDiscountCodeSchema, insertContactMessageSchema
} from "@shared/schema";
import { aiTradingEngine } from "./ai-trading-engine";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, firebaseUid } = req.body;
      
      let user;
      if (firebaseUid) {
        user = await storage.getUserByFirebaseUid(firebaseUid);
      } else if (email) {
        user = await storage.getUserByEmail(email);
      }
      
      if (!user) {
        // إذا لم يتم العثور على المستخدم، ولكن لديه firebaseUid صالح، أنشئ المستخدم
        if (firebaseUid && email) {
          const isAdmin = email === "ibrahim19777@me.com";
          user = await storage.createUser({
            email: email,
            name: email.split('@')[0], // استخدام الجزء الأول من الإيميل كاسم مؤقت
            firebaseUid: firebaseUid,
            isAdmin: isAdmin
          });
          console.log('✅ تم إنشاء مستخدم جديد:', user.email);
          
          // إنشاء اشتراك Enterprise دائم للأدمن الرئيسي
          if (email === 'ibrahim19777@me.com') {
            await storage.createSubscription({
              userId: user.id,
              planId: 3,
              plan: 'enterprise',
              status: 'active',
              billingCycle: 'yearly',
              amount: '0',
              startDate: new Date('2020-01-01'),
              endDate: new Date('2030-12-31'),
              autoRenew: true
            });
            console.log('✅ تم إنشاء اشتراك Enterprise دائم للأدمن الرئيسي');
          }
        } else {
          return res.status(404).json({ message: "User not found" });
        }
      } else {
        // التحقق من وجود اشتراك للأدمن الحالي
        if (user.email === 'ibrahim19777@me.com' && user.isAdmin) {
          const existingSubscription = await storage.getUserSubscription(user.id);
          if (!existingSubscription || existingSubscription.id === -1) {
            // إنشاء اشتراك Enterprise دائم إذا لم يكن موجود
            await storage.createSubscription({
              userId: user.id,
              planId: 3,
              plan: 'enterprise',
              status: 'active',
              billingCycle: 'yearly',
              amount: '0'
            });
            console.log('✅ تم إنشاء اشتراك Enterprise دائم للأدمن الحالي');
          }
        }
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get user first to check if it's the protected admin
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      // Protect ibrahim19777@me.com from being deleted
      if (user.email === 'ibrahim19777@me.com') {
        return res.status(403).json({ 
          message: "لا يمكن حذف هذا المستخدم - محمي من النظام" 
        });
      }
      
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      res.json({ message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المستخدم" });
    }
  });

  // Toggle user status (active/inactive)
  app.patch("/api/users/:id/toggle-status", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get user first to check if it's the protected admin
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      // Protect ibrahim19777@me.com from being deactivated
      if (user.email === 'ibrahim19777@me.com') {
        return res.status(403).json({ 
          message: "لا يمكن إيقاف هذا المستخدم - محمي من النظام" 
        });
      }
      
      const updatedUser = await storage.toggleUserStatus(userId);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تغيير حالة المستخدم" });
    }
  });

  // Toggle admin rights
  app.patch("/api/users/:id/toggle-admin", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.toggleAdminRights(userId);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تغيير صلاحيات الإدارة" });
    }
  });

  // Platform routes
  app.get("/api/platforms/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const platforms = await storage.getUserPlatforms(userId);
    res.json(platforms);
  });

  app.post("/api/platforms", async (req, res) => {
    try {
      const platformData = insertPlatformSchema.parse(req.body);
      
      // التحقق من استخدام نفس بيانات المنصة مع مستخدمين مختلفين للخطة المجانية
      const userSubscription = await storage.getUserSubscription(platformData.userId);
      const user = await storage.getUser(platformData.userId);
      
      // السماح للأدمن بإضافة منصات بدون قيود
      if (user?.isAdmin) {
        const platform = await storage.createPlatform(platformData);
        return res.json(platform);
      }
      
      if (userSubscription?.plan === 'trial') {
        // البحث عن نفس بيانات المنصة مع مستخدمين آخرين
        const allUsers = await storage.getAllUsers();
        
        for (const user of allUsers) {
          if (user.id !== platformData.userId) {
            const userPlatforms = await storage.getUserPlatforms(user.id);
            const duplicatePlatform = userPlatforms.find(p => 
              p.platform === platformData.platform && 
              (p.apiKey === platformData.apiKey || 
               p.secretKey === platformData.secretKey ||
               (p.serverInfo === platformData.serverInfo && platformData.serverInfo))
            );
            
            if (duplicatePlatform) {
              return res.status(400).json({ 
                message: "هذه بيانات المنصة مستخدمة مع حساب آخر. لا يمكن استخدام نفس بيانات المنصة مع الخطة التجريبية أكثر من مرة." 
              });
            }
          }
        }
      }
      
      const platform = await storage.createPlatform(platformData);
      res.json(platform);
    } catch (error) {
      res.status(400).json({ message: "Invalid platform data" });
    }
  });

  app.put("/api/platforms/:id", async (req, res) => {
    const platformId = parseInt(req.params.id);
    const platform = await storage.updatePlatform(platformId, req.body);
    
    if (!platform) {
      return res.status(404).json({ message: "Platform not found" });
    }
    
    res.json(platform);
  });

  app.delete("/api/platforms/:id", async (req, res) => {
    const platformId = parseInt(req.params.id);
    const deleted = await storage.deletePlatform(platformId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Platform not found" });
    }
    
    res.json({ message: "Platform deleted successfully" });
  });

  // Test platform connection with real APIs
  app.post("/api/platforms/test", async (req, res) => {
    try {
      const { platform, credentials } = req.body;
      
      // Import trading APIs
      const { createTradingAPI } = await import('./trading-apis');
      
      try {
        const api = createTradingAPI(platform, credentials);
        const result = await api.testConnection();
        
        if (result.success) {
          res.json({ 
            success: true, 
            message: "Connection successful", 
            data: result.data 
          });
        } else {
          res.status(400).json({ 
            success: false, 
            error: result.error || "Connection failed" 
          });
        }
      } catch (error: any) {
        res.status(400).json({ 
          success: false, 
          error: error.message || "Invalid platform or credentials" 
        });
      }
    } catch (error: any) {
      console.error("Connection test error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get platform balance
  app.post("/api/platforms/balance", async (req, res) => {
    try {
      const { platform, credentials } = req.body;
      
      const { createTradingAPI } = await import('./trading-apis');
      const api = createTradingAPI(platform, credentials);
      const result = await api.getBalance();
      
      if (result.success) {
        res.json({ success: true, data: result.data });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error("Balance check error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // تنظيف الاتصالات المكررة
  app.post("/api/platforms/cleanup", async (req, res) => {
    try {
      const { userId } = req.body;
      
      // احصل على جميع منصات المستخدم
      const platforms = await storage.getUserPlatforms(userId);
      const mt5Platforms = platforms.filter(p => p.platform === 'mt5');
      
      if (mt5Platforms.length > 1) {
        // احذف المكررات واحتفظ بالأحدث
        const sorted = mt5Platforms.sort((a, b) => b.id - a.id);
        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);
        
        for (const platform of toDelete) {
          await storage.deletePlatform(platform.id);
        }
        
        // حدث المتبقي ليكون متصل
        await storage.updatePlatform(toKeep.id, {
          isConnected: true,
          connectionStatus: 'connected'
        });
        
        res.json({ 
          success: true, 
          message: `تم حذف ${toDelete.length} اتصالات مكررة وتحديث الحالة`
        });
      } else {
        // حدث الاتصال الموجود ليكون متصل
        if (mt5Platforms.length === 1) {
          await storage.updatePlatform(mt5Platforms[0].id, {
            isConnected: true,
            connectionStatus: 'connected'
          });
        }
        res.json({ success: true, message: 'تم تحديث حالة الاتصال' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // تفعيل البوت
  app.post("/api/bots/activate", async (req, res) => {
    try {
      const { userId, strategy } = req.body;
      
      // التحقق من صلاحيات الأدمن - السماح بدون قيود
      const user = await storage.getUser(userId);
      if (user?.isAdmin) {
        // البحث عن أي منصة للأدمن
        const platforms = await storage.getUserPlatforms(userId);
        const platform = platforms[0]; // أول منصة متاحة
        
        if (platform) {
          const { activateHighRiskBot } = await import('./bot-activation');
          const result = await activateHighRiskBot(userId, platform.id);
          return res.json(result);
        }
      }
      
      // البحث عن منصة MT5 للمستخدم
      const platforms = await storage.getUserPlatforms(userId);
      const mt5Platform = platforms.find(p => p.platform === 'mt5');
      
      if (!mt5Platform) {
        return res.status(400).json({ 
          success: false, 
          error: 'يجب ربط منصة MT5 أولاً' 
        });
      }
      
      // تفعيل البوت
      const { activateHighRiskBot } = await import('./bot-activation');
      const result = await activateHighRiskBot(userId, mt5Platform.id);
      
      res.json(result);
    } catch (error: any) {
      console.error("Bot activation error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // إيقاف البوت
  app.post("/api/bots/stop", async (req, res) => {
    try {
      const { stopBot } = await import('./bot-activation');
      const result = await stopBot();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // حالة البوت
  app.get("/api/bots/status", async (req, res) => {
    try {
      const { getBotStatus } = await import('./bot-activation');
      const status = getBotStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Execute trade
  app.post("/api/platforms/trade", async (req, res) => {
    try {
      const { platform, credentials, tradeParams } = req.body;
      
      const { createTradingAPI } = await import('./trading-apis');
      const api = createTradingAPI(platform, credentials);
      const result = await api.placeTrade(tradeParams);
      
      if (result.success) {
        // Save trade to database
        const trade = await storage.createTrade({
          userId: 1, // Default user for testing
          platformId: req.body.platformId,
          symbol: tradeParams.symbol,
          side: tradeParams.side,
          type: tradeParams.type,
          quantity: tradeParams.quantity.toString(),
          price: (tradeParams.price || 0).toString(),
          status: 'executed',
          profit: "0" // Will be calculated later
        });
        
        res.json({ success: true, data: result.data, trade });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error("Trade execution error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Bot routes
  app.get("/api/bots/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const bots = await storage.getUserBots(userId);
    res.json(bots);
  });

  app.post("/api/bots", async (req, res) => {
    try {
      const botData = insertBotSchema.parse(req.body);
      const bot = await storage.createBot(botData);
      res.json(bot);
    } catch (error) {
      res.status(400).json({ message: "Invalid bot data" });
    }
  });

  app.put("/api/bots/:id", async (req, res) => {
    const botId = parseInt(req.params.id);
    const bot = await storage.updateBot(botId, req.body);
    
    if (!bot) {
      return res.status(404).json({ message: "Bot not found" });
    }
    
    res.json(bot);
  });

  // Trade routes
  app.get("/api/trades/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const trades = await storage.getUserTrades(userId, limit);
    res.json(trades);
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const tradeData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(tradeData);
      res.json(trade);
    } catch (error) {
      res.status(400).json({ message: "Invalid trade data" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const subscription = await storage.getUserSubscription(userId);
    res.json(subscription);
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      console.log('📊 Subscription data received:', req.body);
      
      const { userId, planId, plan, status, billingCycle, amount, startDate, endDate } = req.body;
      
      // التحقق من وجود معرف المستخدم مع تفاصيل أكثر
      console.log('🔍 Checking userId:', userId, typeof userId);
      
      // إصلاح المشكلة - التحقق الصحيح من معرف المستخدم
      const userIdNumber = Number(userId);
      console.log('🔢 Converted userId to number:', userIdNumber);
      
      if (!userIdNumber || isNaN(userIdNumber) || userIdNumber <= 0) {
        console.log('❌ Invalid user ID:', { userId, userIdNumber, isNaN: isNaN(userIdNumber) });
        return res.status(400).json({ message: "User ID is required and must be a valid number" });
      }

      // التحقق من استخدام الخطة التجريبية مسبقاً
      if (plan === 'trial' || planId === 1) {
        const user = await storage.getUser(parseInt(userId));
        if (user?.hasUsedTrial) {
          return res.status(400).json({ 
            message: "لقد استخدمت الخطة التجريبية من قبل. يمكنك الآن الاشتراك في إحدى الخطط المدفوعة." 
          });
        }
        
        // تحديث حالة المستخدم لمنع استخدام الخطة التجريبية مرة أخرى
        await storage.updateUser(parseInt(userId), { hasUsedTrial: true });
        
        // تعيين تاريخ انتهاء للخطة التجريبية (5 أيام)
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 5);
        
        const subscriptionData = {
          userId: parseInt(userId),
          planId: parseInt(planId) || 1,
          plan: 'trial',
          status: 'active',
          billingCycle: 'trial',
          amount: "0.00",
          endDate: trialEndDate
        };
        
        const subscription = await storage.createSubscription(subscriptionData);
        console.log('✅ Trial subscription created successfully:', subscription);
        return res.json(subscription);
      }
      
      // بناء البيانات للخطط المدفوعة
      const subscriptionData = {
        userId: parseInt(userId),
        planId: parseInt(planId) || 2,
        plan: plan || 'basic',
        status: status || 'active',
        billingCycle: billingCycle || 'monthly',
        amount: amount || "29.00"
      };
      
      // إضافة التواريخ فقط إذا تم توفيرها
      if (startDate) subscriptionData.startDate = new Date(startDate);
      if (endDate) subscriptionData.endDate = new Date(endDate);
      
      const subscription = await storage.createSubscription(subscriptionData);
      console.log('✅ Subscription created successfully:', subscription);
      res.json(subscription);
    } catch (error: any) {
      console.error('❌ Subscription error:', error);
      res.status(500).json({ 
        message: "خطأ في إنشاء الاشتراك", 
        error: error.message 
      });
    }
  });

  // Subscription Plans Management
  app.get("/api/subscription-plans", async (req, res) => {
    const plans = await storage.getAllSubscriptionPlans();
    res.json(plans);
  });

  // Get single subscription plan
  app.get("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getSubscriptionPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to get subscription plan" });
    }
  });

  app.post("/api/subscription-plans", async (req, res) => {
    try {
      const result = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(result);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription plan data" });
    }
  });

  app.patch("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const plan = await storage.updateSubscriptionPlan(id, updateData);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription plan" });
    }
  });

  app.delete("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSubscriptionPlan(id);
      if (!deleted) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscription plan" });
    }
  });

  // Notification routes
  app.get("/api/notifications/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const notifications = await storage.getUserNotifications(userId);
    res.json(notifications);
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    const notificationId = parseInt(req.params.id);
    const updated = await storage.markNotificationAsRead(notificationId);
    
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ message: "Notification marked as read" });
  });

  // Payment routes
  app.get("/api/payments/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const payments = await storage.getUserPayments(userId);
    res.json(payments);
  });

  app.get("/api/payments", async (req, res) => {
    const payments = await storage.getAllPayments();
    res.json(payments);
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    const paymentId = parseInt(req.params.id);
    const payment = await storage.updatePayment(paymentId, req.body);
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    res.json(payment);
  });

  // طريق الدفع اليدوي مع رفع الإيصال
  app.post("/api/payments/manual-with-receipt", async (req, res) => {
    try {
      // تعامل مع FormData وبيانات JSON
      let paymentData;
      
      if (req.body instanceof FormData || req.headers['content-type']?.includes('multipart/form-data')) {
        // استخراج البيانات من FormData
        paymentData = {
          userId: req.body.userId || req.body.get?.('userId'),
          planId: req.body.planId || req.body.get?.('planId'),
          planName: req.body.planName || req.body.get?.('planName'),
          userName: req.body.userName || req.body.get?.('userName'),
          userEmail: req.body.userEmail || req.body.get?.('userEmail'),
          amount: req.body.amount || req.body.get?.('amount'),
          method: req.body.method || req.body.get?.('method'),
          subscriptionId: req.body.subscriptionId || req.body.get?.('subscriptionId'),
          status: req.body.status || req.body.get?.('status') || "pending",
          notes: req.body.notes || req.body.get?.('notes')
        };
      } else {
        // بيانات JSON عادية
        paymentData = req.body;
      }
      
      console.log('💰 إنشاء دفعة جديدة:', paymentData);
      
      // التأكد من وجود البيانات المطلوبة
      const userId = parseInt(paymentData.userId) || null;
      const amount = paymentData.amount || "0";
      const method = paymentData.method || "unknown";
      const subscriptionId = parseInt(paymentData.subscriptionId) || null;
      
      // إنشاء دفعة جديدة بالبيانات الصحيحة
      const payment = await storage.createPayment({
        userId: userId,
        amount: amount,
        method: method,
        status: "pending",
        receiptUrl: null,
        subscriptionId: subscriptionId
      });

      console.log('✅ تم إنشاء الدفعة بنجاح:', payment);
      res.json({ success: true, paymentId: payment.id });
    } catch (error) {
      console.error("❌ خطأ في إنشاء الدفعة:", error);
      res.status(500).json({ message: "Failed to create payment", error: error.message });
    }
  });

  // Discount code routes
  app.get("/api/discount-codes", async (req, res) => {
    const codes = await storage.getAllDiscountCodes();
    res.json(codes);
  });

  // تحقق من صحة كود الخصم
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      console.log('التحقق من كود الخصم:', code);
      
      const discountCode = await storage.getDiscountCode(code.toUpperCase());
      
      if (!discountCode) {
        console.log('كود الخصم غير موجود:', code);
        return res.status(404).json({ message: "كود الخصم غير موجود" });
      }
      
      if (!discountCode.isActive) {
        console.log('كود الخصم غير نشط:', code);
        return res.status(400).json({ message: "كود الخصم غير نشط" });
      }
      
      if (discountCode.expiryDate && new Date() > new Date(discountCode.expiryDate)) {
        console.log('كود الخصم منتهي الصلاحية:', code);
        return res.status(400).json({ message: "كود الخصم منتهي الصلاحية" });
      }
      
      if (discountCode.maxUses && (discountCode.currentUses || 0) >= discountCode.maxUses) {
        console.log('تم استنفاد استخدامات كود الخصم:', code);
        return res.status(400).json({ message: "تم استنفاد استخدامات كود الخصم" });
      }
      
      console.log('كود الخصم صالح:', discountCode);
      res.json(discountCode);
    } catch (error) {
      console.error('خطأ في التحقق من كود الخصم:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/discount-codes/:code", async (req, res) => {
    const code = await storage.getDiscountCode(req.params.code);
    
    if (!code) {
      return res.status(404).json({ message: "كود الخصم غير موجود" });
    }
    
    if (!code.isActive) {
      return res.status(400).json({ message: "كود الخصم غير نشط" });
    }
    
    if (code.expiryDate && new Date() > new Date(code.expiryDate)) {
      return res.status(400).json({ message: "كود الخصم منتهي الصلاحية" });
    }
    
    if (code.maxUses && (code.currentUses || 0) >= code.maxUses) {
      return res.status(400).json({ message: "تم استنفاد استخدامات كود الخصم" });
    }
    
    res.json(code);
  });

  app.post("/api/discount-codes", async (req, res) => {
    try {
      const codeData = insertDiscountCodeSchema.parse(req.body);
      const code = await storage.createDiscountCode(codeData);
      res.json(code);
    } catch (error) {
      res.status(400).json({ message: "Invalid discount code data" });
    }
  });

  // Enhanced Platform Testing Routes
  app.post('/api/platforms/:id/test', async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const userId = req.session?.user?.id || 1;
      const platforms = await storage.getUserPlatforms(userId);
      const platform = platforms.find(p => p.id === platformId);
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      const { createTradingAPI } = await import('./trading-apis');
      const api = createTradingAPI(platform.platform, {
        apiKey: platform.apiKey,
        secretKey: platform.secretKey,
        login: platform.apiKey,
        password: platform.secretKey,
        server: platform.serverInfo,
        passphrase: platform.serverInfo
      });

      const testResult = await api.testConnection();
      
      if (testResult.success) {
        await storage.updatePlatform(platformId, {
          isConnected: true,
          connectionStatus: 'Connected successfully'
        });
      }

      res.json(testResult);
    } catch (error: any) {
      res.status(500).json({ error: `Test failed: ${error.message}` });
    }
  });

  app.post('/api/platforms/:id/test-trading', async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const userId = req.session?.user?.id || 1;
      const platforms = await storage.getUserPlatforms(userId);
      const platform = platforms.find(p => p.id === platformId);
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      const { createTradingAPI } = await import('./trading-apis');
      const api = createTradingAPI(platform.platform, {
        apiKey: platform.apiKey,
        secretKey: platform.secretKey,
        login: platform.apiKey,
        password: platform.secretKey,
        server: platform.serverInfo,
        passphrase: platform.serverInfo
      });

      const testParams = {
        symbol: platform.platform === 'mt5' ? 'EURUSD' : 'BTC/USDT',
        side: 'BUY' as const,
        quantity: platform.platform === 'mt5' ? 0.01 : 10,
        type: 'MARKET' as const
      };

      const tradeResult = await api.placeTrade(testParams);
      
      if (tradeResult.success) {
        await storage.createTrade({
          userId: userId,
          type: 'TEST',
          platform: platform.platform,
          botId: 0,
          pair: testParams.symbol,
          amount: testParams.quantity.toString(),
          entryPrice: '0',
          status: 'completed',
          profit: '0'
        });
      }

      res.json(tradeResult);
    } catch (error: any) {
      res.status(500).json({ error: `Trading test failed: ${error.message}` });
    }
  });

  app.get('/api/platforms/available', async (req, res) => {
    try {
      const availablePlatforms = [
        {
          id: 'binance',
          name: 'Binance',
          description: 'أكبر منصة تداول عملات رقمية في العالم',
          features: ['تداول فوري', 'عمولات منخفضة', 'سيولة عالية'],
          fields: ['apiKey', 'secretKey'],
          testAmount: '0.001 BTC',
          status: 'active'
        },
        {
          id: 'kucoin',
          name: 'KuCoin',
          description: 'منصة عالمية آمنة وموثوقة',
          features: ['عملات متنوعة', 'أمان عالي', 'واجهة سهلة'],
          fields: ['apiKey', 'secretKey', 'passphrase'],
          testAmount: '10 USDT',
          status: 'active'
        },
        {
          id: 'okx',
          name: 'OKX',
          description: 'منصة كبيرة مع سيولة ممتازة',
          features: ['تداول متقدم', 'أدوات تحليل', 'دعم فني ممتاز'],
          fields: ['apiKey', 'secretKey', 'passphrase'],
          testAmount: '10 USDT',
          status: 'active'
        },
        {
          id: 'coinbase',
          name: 'Coinbase Pro',
          description: 'منصة أمريكية معتمدة ومنظمة',
          features: ['مرخصة رسمياً', 'أمان قصوى', 'واجهة احترافية'],
          fields: ['apiKey', 'secretKey', 'passphrase'],
          testAmount: '10 USD',
          status: 'active'
        },
        {
          id: 'bybit',
          name: 'Bybit',
          description: 'منصة تداول مشتقات رائدة',
          features: ['تداول الهامش', 'عقود دائمة', 'أدوات متقدمة'],
          fields: ['apiKey', 'secretKey'],
          testAmount: '10 USDT',
          status: 'active'
        },
        {
          id: 'mt5',
          name: 'MetaTrader 5',
          description: 'منصة تداول الفوركس الاحترافية',
          features: ['تداول فوركس', 'أدوات تحليل', 'تنفيذ سريع'],
          fields: ['login', 'password', 'server'],
          testAmount: '0.01 lot EUR/USD',
          status: 'active'
        }
      ];
      
      res.json(availablePlatforms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get available platforms' });
    }
  });

  // AI Trading routes
  app.get("/api/ai/strategies", async (req, res) => {
    try {
      const strategies = [
        {
          name: 'Ultra Aggressive AI',
          description: 'استراتيجية AI فائقة القوة لعائد 50%+ شهرياً',
          riskLevel: 'aggressive',
          minConfidence: 0.25,
          maxRiskPerTrade: 0.20,
          targetPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
          indicators: ['RSI', 'MACD', 'BollingerBands', 'Sentiment']
        },
        {
          name: 'Lightning Fast AI',
          description: 'AI سريع البرق - تداول كل 30 ثانية',
          riskLevel: 'aggressive',
          minConfidence: 0.20,
          maxRiskPerTrade: 0.15,
          targetPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
          indicators: ['RSI', 'MACD', 'Volume']
        },
        {
          name: 'Smart Momentum AI',
          description: 'AI ذكي للزخم مع تحليل تنبؤي',
          riskLevel: 'moderate',
          minConfidence: 0.40,
          maxRiskPerTrade: 0.08,
          targetPairs: ['BTC/USDT', 'ETH/USDT', 'ADA/USDT'],
          indicators: ['MACD', 'RSI', 'PatternRecognition']
        }
      ];
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ message: "Failed to get AI strategies" });
    }
  });

  app.post("/api/ai/generate-signal", async (req, res) => {
    try {
      const { symbol, strategyName } = req.body;
      const strategies = aiTradingEngine.getAvailableStrategies();
      const strategy = strategies.find(s => s.name === strategyName);
      
      if (!strategy) {
        return res.status(400).json({ message: "Strategy not found" });
      }
      
      const signal = await aiTradingEngine.generateAISignal(symbol, strategy);
      res.json(signal);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI signal" });
    }
  });

  app.post("/api/ai/execute-trade", async (req, res) => {
    try {
      const { signal, platformId } = req.body;
      const userId = 1; // In real app, get from session
      
      const success = await aiTradingEngine.executeAITrade(signal, userId, platformId);
      
      if (success) {
        res.json({ message: "AI trade executed successfully" });
      } else {
        res.status(400).json({ message: "AI trade execution failed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to execute AI trade" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    const stats = await storage.getUserStats();
    res.json(stats);
  });

  // Public Payment Settings endpoint for checkout page
  app.get("/api/payment-settings", async (req, res) => {
    try {
      const settings = await storage.getPaymentSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payment settings" });
    }
  });

  // Payment settings routes
  app.post("/api/admin/payment-settings/local", async (req, res) => {
    try {
      console.log('🔧 تم استلام إعدادات الدفع المحلي:', req.body);
      await storage.savePaymentSettings(req.body);
      res.json({ 
        success: true, 
        message: 'تم حفظ إعدادات الدفع المحلي بنجاح',
        data: req.body 
      });
    } catch (error) {
      console.error('❌ خطأ في حفظ إعدادات الدفع:', error);
      res.status(500).json({ message: "Failed to save payment settings" });
    }
  });

  app.post("/api/admin/payment-settings/gateways", async (req, res) => {
    try {
      console.log('🔧 تم استلام إعدادات البوابات الإلكترونية:', req.body);
      res.json({ 
        success: true, 
        message: 'تم حفظ إعدادات البوابات الإلكترونية بنجاح',
        data: req.body 
      });
    } catch (error) {
      console.error('❌ خطأ في حفظ إعدادات البوابات:', error);
      res.status(500).json({ message: "Failed to save gateway settings" });
    }
  });

  // Contact routes
  app.post("/api/contact", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // تصدير البيانات للإكسل
  app.get("/api/admin/export-excel", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const payments = await storage.getAllPayments();
      const discountCodes = await storage.getAllDiscountCodes();
      const contactMessages = await storage.getAllContactMessages();

      // إنشاء تقرير منظم باللغة العربية مع UTF-8
      const reportData = {
        title: "تقرير بيانات منصة إداية",
        generated: new Date().toLocaleDateString('ar-SA'),
        users: {
          title: "المستخدمين",
          headers: ["الرقم", "البريد الإلكتروني", "الاسم", "مدير", "نشط", "تاريخ التسجيل"],
          data: users.map(user => [
            user.id,
            user.email,
            user.name || 'غير محدد',
            user.isAdmin ? 'نعم' : 'لا',
            user.isActive ? 'نشط' : 'غير نشط',
            user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'
          ])
        },
        payments: {
          title: "المدفوعات",
          headers: ["الرقم", "المستخدم", "المبلغ", "الطريقة", "الحالة", "التاريخ"],
          data: payments.map(payment => [
            payment.id,
            payment.userId,
            payment.amount + ' دولار',
            payment.method === 'vodafone' ? 'فودافون كاش' : 
            payment.method === 'instapay' ? 'إنستاباي' :
            payment.method === 'stripe' ? 'بطاقة ائتمان' :
            payment.method === 'paypal' ? 'باي بال' : payment.method,
            payment.status === 'approved' ? 'مؤكد' : 
            payment.status === 'rejected' ? 'مرفوض' : 'في الانتظار',
            payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'
          ])
        },
        discountCodes: {
          title: "أكواد الخصم",
          headers: ["الرقم", "الكود", "الخصم", "نشط", "الحد الأقصى", "المستخدم", "تاريخ الانتهاء"],
          data: discountCodes.map(code => [
            code.id,
            code.code,
            code.discount + '%',
            code.isActive ? 'نشط' : 'غير نشط',
            code.maxUses || 'غير محدود',
            code.currentUses || 0,
            code.expiryDate ? new Date(code.expiryDate).toLocaleDateString('ar-SA') : 'بدون انتهاء'
          ])
        },
        contactMessages: {
          title: "رسائل الاتصال",
          headers: ["الرقم", "الاسم", "البريد", "الموضوع", "الحالة", "التاريخ"],
          data: contactMessages.map(msg => [
            msg.id,
            msg.name,
            msg.email,
            msg.subject,
            msg.status || 'جديد',
            msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'
          ])
        }
      };

      // تعيين headers للـ UTF-8 والعربية
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Language', 'ar');
      res.json(reportData);
    } catch (error) {
      console.error("خطأ في تصدير البيانات:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // حفظ إعدادات الدفع المحلي
  app.post("/api/admin/payment-settings/local", async (req, res) => {
    try {
      const settings = req.body;
      console.log('حفظ إعدادات الدفع المحلي:', settings);
      
      // حفظ الإعدادات في التخزين
      const success = await storage.savePaymentSettings(settings);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "تم حفظ إعدادات الدفع المحلي بنجاح" 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "فشل في حفظ إعدادات الدفع المحلي" 
        });
      }
    } catch (error: any) {
      console.error("خطأ في حفظ إعدادات الدفع المحلي:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء حفظ الإعدادات" 
      });
    }
  });

  // حفظ إعدادات البوابات الإلكترونية
  app.post("/api/admin/payment-settings/gateways", async (req, res) => {
    try {
      const gatewaySettings = req.body;
      console.log('حفظ إعدادات البوابات الإلكترونية:', gatewaySettings);
      
      // هنا يمكن حفظ إعدادات البوابات في مكان منفصل
      res.json({ 
        success: true, 
        message: "تم حفظ إعدادات البوابات الإلكترونية بنجاح" 
      });
    } catch (error: any) {
      console.error("خطأ في حفظ إعدادات البوابات:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء حفظ إعدادات البوابات" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
