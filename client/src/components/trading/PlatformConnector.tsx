import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertPlatformSchema, type Platform, type InsertPlatform } from "@shared/schema";
import { Link, RefreshCw, Loader2, Info, ExternalLink } from "lucide-react";

interface PlatformCardProps {
  platform: {
    name: string;
    key: string;
    icon: string;
    color: string;
    description: string;
    features?: string[];
    testAmount?: string;
    fields: Array<{
      key: string;
      label: string;
      type: string;
      placeholder: string;
    }>;
  };
  connection?: Platform;
}

function getAPISteps(platformKey: string): string[] {
  const steps = {
    binance: [
      "1. سجل الدخول إلى حساب Binance الخاص بك",
      "2. اذهب إلى API Management في إعدادات الحساب",
      "3. أنشئ مفتاح API جديد مع صلاحيات التداول",
      "4. انسخ API Key و Secret Key"
    ],
    mt5: [
      "1. افتح منصة MetaTrader 5",
      "2. اختر File > Login to Trade Account",
      "3. أدخل رقم الحساب وكلمة المرور",
      "4. اختر الخادم المناسب من القائمة"
    ],
    bybit: [
      "1. سجل الدخول إلى حساب Bybit",
      "2. اذهب إلى Account & Security > API",
      "3. أنشئ مفتاح API جديد مع صلاحيات التداول",
      "4. انسخ API Key و Secret Key"
    ],
    kucoin: [
      "1. سجل الدخول إلى حساب KuCoin",
      "2. اذهب إلى API Management",
      "3. أنشئ مفتاح API جديد مع صلاحيات التداول",
      "4. انسخ API Key و Secret Key و Passphrase"
    ],
    okx: [
      "1. سجل الدخول إلى حساب OKX",
      "2. اذهب إلى API في إعدادات الحساب",
      "3. أنشئ مفتاح API جديد مع صلاحيات التداول",
      "4. انسخ API Key و Secret Key و Passphrase"
    ],
    coinbase: [
      "1. سجل الدخول إلى Coinbase Pro",
      "2. اذهب إلى API في إعدادات الحساب",
      "3. أنشئ مفتاح API جديد مع صلاحيات التداول",
      "4. انسخ API Key و Secret Key و Passphrase"
    ]
  };
  return steps[platformKey as keyof typeof steps] || [];
}

function getAPIGuideLink(platformKey: string): string {
  const links = {
    binance: "https://www.binance.com/en/support/faq/how-to-create-api-keys-on-binance-360002502072",
    mt5: "https://www.metatrader5.com/en/help/start/trade_server",
    bybit: "https://help.bybit.com/hc/en-us/articles/360039749613-How-to-create-a-new-API-key-",
    kucoin: "https://docs.kucoin.com/#authentication",
    okx: "https://www.okx.com/help-center/how-to-create-an-api-key",
    coinbase: "https://help.coinbase.com/en/pro/other-topics/api/how-do-i-create-an-api-key-for-coinbase-pro"
  };
  return links[platformKey as keyof typeof links] || "#";
}

