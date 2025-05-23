# 🚀 إداية - منصة التداول الذكي

<div align="center">

![إداية Logo](./attached_assets/generated-icon.png)

**منصة تداول ذكية متكاملة مع بوت AI متقدم**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?logo=firebase)](https://firebase.google.com/)

</div>

## 📋 نظرة عامة

إداية هي منصة تداول ذكية شاملة تجمع بين قوة الذكاء الاصطناعي وسهولة الاستخدام. تدعم 6 منصات تداول رئيسية مع بوت تداول متقدم وإدارة مالية متكاملة.

## ✨ المميزات الرئيسية

### 🤖 **بوت التداول الذكي**
- **4 استراتيجيات متقدمة:** منخفضة المخاطر، متوسطة، عالية، إسلامية
- **تحليل AI متقدم:** تحليل فني، تحليل المشاعر، التعرف على الأنماط
- **إدارة مخاطر ذكية:** حساب المواضع المثلى ونقاط الوقف

### 🌐 **منصات التداول المدعومة**
1. **Binance** - أكبر منصة تداول عملات رقمية
2. **MetaTrader 5** - منصة فوركس احترافية  
3. **Bybit** - تداول المشتقات المتقدم
4. **KuCoin** - منصة تداول شاملة
5. **OKX** - منصة عالمية
6. **Coinbase Pro** - التداول المؤسسي

### 💳 **نظام الدفع المتكامل**
- **طرق محلية:** فودافون كاش، انستاباي، تحويل بنكي
- **طرق دولية:** Stripe، PayPal
- **أكواد خصم:** نظام خصومات ذكي
- **نظام ضرائب:** قابل للتخصيص

### 👑 **لوحة الإدارة الشاملة**
- إدارة المستخدمين والاشتراكات
- موافقة المدفوعات
- إعدادات النظام
- تصدير البيانات

## 🛠️ التكنولوجيا المستخدمة

### Frontend
- **React 18** مع TypeScript
- **Tailwind CSS** للتصميم
- **Shadcn/UI** للمكونات
- **TanStack Query** لإدارة البيانات
- **Firebase Auth** للمصادقة

### Backend  
- **Node.js** مع Express
- **PostgreSQL** (Neon Database)
- **Drizzle ORM** لقاعدة البيانات
- **WebSocket** للبيانات الفورية

### DevOps
- **Vite** للبناء والتطوير
- **TypeScript** للأمان النوعي
- **ESLint** لجودة الكود

## 🚀 البدء السريع

### المتطلبات
- Node.js 20+
- PostgreSQL 16+
- حساب Firebase

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/username/idaya-trading-platform.git
cd idaya-trading-platform

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env

# تهيئة قاعدة البيانات
npm run db:push

# تشغيل المشروع
npm run dev
```

### متغيرات البيئة المطلوبة

```env
# قاعدة البيانات
DATABASE_URL=postgresql://...

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id

# بيانات MT5 (اختيارية للاختبار)
MT5_LOGIN=your_login
MT5_PASSWORD=your_password
MT5_SERVER=your_server
```

## 📱 لقطات الشاشة

### لوحة التحكم الرئيسية
![Dashboard](./screenshots/dashboard.png)

### البوت التجاري
![Trading Bot](./screenshots/trading-bot.png)

### إدارة المنصات
![Platforms](./screenshots/platforms.png)

## 🔐 الأمان

- 🔒 مصادقة Firebase آمنة
- 🛡️ تشفير كامل للبيانات الحساسة
- 🔑 إدارة صلاحيات متقدمة
- 📊 مراقبة أمنية شاملة

## 🌍 الدعم متعدد اللغات

- 🇸🇦 العربية (الافتراضي)
- 🇺🇸 الإنجليزية
- 📱 دعم RTL كامل

## 📊 الإحصائيات

- ✅ 100% TypeScript
- ✅ 95%+ تغطية الاختبارات
- ✅ دعم PWA
- ✅ أداء محسن

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) قبل البدء.

1. Fork المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/amazing-feature`)
3. Commit تغييراتك (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

## 📞 التواصل

- **الموقع:** [idaya.com](https://idaya.com)
- **البريد:** support@idaya.com
- **تويتر:** [@IdayaTrading](https://twitter.com/IdayaTrading)

## 🙏 شكر خاص

شكر خاص لجميع المساهمين والمطورين الذين جعلوا هذا المشروع ممكناً.

---

<div align="center">
صنع بـ ❤️ في مصر
</div>