import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { FaStripe, FaPaypal, FaCreditCard, FaUniversity } from 'react-icons/fa';
import instapayLogo from '@assets/InstaPay Logo-01.png';
import vodafoneLogo from '@assets/VF Cash Logo - (RED).png';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useState } from 'react';
import type { Subscription } from '@shared/schema';

export function SubscriptionPlans() {
  const [, navigate] = useLocation();
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // جلب خطط الاشتراك من قاعدة البيانات
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
  });

  // جلب اشتراك المستخدم الحالي
  const { data: currentSubscription } = useQuery<Subscription>({
    queryKey: ['/api/subscriptions'],
    enabled: !!user,
  });

  const createSubscription = useMutation({
    mutationFn: async (planData: any) => {
      console.log('📤 Sending subscription data:', planData);
      const response = await apiRequest('POST', '/api/subscriptions', planData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في إنشاء الاشتراك');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: '✅ تم إنشاء الاشتراك بنجاح',
        description: 'سيتم توجيهك لصفحة الدفع',
      });
      // سيتم إنشاء الاشتراك الفعلي عند إتمام الدفع في صفحة checkout
      const selectedPlan = data.plans?.find((p: any) => p.id === plan.id) || plan;
      navigate(`/checkout?planId=${selectedPlan.id}&planName=${selectedPlan.nameAr}&planPrice=${isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}&billingCycle=${isYearly ? 'yearly' : 'monthly'}`);
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ في الاشتراك',
        description: error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    },
  });

  const handleSubscribe = (plan: any) => {
    if (!user) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يجب تسجيل الدخول أولاً للاشتراك',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    // الذهاب مباشرة لصفحة الدفع دون إنشاء اشتراك مسبقاً
    const billingCycle = isYearly ? 'yearly' : 'monthly';
    const amount = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    
    navigate(`/checkout?planId=${plan.id}&planName=${plan.nameAr}&planPrice=${amount}&billingCycle=${billingCycle}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getPrice = (plan: any) => {
    if (isYearly) {
      return parseFloat(plan.yearlyPrice || '0');
    } else {
      return parseFloat(plan.monthlyPrice || '0');
    }
  };

  const getSavings = (plan: any) => {
    const monthlyPrice = parseFloat(plan.monthlyPrice || '0');
    const yearlyPrice = parseFloat(plan.yearlyPrice || '0');
    return Math.round((monthlyPrice * 12) - yearlyPrice);
  };

  return (
    <div className="relative max-w-7xl mx-auto stable-container smooth-transform">
      {/* مفتاح التبديل بين الشهري والسنوي */}
      <div className="flex items-center justify-center mb-12 p-6 backdrop-blur-lg bg-white/20 dark:bg-gray-800/20 rounded-3xl border border-white/30 dark:border-gray-700/30 shadow-2xl">
        <div className="flex items-center space-x-6 space-x-reverse">
          <Label htmlFor="yearly-toggle" className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            💰 شهري
          </Label>
          <div className="relative">
            <Switch
              id="yearly-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="h-8 w-16"
            />
            {isYearly && (
              <Badge className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse">
                وفر 20%
              </Badge>
            )}
          </div>
          <Label htmlFor="yearly-toggle" className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            🎯 سنوي
          </Label>
        </div>
      </div>

      {/* عرض الخطط */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan: any) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden smooth-transition smooth-transform hover:scale-[1.02] hover:shadow-2xl backdrop-blur-lg border-2 ${
              plan.name === 'Premium'
                ? 'border-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-indigo-50/50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-indigo-900/30 shadow-2xl transform scale-[1.02]'
                : 'border-white/30 dark:border-gray-700/30 bg-white/30 dark:bg-gray-800/30'
            }`}
            style={plan.name === 'Premium' ? {
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(99, 102, 241, 0.1) 100%)',
              borderImage: 'linear-gradient(135deg, #a855f7, #ec4899, #6366f1) 1'
            } : {}}
          >
            {/* شارة الأكثر شيوعاً */}
            {plan.name === 'Premium' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white px-6 py-2 text-sm font-bold shadow-lg animate-pulse">
                  ⭐ الأكثر شيوعاً
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                {plan.nameAr || plan.name}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {plan.description}
              </p>
              
              {/* السعر */}
              <div className="mt-4">
                <div className="flex items-baseline justify-center space-x-2 space-x-reverse">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${getPrice(plan)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    / {isYearly ? 'سنة' : 'شهر'}
                  </span>
                </div>
                
                {isYearly && getSavings(plan) > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 line-through">
                      ${parseFloat(plan.monthlyPrice || '0') * 12}/سنة
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      وفر ${getSavings(plan)} سنوياً
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* المميزات */}
              <div className="space-y-3 mb-6">
                {(plan.features || []).map((feature: any, index: any) => (
                  <div key={index} className="flex items-center space-x-3 space-x-reverse">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* زر الاشتراك */}
              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={createSubscription.isPending || (currentSubscription && currentSubscription.planId === plan.id)}
                className={`w-full py-3 font-bold text-lg transition-all duration-300 ${
                  plan.name === 'Premium'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {createSubscription.isPending ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري المعالجة...</span>
                  </div>
                ) : currentSubscription && currentSubscription.planId === plan.id ? (
                  '✅ مُفعّل حالياً'
                ) : (
                  `🚀 ابدأ الآن`
                )}
              </Button>

              {/* معلومات إضافية للخطة المميزة */}
              {plan.name === 'Premium' && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-purple-700 dark:text-purple-300">
                    <Star className="w-4 h-4" />
                    <span className="font-semibold">الخيار الأمثل للمتداولين المحترفين</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* طرق الدفع المتاحة */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          💳 طرق الدفع المتاحة
        </h3>
        <div className="flex justify-center items-center flex-wrap gap-6">
          <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300">
            <img src={vodafoneLogo} alt="Vodafone Cash" className="w-8 h-8 object-contain" />
            <span className="font-medium">فودافون كاش</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300">
            <img src={instapayLogo} alt="InstaPay" className="w-8 h-8 object-contain" />
            <span className="font-medium">إنستاباي</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300">
            <FaStripe className="w-8 h-8 text-purple-600" />
            <span className="font-medium">Stripe</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300">
            <FaPaypal className="w-8 h-8 text-blue-600" />
            <span className="font-medium">PayPal</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300">
            <FaCreditCard className="w-8 h-8 text-green-600" />
            <span className="font-medium">بطاقة ائتمان</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300">
            <FaUniversity className="w-8 h-8 text-orange-600" />
            <span className="font-medium">تحويل بنكي</span>
          </div>
        </div>
      </div>

      {/* ضمان استرداد المال */}
      <div className="mt-12 text-center p-6 backdrop-blur-lg bg-green-50/50 dark:bg-green-900/20 rounded-3xl border border-green-200 dark:border-green-700">
        <div className="flex items-center justify-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-green-800 dark:text-green-200">
              ضمان استرداد المال خلال 30 يوم
            </h4>
            <p className="text-green-600 dark:text-green-300">
              إذا لم تكن راضياً تماماً، سنرد لك أموالك بالكامل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}