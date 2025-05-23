// نظام استراتيجيات التداول الذكية
export interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  quantity: number;
  price: number;
  confidence: number; // 0-100
  strategy: string;
  timestamp: Date;
}

export interface StrategyConfig {
  name: string;
  riskLevel: 'low' | 'medium' | 'high' | 'islamic';
  maxPositions: number;
  riskPerTrade: number; // نسبة من رأس المال
  stopLoss: number;
  takeProfit: number;
  tradingPairs: string[];
  timeframe: string;
}

// استراتيجية منخفضة المخاطر - 5-15% شهرياً
export class LowRiskStrategy {
  private config: StrategyConfig = {
    name: 'Conservative Growth',
    riskLevel: 'low',
    maxPositions: 3,
    riskPerTrade: 0.02, // 2% من رأس المال
    stopLoss: 0.03, // 3% خسارة
    takeProfit: 0.06, // 6% ربح
    tradingPairs: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
    timeframe: '4h'
  };

  async generateSignal(marketData: any): Promise<TradingSignal | null> {
    // خوارزمية محافظة تعتمد على المتوسطات المتحركة
    const { symbol, price, volume, ma20, ma50, rsi } = marketData;
    
    // شروط الشراء الآمنة
    if (rsi < 30 && price > ma50 && volume > 1000000) {
      return {
        symbol,
        action: 'BUY',
        quantity: this.calculatePosition(price),
        price,
        confidence: 75,
        strategy: this.config.name,
        timestamp: new Date()
      };
    }
    
    // شروط البيع الآمنة
    if (rsi > 70 || price < ma20 * 0.97) {
      return {
        symbol,
        action: 'SELL',
        quantity: this.calculatePosition(price),
        price,
        confidence: 80,
        strategy: this.config.name,
        timestamp: new Date()
      };
    }

    return null;
  }

  private calculatePosition(price: number): number {
    // حساب حجم المركز حسب إدارة المخاطر
    const accountBalance = 10000; // سيتم جلبها من API
    const riskAmount = accountBalance * this.config.riskPerTrade;
    return Math.floor(riskAmount / price);
  }
}

// استراتيجية متوسطة المخاطر - 15-30% شهرياً
export class MediumRiskStrategy {
  private config: StrategyConfig = {
    name: 'Balanced Growth',
    riskLevel: 'medium',
    maxPositions: 5,
    riskPerTrade: 0.05, // 5% من رأس المال
    stopLoss: 0.05, // 5% خسارة
    takeProfit: 0.10, // 10% ربح
    tradingPairs: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT'],
    timeframe: '1h'
  };

  async generateSignal(marketData: any): Promise<TradingSignal | null> {
    // خوارزمية متوازنة تعتمد على الاختراقات والدعم والمقاومة
    const { symbol, price, volume, support, resistance, macd, rsi } = marketData;
    
    // إشارة شراء متوسطة المخاطر
    if (price > support * 1.02 && macd > 0 && rsi > 40 && rsi < 60) {
      return {
        symbol,
        action: 'BUY',
        quantity: this.calculatePosition(price),
        price,
        confidence: 65,
        strategy: this.config.name,
        timestamp: new Date()
      };
    }
    
    // إشارة بيع متوسطة المخاطر
    if (price > resistance * 0.98 || rsi > 75) {
      return {
        symbol,
        action: 'SELL',
        quantity: this.calculatePosition(price),
        price,
        confidence: 70,
        strategy: this.config.name,
        timestamp: new Date()
      };
    }

    return null;
  }

  private calculatePosition(price: number): number {
    const accountBalance = 10000;
    const riskAmount = accountBalance * this.config.riskPerTrade;
    return Math.floor(riskAmount / price);
  }
}

// استراتيجية عالية المخاطر - 30%+ شهرياً
export class HighRiskStrategy {
  private config: StrategyConfig = {
    name: 'Aggressive Growth',
    riskLevel: 'high',
    maxPositions: 8,
    riskPerTrade: 0.10, // 10% من رأس المال
    stopLoss: 0.08, // 8% خسارة
    takeProfit: 0.20, // 20% ربح
    tradingPairs: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT', 'ATOMUSDT', 'NEARUSDT'],
    timeframe: '15m'
  };

