import { Layout } from '@/components/layout/Layout';
import { SubscriptionPlans } from '@/components/subscriptions/SubscriptionPlans';

export default function SubscriptionsPage() {
  return (
    <Layout>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
        {/* خلفية تأثيرات بصرية */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -translate-x-48 translate-y-48"></div>
        
        <div className="relative space-y-8 p-6">
          {/* عنوان عصري */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
                خطط الاشتراك المميزة
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-6 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 rounded-2xl px-8 py-4 inline-block shadow-lg border border-white/20 dark:border-gray-700/20">
              👑 اختر الخطة المناسبة لاحتياجاتك في التداول الذكي
            </p>
          </div>

          {/* خطط الاشتراك العصرية */}
          <div className="transform hover:scale-[1.01] transition-all duration-500">
            <SubscriptionPlans />
          </div>
        </div>
      </div>
    </Layout>
  );
}
