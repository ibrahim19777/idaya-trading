// تفعيل البوت مع الاستراتيجية عالية المخاطر
import { TradingBot } from './trading-strategies';
import { storage } from './storage';

// البوت النشط
let activeTradingBot: TradingBot | null = null;

export async function activateHighRiskBot(userId: number, platformId: number) {
  try {
    console.log('🚀 تفعيل البوت - استراتيجية المخاطرة العالية');
    console.log(`👤 المستخدم: ${userId}, المنصة: ${platformId}`);
    
    // إنشاء البوت بالاستراتيجية عالية المخاطر
    activeTradingBot = new TradingBot('high-risk');
    
    // حفظ بيانات البوت في قاعدة البيانات
    const bot = await storage.createBot({
      userId,
      platformId,
      strategy: 'high-risk',
      isActive: true,
      balance: '10000.00', // رصيد ابتدائي
      dailyProfit: '0.00'
    });
    
    console.log(`🤖 تم إنشاء البوت - ID: ${bot.id}`);
    
    // تشغيل البوت
    activeTradingBot.start();
    
    console.log('✅ البوت الذكي يعمل الآن! استراتيجية فائقة القوة مفعلة');
    console.log('🚀 يهدف لعائد 50%+ شهرياً مع AI متطور');
    console.log('⚡ تداول فائق السرعة كل 30 ثانية');
    console.log('💰 حتى 20% من رأس المال لكل صفقة');
    console.log('🧠 AI متقدم مع تحليل شامل للسوق');
    
    return {
      success: true,
      botId: bot.id,
      strategy: 'high-risk',
      message: 'تم تفعيل البوت بنجاح - استراتيجية المخاطرة العالية'
    };
    
  } catch (error: any) {
    console.error('❌ خطأ في تفعيل البوت:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function stopBot() {
  if (activeTradingBot) {
    activeTradingBot.stop();
    activeTradingBot = null;
    console.log('⏹️ تم إيقاف البوت');
    return { success: true, message: 'تم إيقاف البوت' };
  }
  return { success: false, message: 'لا يوجد بوت نشط' };
}

export function getBotStatus() {
  if (activeTradingBot) {
    return {
      active: true,
      status: activeTradingBot.getStatus(),
      strategy: 'high-risk'
    };
  }
  return { active: false };
}