import { storage } from "./storage";

export async function initializeBasicData() {
  try {
    console.log('🔄 تهيئة البيانات الأساسية...');

    // إنشاء/تحديث المستخدم الأدمن
    const adminEmails = ['ibrahim19777@me.com'];
    
    for (const adminEmail of adminEmails) {
      try {
        let adminUser = await storage.getUserByEmail(adminEmail);
        if (!adminUser) {
          adminUser = await storage.createUser({
            email: adminEmail,
            name: adminEmail.split('@')[0],
            firebaseUid: `admin-${adminEmail.replace(/[@.]/g, '-')}`,
            isAdmin: true,
            hasUsedTrial: false,
            isActive: true,
          });
          console.log(`✅ تم إنشاء المستخدم الأدمن: ${adminEmail}`);
        } else {
          // تحديث صلاحيات الأدمن
          adminUser = await storage.updateUser(adminUser.id, {
            isAdmin: true,
            isActive: true,
          });
          console.log(`✅ تم تحديث صلاحيات الأدمن: ${adminEmail}`);
        }

        // إنشاء اشتراك دائم للأدمن
        const adminSubscription = await storage.getUserSubscription(adminUser.id);
        if (!adminSubscription) {
          const enterprisePlan = (await storage.getAllSubscriptionPlans()).find(plan => plan.planType === 'enterprise');
          if (enterprisePlan) {
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 100); // 100 سنة من الآن

            await storage.createSubscription({
              userId: adminUser.id,
              planId: enterprisePlan.id,
              plan: 'enterprise',
              status: 'active',
              billingCycle: 'yearly',
              endDate,
              amount: '0.00',
            });
            console.log(`✅ تم إنشاء اشتراك Enterprise دائم للأدمن: ${adminEmail}`);
          }
        }
      } catch (error) {
        console.error(`❌ خطأ في إنشاء المستخدم الأدمن ${adminEmail}:`, error);
      }
    }

    // إنشاء خطط الاشتراك
    try {
      const existingPlans = await storage.getAllSubscriptionPlans();
      if (existingPlans.length === 0) {
        // خطة تجريبية
        await storage.createSubscriptionPlan({
          name: 'Trial',
          nameAr: 'تجريبي',
          planType: 'trial',
          monthlyPrice: '0.00',
          yearlyPrice: '0.00',
          maxPlatforms: 1,
          features: ['ربط منصة واحدة', 'استراتيجية منخفضة المخاطر', 'دعم أساسي'],
          isActive: true,
        });

        // خطة أساسية
        await storage.createSubscriptionPlan({
          name: 'Basic',
          nameAr: 'أساسي',
          planType: 'basic',
          monthlyPrice: '29.99',
          yearlyPrice: '299.99',
          maxPlatforms: 2,
          features: ['ربط منصتين', 'جميع الاستراتيجيات', 'دعم متقدم', 'إشعارات ذكية'],
          isActive: true,
        });

        // خطة متميزة
        await storage.createSubscriptionPlan({
          name: 'Premium',
          nameAr: 'متميز',
          planType: 'premium',
          monthlyPrice: '59.99',
          yearlyPrice: '599.99',
          maxPlatforms: 4,
          features: ['ربط 4 منصات', 'جميع الاستراتيجيات', 'دعم مميز', 'تحليل AI متقدم', 'إدارة مخاطر ذكية'],
          isActive: true,
        });

        // خطة المؤسسات
        await storage.createSubscriptionPlan({
          name: 'Enterprise',
          nameAr: 'مؤسسات',
          planType: 'enterprise',
          monthlyPrice: '99.99',
          yearlyPrice: '999.99',
          maxPlatforms: 6,
          features: ['ربط جميع المنصات', 'جميع الاستراتيجيات', 'دعم VIP', 'تحليل AI متقدم', 'إدارة مخاطر ذكية', 'تقارير مفصلة'],
          isActive: true,
        });

        console.log('✅ تم إنشاء خطط الاشتراك');
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء خطط الاشتراك:', error);
    }

    // إنشاء أكواد الخصم
    try {
      const existingCodes = await storage.getAllDiscountCodes();
      if (existingCodes.length === 0) {
        await storage.createDiscountCode({
          code: 'WELCOME50',
          discount: 50,
          maxUses: 100,
          currentUses: 0,
          expiryDate: new Date('2025-12-31'),
          isActive: true,
        });

        await storage.createDiscountCode({
          code: 'RAMADAN2025',
          discount: 30,
          maxUses: 200,
          currentUses: 0,
          expiryDate: new Date('2025-12-31'),
          isActive: true,
        });

        console.log('✅ تم إنشاء أكواد الخصم');
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء أكواد الخصم:', error);
    }

    // إعدادات الدفع الافتراضية
    try {
      const defaultSettings = {
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
          enabled: true,
          rate: 14,
          name: 'ضريبة القيمة المضافة',
          description: 'سيتم إضافة الضريبة للمبلغ الإجمالي'
        }
      };

      const currentSettings = await storage.getPaymentSettings();
      if (!currentSettings || Object.keys(currentSettings).length === 0) {
        await storage.savePaymentSettings(defaultSettings);
        console.log('✅ تم حفظ إعدادات الدفع الافتراضية');
      }
    } catch (error) {
      console.error('❌ خطأ في حفظ إعدادات الدفع:', error);
    }

    console.log('🎉 تم إكمال تهيئة البيانات الأساسية بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في تهيئة البيانات:', error);
  }
}