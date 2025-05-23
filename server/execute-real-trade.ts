// تنفيذ صفقة حقيقية على حساب MT5
import { createTradingAPI } from './trading-apis';
import { storage } from './storage';

export async function executeRealTrade() {
  try {
    console.log('🚀 بدء تنفيذ صفقة حقيقية على MT5...');
    
    // بيانات الاتصال بحساب MT5
    const { MT5_LOGIN, MT5_PASSWORD, MT5_SERVER } = process.env;
    
    if (!MT5_LOGIN || !MT5_PASSWORD || !MT5_SERVER) {
      throw new Error('بيانات MT5 غير متوفرة');
    }
    
    console.log(`📊 الاتصال بحساب MT5: ${MT5_LOGIN}`);
    
    // إنشاء اتصال MT5
    const mt5API = createTradingAPI('MT5', {
      login: MT5_LOGIN,
      password: MT5_PASSWORD,
      server: MT5_SERVER
    });
    
    // اختبار الاتصال أولاً
    const connectionTest = await mt5API.testConnection();
    if (!connectionTest.success) {
      throw new Error(`فشل في الاتصال بـ MT5: ${connectionTest.error}`);
    }
    
    console.log('✅ تم الاتصال بنجاح بحساب MT5');
    
    // تنفيذ صفقة EURUSD
    const tradeParams = {
      symbol: 'EURUSD',
      side: 'BUY',
      quantity: 10000, // 10,000 وحدة
      type: 'MARKET'
    };
    
    console.log(`📈 تنفيذ صفقة: ${tradeParams.side} ${tradeParams.symbol} ${tradeParams.quantity}`);
    
    const tradeResult = await mt5API.placeTrade(tradeParams);
    
    if (tradeResult.success) {
      console.log('🎉 تم تنفيذ الصفقة بنجاح!');
      console.log(`🎫 رقم التذكرة: ${tradeResult.data?.ticket || tradeResult.data?.orderId}`);
      console.log(`💰 السعر: ${tradeResult.data?.openPrice || tradeResult.data?.price}`);
      
      // حفظ الصفقة في قاعدة البيانات
      await storage.createTrade({
        userId: 1,
        platform: 'MT5',
        botId: 7,
        type: 'BUY',
        pair: 'EURUSD',
        amount: '10000',
        entryPrice: (tradeResult.data?.openPrice || tradeResult.data?.price || '1.0856').toString(),
        status: 'open'
      });
      
      console.log('💾 تم حفظ الصفقة في السجل');
      
      return {
        success: true,
        ticket: tradeResult.data?.ticket || tradeResult.data?.orderId,
        price: tradeResult.data?.openPrice || tradeResult.data?.price,
        message: 'تم تنفيذ الصفقة الحقيقية بنجاح!'
      };
      
    } else {
      throw new Error(`فشل في تنفيذ الصفقة: ${tradeResult.error}`);
    }
    
  } catch (error: any) {
    console.error('❌ خطأ في تنفيذ الصفقة الحقيقية:', error);
    return {
      success: false,
      error: error.message
    };
  }
}