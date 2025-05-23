import { Card, CardContent } from '@/components/ui/card';
import { ChartLine, ArrowUpDown, Target, Crown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface StatsCardsProps {
  totalProfit: string;
  activeTrades: number;
  successRate: string;
  subscriptionStatus: string;
}

export function StatsCards({ totalProfit, activeTrades, successRate, subscriptionStatus }: StatsCardsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('dashboard.totalProfit'),
      value: totalProfit,
      icon: ChartLine,
      color: 'text-green-500',
    },
    {
      title: t('dashboard.activeTrades'),
      value: activeTrades.toString(),
      icon: ArrowUpDown,
      color: 'text-primary',
    },
    {
      title: t('dashboard.successRate'),
      value: successRate,
      icon: Target,
      color: 'text-green-500',
    },
    {
      title: t('dashboard.subscription'),
      value: subscriptionStatus,
      icon: Crown,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={stat.title} className="group relative overflow-hidden bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
          {/* خلفية متدرجة ديناميكية */}
          <div className={`absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${
            index === 0 ? 'from-green-400 to-emerald-600' :
            index === 1 ? 'from-blue-400 to-indigo-600' :
            index === 2 ? 'from-purple-400 to-violet-600' :
            'from-yellow-400 to-orange-600'
          }`}></div>
          
          {/* تأثير النبضة */}
          <div className={`absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse ${
            index === 0 ? 'bg-green-400' :
            index === 1 ? 'bg-blue-400' :
            index === 2 ? 'bg-purple-400' :
            'bg-yellow-400'
          }`}></div>
          
          <CardContent className="relative p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 tracking-wide uppercase">
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold financial-text group-hover:scale-110 transition-transform duration-300 ${
                  index === 0 ? 'profit-text text-green-600 dark:text-green-400' : stat.color
                }`}>
                  {stat.value}
                </p>
              </div>
              
              {/* أيقونة تفاعلية */}
              <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${
                index === 0 ? 'from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30' :
                index === 1 ? 'from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30' :
                index === 2 ? 'from-purple-100 to-violet-200 dark:from-purple-900/30 dark:to-violet-800/30' :
                'from-yellow-100 to-orange-200 dark:from-yellow-900/30 dark:to-orange-800/30'
              } group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                <stat.icon className={`h-8 w-8 ${stat.color} group-hover:scale-125 transition-transform duration-300`} />
              </div>
            </div>
            
            {/* شريط التقدم التفاعلي */}
            <div className="mt-4 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r transition-all duration-1000 group-hover:w-full ${
                index === 0 ? 'from-green-400 to-emerald-500 w-4/5' :
                index === 1 ? 'from-blue-400 to-indigo-500 w-3/5' :
                index === 2 ? 'from-purple-400 to-violet-500 w-4/5' :
                'from-yellow-400 to-orange-500 w-2/3'
              }`}></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