function PlatformCard({ platform, connection }: PlatformCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<any>({
    resolver: zodResolver(insertPlatformSchema),
    defaultValues: {
      platform: platform.key,
      apiKey: connection?.apiKey || '',
      secretKey: connection?.secretKey || '',
      serverInfo: connection?.serverInfo || '',
    }
  });

  const connectMutation = useMutation({
    mutationFn: async (data: InsertPlatform) => {
      const response = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'فشل في الاتصال بالمنصة');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "نجح الاتصال! ✅",
        description: `تم ربط منصة ${platform.name} بنجاح`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/platforms'] });
      setIsExpanded(false);
    },
    onError: (error: any) => {
      toast({
        title: "فشل الاتصال ❌",
        description: error.message || "حدث خطأ في ربط المنصة",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    connectMutation.mutate(data);
  };

  const isConnecting = connectMutation.isPending;
  const isConnected = connection?.isConnected;

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10"></div>
      
      {/* Header الجديد - تصميم أفقي عصري */}
      <div className="relative flex items-center justify-between p-6 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-sm">
        {/* معلومات المنصة الأساسية */}
        <div className="flex items-center gap-5">
          {/* أيقونة المنصة مع تأثيرات */}
          <div className={`relative p-4 rounded-2xl ${platform.color} shadow-lg transform hover:scale-110 transition-all duration-300`}>
            <span className="text-3xl filter drop-shadow-md">{platform.icon}</span>
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {platform.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {platform.description}
            </p>
            {platform.testAmount && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-amber-600 dark:text-amber-400">⚡</span>
                <span className="text-amber-700 dark:text-amber-300 font-semibold">اختبار: {platform.testAmount}</span>
              </div>
            )}
          </div>
        </div>

        {/* حالة الاتصال والتحكم العصرية */}
        <div className="flex items-center gap-4">
          {/* مؤشر حالة الاتصال المطور */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-md border border-white/20">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
              {isConnected && (
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
              )}
            </div>
            <span className={`text-sm font-bold ${isConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {isConnected ? 'متصل' : 'غير متصل'}
            </span>
          </div>

          {/* زر التوسيع العصري */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          >
            <span className="text-lg font-bold">
              {isExpanded ? '−' : '+'}
            </span>
          </Button>
        </div>
      </div>
      
      {/* التفاصيل القابلة للتوسيع مع تأثيرات عصرية */}
      {isExpanded && (
        <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-xl border-t border-blue-200/50 dark:border-purple-700/50">
          <CardContent className="p-6 space-y-6">
            {/* عرض الميزات مع تصميم كارد عصري */}
            {platform.features && (
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/30 dark:via-green-900/30 dark:to-teal-900/30 p-6 rounded-2xl shadow-lg border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                <div className="relative">
                  <h4 className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-green-600 dark:from-emerald-400 dark:to-green-300 bg-clip-text text-transparent mb-4 flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    الميزات الرئيسية
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {platform.features.map((feature, index) => (
                      <div 
                        key={index}
                        className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-emerald-700 dark:text-emerald-300 text-sm px-4 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-emerald-200/50 dark:border-emerald-700/50"
                      >
                        <span className="group-hover:scale-110 transition-transform duration-300 inline-block">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* دليل الحصول على API مع تصميم متقدم */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 p-6 rounded-2xl shadow-lg border border-blue-200/50 dark:border-blue-700/50">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -translate-y-20 -translate-x-20 blur-3xl"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-lg bg-gradient-to-r from-blue-700 to-purple-600 dark:from-blue-400 dark:to-purple-300 bg-clip-text text-transparent">
                    كيفية الحصول على مفاتيح API
                  </h4>
                </div>
                
                <div className="space-y-3 mb-5">
                  {getAPISteps(platform.key).map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
                
                <a 
                  href={getAPIGuideLink(platform.key)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <ExternalLink className="w-5 h-5" />
                  دليل مفصل
                </a>
              </div>
            </div>

            {/* نموذج الاتصال العصري */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-900/30 dark:via-violet-900/30 dark:to-purple-900/30 p-6 rounded-2xl shadow-lg border border-indigo-200/50 dark:border-indigo-700/50">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full translate-y-24 translate-x-24 blur-3xl"></div>
              <div className="relative">
                <h4 className="font-bold text-lg bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-400 dark:to-purple-300 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                  <span className="text-2xl">🔗</span>
                  ربط المنصة
                </h4>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {platform.fields.map((field) => (
                      <FormField
                        key={field.key}
                        control={form.control}
                        name={field.key as any}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-700 dark:text-indigo-300 font-semibold">
                              {field.label}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type={field.type}
                                placeholder={field.placeholder}
                                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-indigo-200/50 dark:border-indigo-700/50 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl shadow-sm"
                                {...formField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    
                    <Button 
                      type="submit" 
                      disabled={isConnecting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          جاري الاتصال...
                        </>
                      ) : connection ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2" />
                          تحديث الاتصال
                        </>
                      ) : (
                        <>
                          <Link className="w-5 h-5 mr-2" />
                          ربط المنصة
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  );
}

export function PlatformConnector() {
  const { data: platforms = [], isLoading } = useQuery({
    queryKey: ['/api/platforms'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="mr-2">جاري تحميل منصات التداول...</span>
      </div>
    );
  }

  const platformConfigs = [
    {
      name: "Binance",
      key: "binance",
      icon: "💰",
      color: "bg-yellow-500",
      description: "أكبر منصة تداول عملات رقمية في العالم",
      features: ["تداول فوري", "عمولات منخفضة", "سيولة عالية", "أكثر من 600 عملة"],
      testAmount: "0.001 BTC",
      fields: [
        { key: "apiKey", label: "مفتاح API", type: "text", placeholder: "أدخل مفتاح API الخاص بـ Binance" },
        { key: "secretKey", label: "المفتاح السري", type: "password", placeholder: "أدخل المفتاح السري" },
      ],
    },
    {
      name: "MetaTrader 5",
      key: "mt5",
      icon: "📈",
      color: "bg-blue-500",
      description: "منصة تداول الفوركس والعقود مقابل الفروقات",
      features: ["تداول الفوركس", "المؤشرات الفنية", "التداول الآلي", "الرسوم البيانية المتقدمة"],
      testAmount: "0.1 لوت",
      fields: [
        { key: "apiKey", label: "رقم الحساب", type: "text", placeholder: "أدخل رقم حساب MT5" },
        { key: "secretKey", label: "كلمة المرور", type: "password", placeholder: "أدخل كلمة مرور الحساب" },
        { key: "serverInfo", label: "خادم الوسيط", type: "text", placeholder: "مثال: MetaQuotes-Demo" },
      ],
    },
    {
      name: "Bybit",
      key: "bybit",
      icon: "🚀",
      color: "bg-orange-500",
      description: "منصة تداول المشتقات والعملات الرقمية",
      features: ["تداول العقود الآجلة", "رافعة مالية عالية", "تداول بدون فوائد", "أدوات تحليل متقدمة"],
      testAmount: "0.01 BTC",
      fields: [
        { key: "apiKey", label: "مفتاح API", type: "text", placeholder: "أدخل مفتاح API الخاص بـ Bybit" },
        { key: "secretKey", label: "المفتاح السري", type: "password", placeholder: "أدخل المفتاح السري" },
      ],
    },
    {
      name: "KuCoin",
      key: "kucoin",
      icon: "🔵",
      color: "bg-green-500",
      description: "منصة تداول العملات الرقمية مع مجموعة واسعة من الخدمات",
      features: ["تداول الفوري والآجل", "اكتتابات العملات الجديدة", "استثمار العملات", "منتجات DeFi"],
      testAmount: "0.001 BTC",
      fields: [
        { key: "apiKey", label: "مفتاح API", type: "text", placeholder: "أدخل مفتاح API الخاص بـ KuCoin" },
        { key: "secretKey", label: "المفتاح السري", type: "password", placeholder: "أدخل المفتاح السري" },
        { key: "serverInfo", label: "عبارة المرور", type: "password", placeholder: "أدخل عبارة المرور" },
      ],
    },
    {
      name: "OKX",
      key: "okx",
      icon: "⭕",
      color: "bg-blue-600",
      description: "منصة تداول شاملة للعملات الرقمية والمشتقات",
      features: ["تداول الفوري والآجل", "تداول الخيارات", "منتجات الإقراض", "NFT marketplace"],
      testAmount: "0.001 BTC",
      fields: [
        { key: "apiKey", label: "مفتاح API", type: "text", placeholder: "أدخل مفتاح API الخاص بـ OKX" },
        { key: "secretKey", label: "المفتاح السري", type: "password", placeholder: "أدخل المفتاح السري" },
        { key: "serverInfo", label: "عبارة المرور", type: "password", placeholder: "أدخل عبارة المرور" },
      ],
    },
    {
      name: "Coinbase Pro",
      key: "coinbase",
      icon: "🔷",
      color: "bg-indigo-500",
      description: "منصة تداول احترافية من Coinbase",
      features: ["واجهة احترافية", "رسوم منخفضة", "أمان عالي", "دعم العملات الرئيسية"],
      testAmount: "0.001 BTC",
      fields: [
        { key: "apiKey", label: "مفتاح API", type: "text", placeholder: "أدخل مفتاح API الخاص بـ Coinbase Pro" },
        { key: "secretKey", label: "المفتاح السري", type: "password", placeholder: "أدخل المفتاح السري" },
        { key: "serverInfo", label: "عبارة المرور", type: "password", placeholder: "أدخل عبارة المرور" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {platformConfigs.map((config) => {
        const connection = platforms.find((p: Platform) => p.platform === config.key);
        return (
          <PlatformCard
            key={config.key}
            platform={config}
            connection={connection}
          />
        );
      })}
    </div>
  );
}