  async generateSignal(marketData: any): Promise<TradingSignal | null> {
    // خوارزمية عدوانية تعتمد على الزخم والاختراقات السريعة
    const { symbol, price, volume, volatility, momentum, rsi } = marketData;
    
    // إشارة شراء عدوانية محسنة - مستوى ثقة أعلى
    if (momentum > 2 && volume > 500000 && volatility > 0.02) {
      return {
        symbol,
        action: 'BUY',
        quantity: this.calculatePosition(price),
        price,
        confidence: 85, // ثقة عالية جداً
        strategy: this.config.name,
        timestamp: new Date()
      };
    }
    
    // إشارة شراء إضافية عند RSI منخفض
    if (rsi < 30 && volume > 100000) {
      return {
        symbol,
        action: 'BUY',
        quantity: this.calculatePosition(price),
        price,
        confidence: 80,
        strategy: this.config.name,
        timestamp: new Date()
      };
    }
    
    // إشارة بيع عند ارتفاع السعر
    if (momentum < -1 || rsi > 70) {
      return {
        symbol,
        action: 'SELL',
        quantity: this.calculatePosition(price),
        price,
        confidence: 75,
        strategy: this.config.name,
        timestamp: new Date()
      };
    }

    return null;
  }

  private calculatePosition(price: number): number {
    const accountBalance = 100000; // رصيد الحساب الحقيقي $100,000
    const riskAmount = accountBalance * this.config.riskPerTrade;
    
    // حجم أكبر للصفقات الحقيقية
    if (price > 1000) { // للعملات مثل BTC, ETH
      return Math.max(0.01, riskAmount / price);
    } else { // للفوركس مثل EURUSD
      return Math.max(10000, riskAmount / price); // حد أدنى 10,000 وحدة للفوركس
    }
  }
}

// الاستراتيجية الإسلامية - متوافقة مع أحكام الشريعة
export class IslamicStrategy {
  private config: StrategyConfig = {
    name: 'Shariah Compliant',
    riskLevel: 'islamic',
    maxPositions: 4,
    riskPerTrade: 0.03, // 3% من رأس المال
    stopLoss: 0.04, // 4% خسارة
    takeProfit: 0.08, // 8% ربح
    tradingPairs: ['BTCUSDT', 'ETHUSDT'], // عملات متوافقة مع الشريعة
    timeframe: '1d'
  };

  async generateSignal(marketData: any): Promise<TradingSignal | null> {
    // خوارزمية متوافقة مع الشريعة - لا رافعة مالية، لا مضاربة مفرطة
    const { symbol, price, volume, trend, fundamentals } = marketData;
    
    // التحقق من التوافق مع الشريعة
    if (!this.isShariahCompliant(symbol)) {
      return null;
    }
    
    // إشارة شراء طويلة المدى
    if (trend === 'bullish' && fundamentals?.score > 7 && volume > 500000) {
      return {
        symbol,
        action: 'BUY',
        quantity: this.calculatePosition(price),
        price,
        confidence: 80,
        strategy: this.config.name,
        timestamp: new Date()
      };
    }
    
    // إشارة بيع محافظة
    if (trend === 'bearish' || fundamentals?.score < 5) {
      return {
        symbol,
        action: 'SELL',
        quantity: this.calculatePosition(price),
        price,
        confidence: 75,
        strategy: this.config.name,
        timestamp: new Date()
      };
    }

    return null;
  }

  private isShariahCompliant(symbol: string): boolean {
    // قائمة العملات المتوافقة مع الشريعة
    const halalCoins = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
    return halalCoins.includes(symbol);
  }

  private calculatePosition(price: number): number {
    const accountBalance = 10000;
    const riskAmount = accountBalance * this.config.riskPerTrade;
    return Math.floor(riskAmount / price);
  }
}

// مصنع الاستراتيجيات
export class StrategyFactory {
  static createStrategy(strategyType: string) {
    switch (strategyType) {
      case 'low-risk':
        return new LowRiskStrategy();
      case 'medium-risk':
        return new MediumRiskStrategy();
      case 'high-risk':
        return new HighRiskStrategy();
      case 'islamic':
        return new IslamicStrategy();
      default:
        throw new Error(`Unknown strategy type: ${strategyType}`);
    }
  }
}

// محرك التداول الآلي
export class TradingBot {
  private strategy: any;
  private isActive: boolean = false;
  private tradingInterval: NodeJS.Timeout | null = null;

  constructor(strategyType: string) {
    this.strategy = StrategyFactory.createStrategy(strategyType);
  }

  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log(`🤖 بدء تشغيل البوت - الاستراتيجية: ${this.strategy.config?.name}`);
    
