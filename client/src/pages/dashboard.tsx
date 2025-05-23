import { Layout } from '@/components/layout/Layout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TradingChart } from '@/components/dashboard/TradingChart';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { Subscription, Bot } from '@shared/schema';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['/api/subscriptions', user?.id],
    enabled: !!user?.id,
  });

  const { data: bots = [] } = useQuery<Bot[]>({
    queryKey: ['/api/bots', user?.id],
    enabled: !!user?.id,
  });

  // Calculate stats from bots
  const totalProfit = bots.reduce((sum, bot) => sum + parseFloat(bot.dailyProfit || '0'), 0);
  const activeTrades = bots.filter(bot => bot.isActive).length;
  const successRate = 78.4; // Mock success rate
  const subscriptionStatus = subscription?.status === 'active' ? 'Premium' : 'غير نشط';

  return (
    <Layout>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        {/* خلفية تأثيرات بصرية */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-pink-500/20 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
        
        <div className="relative space-y-8 p-6">
          {/* عنوان عصري */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
                لوحة التحكم الذكية
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-6 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 rounded-2xl px-6 py-3 inline-block shadow-lg border border-white/20 dark:border-gray-700/20">
              🚀 مرحباً بك في منصة Idaya للتداول الذكي
            </p>
          </div>

          {/* بطاقات الإحصائيات العصرية */}
          <div className="transform hover:scale-[1.02] transition-all duration-500">
            <StatsCards
              totalProfit={`$${totalProfit.toFixed(2)}`}
              activeTrades={activeTrades}
              successRate={`${successRate}%`}
              subscriptionStatus={subscriptionStatus}
            />
          </div>

          {/* الرسوم البيانية والصفقات */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="transform hover:scale-[1.02] transition-all duration-500">
              <TradingChart />
            </div>
            <div className="transform hover:scale-[1.02] transition-all duration-500">
              <RecentTrades />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
