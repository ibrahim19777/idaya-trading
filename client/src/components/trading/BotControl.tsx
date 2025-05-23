import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Shield, Scale, Rocket, Star } from 'lucide-react';
import type { Bot, Platform } from '@shared/schema';

const strategies = [
  {
    key: 'low-risk',
    name: 'مخاطرة منخفضة',
    description: 'عائد 5-15% شهرياً',
    icon: Shield,
    color: 'text-green-500',
  },
  {
    key: 'medium-risk',
    name: 'مخاطرة متوسطة',
    description: 'عائد 15-30% شهرياً',
    icon: Scale,
    color: 'text-yellow-500',
  },
  {
    key: 'high-risk',
    name: 'مخاطرة عالية',
    description: 'عائد 30%+ شهرياً',
    icon: Rocket,
    color: 'text-red-500',
  },
  {
    key: 'islamic',
    name: 'استراتيجية إسلامية',
    description: 'متوافقة مع الشريعة',
    icon: Star,
    color: 'text-blue-500',
  },
];

export function BotControl() {
  const [selectedStrategy, setSelectedStrategy] = useState('medium-risk');
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ['/api/platforms', user?.id],
    enabled: !!user?.id,
  });

  const { data: bots = [] } = useQuery<Bot[]>({
    queryKey: ['/api/bots', user?.id],
    enabled: !!user?.id,
  });

  const toggleBotMutation = useMutation({
    mutationFn: async ({ botId, isActive }: { botId: number; isActive: boolean }) => {
      const response = await apiRequest('PUT', `/api/bots/${botId}`, { isActive });
      return response.json();
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots', user?.id] });
      toast({
        title: isActive ? 'تم تشغيل البوت' : 'تم إيقاف البوت',
        description: isActive ? 'البوت نشط الآن' : 'تم إيقاف البوت بنجاح',
        variant: isActive ? 'default' : 'destructive',
      });
    },
  });

  const stopAllBotsMutation = useMutation({
    mutationFn: async () => {
      const promises = bots
        .filter(bot => bot.isActive)
        .map(bot => apiRequest('PUT', `/api/bots/${bot.id}`, { isActive: false }));
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots', user?.id] });
      toast({
        title: 'تم إيقاف جميع البوتات',
        variant: 'destructive',
      });
    },
  });

  const platformBots = platforms.map(platform => {
    const bot = bots.find(b => b.platformId === platform.id);
    return { platform, bot };
  });

  return (
    <div className="space-y-6">
      {/* Master Control */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">التحكم الرئيسي</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">تشغيل أو إيقاف جميع البوتات</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">حالة النظام:</span>
              <Badge variant="default" className="bg-green-500">نشط</Badge>
              <Button 
                variant="destructive"
                onClick={() => stopAllBotsMutation.mutate()}
                disabled={stopAllBotsMutation.isPending}
              >
                إيقاف الكل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Selection */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>اختيار الاستراتيجية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {strategies.map((strategy) => (
              <div
                key={strategy.key}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedStrategy === strategy.key
                    ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
                onClick={() => setSelectedStrategy(strategy.key)}
              >
                <div className="text-center">
                  <strategy.icon className={`h-8 w-8 mx-auto mb-2 ${strategy.color}`} />
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{strategy.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{strategy.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {platformBots.map(({ platform, bot }) => (
          <Card key={platform.id} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    platform.platform === 'binance' ? 'bg-yellow-500' :
                    platform.platform === 'mt5' ? 'bg-blue-600' : 'bg-orange-500'
                  }`}>
                    <span className="text-white font-bold">
                      {platform.platform === 'binance' ? '₿' :
                       platform.platform === 'mt5' ? 'M5' : '⚡'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {platform.platform === 'binance' ? 'Binance Bot' :
                       platform.platform === 'mt5' ? 'MT5 Bot' : 'Bybit Bot'}
                    </h3>
                    <p className={`text-sm ${bot?.isActive ? 'text-green-500' : 'text-gray-500'}`}>
                      {bot?.isActive ? 'نشط - 8 صفقات' : 'متوقف'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={bot?.isActive || false}
                  onCheckedChange={(checked) => {
                    if (bot) {
                      toggleBotMutation.mutate({ botId: bot.id, isActive: checked });
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">أرباح اليوم:</span>
                  <span className={`font-medium ${
                    bot?.isActive ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {bot?.isActive ? `+$${bot.dailyProfit || '247.80'}` : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">الرصيد:</span>
                  <span className="font-medium">${bot?.balance || '5,420.15'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">آخر صفقة:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {bot?.isActive ? 'منذ 5 دقائق' : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