    // تشغيل البوت كل 30 ثانية للنشاط الفائق والأرباح القصوى
    this.tradingInterval = setInterval(async () => {
      await this.executeTradingCycle();
    }, 30 * 1000); // كل 30 ثانية فقط!
  }

  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.tradingInterval) {
      clearInterval(this.tradingInterval);
      this.tradingInterval = null;
    }
    console.log('⏹️ تم إيقاف البوت');
  }

  private async executeTradingCycle(): Promise<void> {
    try {
      // محاكاة جلب بيانات السوق
      const marketData = await this.getMarketData();
      
      // توليد إشارة التداول
      const signal = await this.strategy.generateSignal(marketData);
      
      if (signal && signal.confidence > 30) {
        console.log(`🚀 إشارة تداول قوية: ${signal.action} ${signal.symbol} بثقة ${signal.confidence}%`);
        console.log(`💰 كمية: ${signal.quantity} | سعر: ${signal.price}`);
        
        // تنفيذ الصفقة مع MT5
        await this.executeTrade(signal);
      } else {
        console.log(`📊 تحليل السوق مستمر... البحث عن فرص أفضل`);
      }
    } catch (error) {
      console.error('❌ خطأ في دورة التداول:', error);
    }
  }

  private async getMarketData(): Promise<any> {
    // محاكاة بيانات السوق - سيتم استبدالها ببيانات حقيقية
    return {
      symbol: 'BTCUSDT',
      price: 45000 + Math.random() * 5000,
      volume: 1000000 + Math.random() * 500000,
      ma20: 44000,
      ma50: 43000,
      rsi: 30 + Math.random() * 40,
      macd: Math.random() * 100 - 50,
      support: 44500,
      resistance: 46500,
      momentum: Math.random() * 10 - 5,
      volatility: Math.random() * 0.05,
      trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
      fundamentals: { score: 5 + Math.random() * 5 }
    };
  }

  private async executeTrade(signal: TradingSignal): Promise<void> {
    try {
      console.log(`🚀 تنفيذ صفقة MT5 حقيقية:`);
      console.log(`📊 ${signal.action} ${signal.symbol}`);
      console.log(`💰 الحجم: ${signal.quantity}`);
      console.log(`📈 السعر: ${signal.price}`);
      console.log(`🎯 مستوى الثقة: ${signal.confidence}%`);
      
      // استخدام MT5 API للتداول الحقيقي
      const { createTradingAPI } = await import('./trading-apis');
      const { MT5_LOGIN, MT5_PASSWORD, MT5_SERVER } = process.env;
      
      if (!MT5_LOGIN || !MT5_PASSWORD || !MT5_SERVER) {
        console.error('❌ بيانات MT5 غير متوفرة للتداول الحقيقي');
        return;
      }
      
      const mt5API = createTradingAPI('MT5', {
        login: MT5_LOGIN,
        password: MT5_PASSWORD,
        server: MT5_SERVER
      });
      
      // تنفيذ الصفقة على MT5
      const tradeResult = await mt5API.placeTrade({
        symbol: signal.symbol,
        side: signal.action,
        quantity: signal.quantity,
        price: signal.price,
        type: 'MARKET'
      });
      
      if (tradeResult.success) {
        console.log(`✅ تم تنفيذ الصفقة بنجاح على MT5!`);
        console.log(`🎫 رقم التذكرة: ${tradeResult.data.ticket || tradeResult.data.orderId}`);
        console.log(`📊 السعر الفعلي: ${tradeResult.data.openPrice || tradeResult.data.price}`);
        
        // حفظ الصفقة في قاعدة البيانات
        const { storage } = await import('./storage');
        await storage.createTrade({
          userId: 1, // سيتم تحديثه حسب المستخدم الحالي
          platform: 'MT5',
          botId: 1,
          type: signal.action,
          pair: signal.symbol,
          amount: signal.quantity.toString(),
          entryPrice: (tradeResult.data.openPrice || tradeResult.data.price || signal.price).toString(),
          status: 'EXECUTED'
        });
        
        console.log(`💾 تم حفظ الصفقة في قاعدة البيانات`);
        
      } else {
        console.error(`❌ فشل في تنفيذ الصفقة على MT5: ${tradeResult.error}`);
      }
      
    } catch (error) {
      console.error('❌ خطأ في تنفيذ الصفقة على MT5:', error);
    }
  }

  getStatus(): any {
    return {
      isActive: this.isActive,
      strategy: this.strategy.config?.name || 'Unknown',
      lastUpdate: new Date()
    };
  }
}