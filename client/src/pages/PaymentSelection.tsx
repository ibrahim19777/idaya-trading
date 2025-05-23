import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, Building2, Percent, Check } from 'lucide-react';
import paypalLogoPath from '@assets/transparent-hd-paypal-logo-701751694777788ilpzr3lary.png';
import vodafoneCashLogoPath from '@assets/VF Cash Logo - (RED).png';
import instapayLogoPath from '@assets/InstaPay Logo-01.png';
import { useQuery } from '@tanstack/react-query';

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  icon: any;
  description: string;
  descriptionAr: string;
  type: 'online' | 'local';
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'instapay',
    name: 'InstaPay',
    nameAr: 'إنستا باي',
    icon: instapayLogoPath,
    description: 'Pay instantly with InstaPay service',
    descriptionAr: 'ادفع فوراً باستخدام خدمة إنستا باي',
    type: 'local'
  },
  {
    id: 'vodafone',
    name: 'Vodafone Cash',
    nameAr: 'فودافون كاش',
    icon: vodafoneCashLogoPath,
    description: 'Pay with Vodafone Cash mobile wallet',
    descriptionAr: 'ادفع باستخدام محفظة فودافون كاش الإلكترونية',
    type: 'local'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameAr: 'باي بال',
    icon: paypalLogoPath,
    description: 'Pay securely with your PayPal account',
    descriptionAr: 'ادفع بأمان باستخدام حساب PayPal الخاص بك',
    type: 'online'
  },
  {
    id: 'stripe',
    name: 'Credit Card',
    nameAr: 'بطاقة ائتمان',
    icon: CreditCard,
    description: 'Pay with Visa, Mastercard, or American Express',
    descriptionAr: 'ادفع باستخدام فيزا أو ماستركارد أو أمريكان إكسبرس',
    type: 'online'
  }
];

export default function PaymentSelection() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/payment/:planId');
  const { toast } = useToast();
  
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [discountCode, setDiscountCode] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [finalAmount, setFinalAmount] = useState(0);

  // Get subscription plan details
  const { data: plans } = useQuery({
    queryKey: ['/api/subscription-plans'],
  });

  const selectedPlan = plans?.find((plan: any) => plan.id === parseInt(params?.planId || '0'));

  // دالة لحساب السعر الأساسي
  const getBasePrice = () => {
    if (!selectedPlan) return 0;
    
    if (selectedPlan.monthlyPrice) {
      return parseFloat(selectedPlan.monthlyPrice);
    } else if (selectedPlan.price) {
      return parseFloat(selectedPlan.price);
    } else {
      // استخدام السعر الافتراضي حسب نوع الخطة
      switch(selectedPlan.name.toLowerCase()) {
        case 'basic':
          return 29.99;
        case 'premium':
          return 59.99;
        case 'enterprise':
          return 99.99;
        default:
          return 29.99;
      }
    }
  };

  useEffect(() => {
    if (selectedPlan) {
      calculateFinalAmount();
    }
  }, [selectedPlan, appliedDiscount]);

  const calculateFinalAmount = () => {
    if (!selectedPlan) return;
    
    let amount = getBasePrice();
    
    if (appliedDiscount) {
      const discountAmount = (amount * appliedDiscount.discount) / 100;
      amount = amount - discountAmount;
    }
    setFinalAmount(amount);
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return;
    
    setIsValidatingCode(true);
    try {
      const response = await fetch(`/api/discount-codes/${discountCode}`);
      if (response.ok) {
        const discount = await response.json();
        setAppliedDiscount(discount);
        toast({
          title: "تم تطبيق كود الخصم بنجاح!",
          description: `خصم ${discount.discount}% تم تطبيقه على المبلغ`,
        });
      } else {
        toast({
          title: "كود خصم غير صالح",
          description: "يرجى التحقق من الكود والمحاولة مرة أخرى",
          variant: "destructive",
        });
        setAppliedDiscount(null);
      }
    } catch (error) {
      toast({
        title: "خطأ في التحقق من كود الخصم",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCode(false);
    }
  };

  const removeDiscountCode = () => {
    setDiscountCode('');
    setAppliedDiscount(null);
  };

  const proceedToPayment = () => {
    if (!selectedMethod) {
      toast({
        title: "يرجى اختيار طريقة دفع",
        description: "اختر طريقة الدفع المناسبة لك",
        variant: "destructive",
      });
      return;
    }

    // Navigate to appropriate payment page with all data
    const paymentData = {
      planId: params?.planId,
      method: selectedMethod,
      discountCode: appliedDiscount?.code || null,
      finalAmount: finalAmount
    };

    // Store payment data in sessionStorage for the payment page
    sessionStorage.setItem('paymentData', JSON.stringify(paymentData));

    if (selectedMethod === 'stripe' || selectedMethod === 'paypal') {
      navigate(`/checkout?method=${selectedMethod}&plan=${params?.planId}&discount=${appliedDiscount?.code || ''}`);
    } else {
      navigate(`/invoice?method=${selectedMethod}&plan=${params?.planId}&discount=${appliedDiscount?.code || ''}`);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">جاري تحميل بيانات الخطة...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">اختر طريقة الدفع</h1>
        <p className="text-muted-foreground text-center">
          أكمل اشتراكك في خطة {selectedPlan.nameAr}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                طرق الدفع المتاحة
              </CardTitle>
              <CardDescription>
                اختر الطريقة الأنسب لك لإتمام عملية الدفع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {method.id === 'vodafone' ? (
                          <img 
                            src="/assets/VF Cash Logo - (RED).png" 
                            alt="Vodafone Cash" 
                            className="w-6 h-4 object-contain"
                          />
                        ) : method.id === 'instapay' ? (
                          <img 
                            src="/assets/InstaPay Logo-01.png" 
                            alt="InstaPay" 
                            className="w-8 h-4 object-contain"
                          />
                        ) : method.id === 'paypal' ? (
                          <img 
                            src="/assets/transparent-hd-paypal-logo-701751694777788ilpzr3lary.png" 
                            alt="PayPal" 
                            className="w-8 h-4 object-contain"
                          />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{method.nameAr}</h3>
                          <Badge variant={method.type === 'online' ? 'default' : 'secondary'}>
                            {method.type === 'online' ? 'فوري' : 'محلي'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.descriptionAr}
                        </p>
                      </div>
                      {selectedMethod === method.id && (
                        <div className="text-primary">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Discount Code */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                كود الخصم (اختياري)
              </CardTitle>
              <CardDescription>
                لديك كود خصم؟ أدخله هنا للحصول على سعر أفضل
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!appliedDiscount ? (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="discount">كود الخصم</Label>
                    <Input
                      id="discount"
                      placeholder="أدخل كود الخصم"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && validateDiscountCode()}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={validateDiscountCode}
                      disabled={!discountCode.trim() || isValidatingCode}
                    >
                      {isValidatingCode ? 'جاري التحقق...' : 'تطبيق'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      تم تطبيق كود الخصم: {appliedDiscount.code}
                    </span>
                    <Badge variant="secondary">{appliedDiscount.discount}% خصم</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeDiscountCode}
                    className="text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    إزالة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedPlan.nameAr}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedPlan.descriptionAr}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>السعر الأساسي</span>
                    <span>${getBasePrice()}</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>خصم ({appliedDiscount.discount}%)</span>
                      <span>-${((getBasePrice() * appliedDiscount.discount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>المجموع النهائي</span>
                    <span>${finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={proceedToPayment}
                disabled={!selectedMethod}
              >
                متابعة الدفع
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/subscriptions')}
              >
                العودة للخطط
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}