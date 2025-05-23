import { useCallback, useState } from 'react';

export type Language = 'en' | 'ar';

const translations = {
  en: {
    'app.name': 'Idaya',
    'app.subtitle': 'Smart Trading Platform',
    'login.title': 'Sign In',
    'login.email': 'Email',
    'login.password': 'Password', 
    'login.signin': 'Sign In',
    'login.google': 'Sign in with Google',
    'login.signup': 'Create new account',
    'nav.overview': 'Overview',
    'nav.connections': 'Platform Connections',
    'nav.bot': 'Bot Control',
    'nav.aitrading': 'AI Trading',
    'nav.trades': 'Trade History',
    'nav.notifications': 'Smart Notifications',
    'nav.subscriptions': 'Subscriptions',
    'nav.payments': 'Payment History',
    'nav.calculator': 'Profit Calculator',
    'nav.contact': 'Contact Us',
    'nav.admin': 'Admin Panel',
    'dashboard.totalProfit': 'Total Profit',
    'dashboard.activeTrades': 'Active Trades',
    'dashboard.successRate': 'Success Rate',
    'dashboard.subscription': 'Subscription Status',
    'platform.binance': 'Binance',
    'platform.mt5': 'MetaTrader 5',
    'platform.bybit': 'Bybit',
    'strategy.low': 'Low Risk',
    'strategy.medium': 'Medium Risk', 
    'strategy.high': 'High Risk',
    'strategy.islamic': 'Islamic Strategy',
  },
  ar: {
    'app.name': 'Idaya',
    'app.subtitle': 'منصة التداول الذكية',
    'login.title': 'تسجيل الدخول',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.signin': 'تسجيل الدخول',
    'login.google': 'تسجيل الدخول بـ Google',
    'login.signup': 'إنشاء حساب جديد',
    'nav.overview': 'نظرة عامة',
    'nav.connections': 'ربط المنصات',
    'nav.bot': 'التحكم بالبوت',
    'nav.aitrading': 'التداول الذكي',
    'nav.trades': 'سجل الصفقات',
    'nav.notifications': 'التنبيهات الذكية',
    'nav.subscriptions': 'الاشتراكات',
    'nav.payments': 'سجل المدفوعات',
    'nav.calculator': 'حاسبة الأرباح',
    'nav.contact': 'اتصل بنا',
    'nav.admin': 'لوحة الإدارة',
    'dashboard.totalProfit': 'إجمالي الأرباح',
    'dashboard.activeTrades': 'الصفقات النشطة',
    'dashboard.successRate': 'معدل النجاح',
    'dashboard.subscription': 'حالة الاشتراك',
    'platform.binance': 'بايننس',
    'platform.mt5': 'ميتاتريدر 5',
    'platform.bybit': 'بايبت',
    'strategy.low': 'مخاطرة منخفضة',
    'strategy.medium': 'مخاطرة متوسطة',
    'strategy.high': 'مخاطرة عالية',
    'strategy.islamic': 'استراتيجية إسلامية',
  }
};

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('ar');
  
  const t = useCallback((key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  }, [language]);

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  return { t, language, changeLanguage };
}
