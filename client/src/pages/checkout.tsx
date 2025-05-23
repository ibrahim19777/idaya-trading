import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FaStripe, FaPaypal, FaCreditCard, FaUniversity, FaMobile } from 'react-icons/fa';
import { ArrowLeft, Check, CreditCard, Upload, FileImage } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const paymentMethods = [
  { 
    id: 'instapay', 
    name: 'إنستا باي', 
    nameEn: 'InstaPay',
    icon: FaMobile, 
    color: 'text-orange-600',
    description: 'ادفع فوراً باستخدام خدمة إنستا باي'
  },
  { 
    id: 'vodafone', 
    name: 'فودافون كاش', 
    nameEn: 'Vodafone Cash',
    icon: FaMobile, 
    color: 'text-red-600',
    description: 'ادفع باستخدام محفظة فودافون كاش الإلكترونية'
  },
  { 
    id: 'paypal', 
    name: 'باي بال', 
    nameEn: 'PayPal',
    icon: FaPaypal, 
    color: 'text-blue-700',
    description: 'الخاص بك PayPal ادفع بأمان باستخدام حساب'
  },
  { 
    id: 'stripe', 
    name: 'بطاقة ائتمان', 
    nameEn: 'Credit/Debit Card',
    icon: FaCreditCard, 
    color: 'text-blue-600',
    description: 'ادفع بأمان باستخدام فيزا أو ماستركارد أو أمريكان إكسبريس'
  },
];

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [transactionNotes, setTransactionNotes] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب تفاصيل الخطة المختارة من URL params
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('planId');
  const planName = urlParams.get('planName');
  const planPrice = urlParams.get('planPrice');

  // جلب تفاصيل الخطة من قاعدة البيانات
  const { data: planDetails } = useQuery({
    queryKey: ['/api/subscription-plans', planId],
    enabled: !!planId,
  });

  // جلب إعدادات الدفع من الأدمن
  const { data: paymentSettings } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
  });

  // إضافة الترجمة
  const language = 'ar'; // يمكن جعلها ديناميكية لاحقاً

  // حساب السعر النهائي مع الخصم والضريبة
  const originalPrice = parseFloat(planPrice || '0');
  const discountAmount = appliedDiscount ? (originalPrice * appliedDiscount.discount / 100) : 0;
  const priceAfterDiscount = originalPrice - discountAmount;
  
  // حساب الضريبة من إعدادات الإدارة (إجبار التفعيل إذا كانت معطلة في الإعدادات)
  const serverTaxSettings = paymentSettings?.tax || { enabled: true, rate: 14, name: 'ضريبة القيمة المضافة', description: 'سيتم إضافة الضريبة للمبلغ الإجمالي' };
  const taxSettings = { ...serverTaxSettings, enabled: serverTaxSettings.enabled !== false };
  const taxAmount = taxSettings.enabled ? (priceAfterDiscount * taxSettings.rate / 100) : 0;
  const finalAmount = priceAfterDiscount + taxAmount;

  // تطبيق كود الخصم
  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setApplyingDiscount(true);
    try {
      const response = await apiRequest('POST', '/api/discount-codes/validate', {
        code: discountCode
      });
      
      if (response.ok) {
        const discount = await response.json();
        console.log('✅ تم تطبيق كود الخصم بنجاح:', discount);
        
        // تطبيق الخصم فوراً
        setAppliedDiscount(discount);
        setDiscountCode(''); // مسح حقل الإدخال
        
        toast({
          title: "✅ تم تطبيق كود الخصم بنجاح!",
          description: `تم الحصول على خصم ${discount.discount}% - وفرت $${(parseFloat(finalPlanPrice) * discount.discount / 100).toFixed(2)}`,
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        const error = await response.json();
        console.log('خطأ في كود الخصم:', error);
        toast({
          title: "كود خصم غير صالح",
          description: error.message || "يرجى التحقق من كود الخصم والمحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في تطبيق كود الخصم",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setApplyingDiscount(false);
    }
  };

  // معالجة رفع الإيصال
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        toast({
          title: "نوع ملف غير مدعوم",
          description: "يرجى رفع صورة فقط (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // التحقق من حجم الملف (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير",
          description: "يرجى رفع صورة أصغر من 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      setReceiptFile(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // معالجة الدفع
  const processPayment = async (method: string) => {
    if (!user || !planId) return;

    // للطرق المحلية، تأكد من رفع الإيصال
    if ((method === 'vodafone' || method === 'instapay' || method === 'bank') && !receiptFile) {
      toast({
        title: "إيصال الدفع مطلوب",
        description: "يرجى رفع صورة إيصال الدفع أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      if (method === 'stripe') {
        // إنشاء جلسة Stripe
        const response = await apiRequest('POST', '/api/payments/stripe/create-session', {
          planId: parseInt(planId),
          planName: planName,
          amount: planPrice,
          userId: user.id
        });
        
        if (response.url) {
          window.location.href = response.url;
        }
      } else if (method === 'paypal') {
        // إنشاء طلب PayPal
        const response = await apiRequest('POST', '/api/payments/paypal/create-order', {
          planId: parseInt(planId),
          planName: planName,
          amount: planPrice,
          userId: user.id
        });
        
        if (response.approvalUrl) {
          window.location.href = response.approvalUrl;
        }
      } else if (method === 'vodafone' || method === 'instapay' || method === 'bank') {
        // للطرق المحلية - رفع الإيصال وإنشاء اشتراك بانتظار الموافقة
        const formData = new FormData();
        formData.append('planId', finalPlanId);
        formData.append('planName', finalPlanName);
        // حساب المبلغ النهائي مع الخصم والضريبة
        const finalAmountWithTax = finalAmount; // finalAmount محسوب مسبقاً مع الخصم والضريبة
        formData.append('amount', finalAmountWithTax.toFixed(2));
        formData.append('userId', user.id.toString());
        formData.append('method', method);
        formData.append('status', 'pending');
        formData.append('notes', transactionNotes);
        formData.append('billingCycle', urlParams.get('billingCycle') || 'monthly');
        if (receiptFile) {
          formData.append('receipt', receiptFile);
        }

        // إنشاء الاشتراك بحالة pending أولاً
        const subscriptionResponse = await apiRequest('POST', '/api/subscriptions', {
          userId: user.id,
          planId: parseInt(finalPlanId),
          plan: planDetails?.planType || 'basic',
          billingCycle: urlParams.get('billingCycle') || 'monthly',
          amount: finalAmount.toString(), // استخدام المبلغ النهائي بعد الخصم والضريبة
          status: 'pending'
        });
        
        const subscriptionData = await subscriptionResponse.json();
        
        // ربط الدفعة بالاشتراك مع بيانات كاملة
        formData.append('userId', user.id.toString()); // رقم المستخدم
        formData.append('subscriptionId', subscriptionData.id.toString());
        formData.append('userName', user.name || user.email); // اسم المستخدم
        formData.append('userEmail', user.email); // إيميل المستخدم
        formData.append('planName', finalPlanName); // اسم الباقة
        formData.append('amount', finalAmount.toString()); // المبلغ الإجمالي
        formData.append('method', selectedMethod); // طريقة الدفع
        
        // إنشاء دفعة وإرسال الإيصال
        await apiRequest('POST', '/api/payments/manual-with-receipt', formData);

        toast({
          title: "✅ تم إرسال طلب الدفع بنجاح!",
          description: "تم رفع الإيصال وسيقوم الإدارة بمراجعته وتفعيل الاشتراك خلال 24 ساعة",
          duration: 5000,
        });

        // التوجه للوحة التحكم مع عرض رسالة النجاح
        setTimeout(() => {
          setLocation('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "خطأ في عملية الدفع",
        description: error.message || "حدث خطأ أثناء معالجة الدفع",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // حساب السعر الصحيح للخطة
  const calculatePlanPrice = () => {
    if (planPrice && planPrice !== '0') return planPrice;
    
    // أسعار افتراضية للخطط حسب الـ ID
    const defaultPrices = {
      '1': 0,    // Trial
      '2': 99,   // Basic  
      '3': 199,  // Premium
      '4': 399   // Enterprise
    };
    
    const currentPlanId = planId || urlParams.get('planId') || '2';
    const billingCycle = urlParams.get('billingCycle') || 'monthly';
    
    let basePrice = defaultPrices[currentPlanId] || 99;
    
    if (billingCycle === 'yearly' && basePrice > 0) {
      basePrice = Math.round(basePrice * 12 * 0.8); // خصم 20% للسنوي
    }
    
    return basePrice.toString();
  };

  // استخدام قيم افتراضية إذا لم تكن متوفرة في URL
  const finalPlanId = planId || '1';
  const finalPlanName = planName || planDetails?.nameAr || 'أساسي';
  const finalPlanPrice = calculatePlanPrice();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/subscriptions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للباقات
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">إتمام عملية الدفع</h1>
        <p className="text-gray-600 mt-2">اختر طريقة الدفع المناسبة لك</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* تفاصيل الطلب */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>الخطة:</span>
                <span className="font-medium">{finalPlanName}</span>
              </div>
              <div className="flex justify-between">
                <span>السعر:</span>
                <span className="font-bold text-lg">${finalPlanPrice}/شهر</span>
              </div>
              
              {/* حقل كود الخصم */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder={language === 'ar' ? 'أدخل كود الخصم' : 'Enter discount code'}
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={applyDiscount}
                    disabled={!discountCode.trim() || applyingDiscount}
                  >
                    {applyingDiscount ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    ) : (
                      language === 'ar' ? 'تطبيق' : 'Apply'
                    )}
                  </Button>
                </div>
                
                {appliedDiscount && appliedDiscount.discount && (
                  <div className="flex justify-between text-green-600 font-medium bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <span>✅ خصم {appliedDiscount.discount}% مطبق:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* عرض الضريبة */}
                {taxSettings.enabled && taxAmount > 0 && (
                  <div className="flex justify-between text-orange-600 font-medium bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    <span>📊 {taxSettings.name} ({taxSettings.rate}%):</span>
                    <span>+${taxAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* تفصيل الحساب */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>السعر الأساسي:</span>
                  <span>${originalPrice.toFixed(2)}</span>
                </div>
                
                {appliedDiscount && discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم ({appliedDiscount.discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {taxSettings.enabled && taxAmount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>{taxSettings.name} ({taxSettings.rate}%):</span>
                    <span>+${taxAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>المجموع الإجمالي:</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
              
              {planDetails && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">مميزات الخطة:</h4>
                  <ul className="space-y-1 text-sm">
                    {(planDetails.features || []).map((feature: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* طرق الدفع */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>اختر طريقة الدفع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedMethod === method.id 
                        ? 'border-primary ring-2 ring-primary ring-opacity-20' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => {
                      console.log('اختيار طريقة الدفع:', method.id);
                      setSelectedMethod(method.id);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <method.icon className={`h-8 w-8 ${method.color}`} />
                        <div className="flex-1">
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        {selectedMethod === method.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* عرض المنطقة دائماً للاختبار */}
              {selectedMethod && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded mb-2 text-sm">
                  طريقة الدفع المختارة: {selectedMethod}
                </div>
              )}
              
              {(selectedMethod === 'vodafone' || selectedMethod === 'instapay') && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                  {selectedMethod === 'vodafone' && (
                    <div>
                      <h4 className="font-medium mb-2">تعليمات الدفع عبر فودافون كاش:</h4>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border mb-4">
                        <div className="text-lg font-bold text-red-600 mb-2">
                          رقم الهاتف: {paymentSettings?.vodafone?.number || '01115000273'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {paymentSettings?.vodafone?.instructions || 'قم بتحويل المبلغ المطلوب إلى هذا الرقم'}
                        </div>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
                        <li>اتصل بـ *9*{paymentSettings?.vodafone?.number || '01115000273'}*{planPrice}#</li>
                        <li>أو حول ${planPrice} للرقم: {paymentSettings?.vodafone?.number || '01115000273'}</li>
                        <li>احتفظ برسالة التأكيد</li>
                        <li>ارفع صورة الإيصال أدناه</li>
                      </ol>
                      
                      {/* رفع الإيصال */}
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="receipt-upload">رفع إيصال الدفع *</Label>
                          <Input
                            id="receipt-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            className="mt-1"
                          />
                        </div>
                        
                        {receiptPreview && (
                          <div className="mt-2">
                            <Label>معاينة الإيصال:</Label>
                            <img 
                              src={receiptPreview} 
                              alt="Receipt preview" 
                              className="mt-1 max-w-full h-32 object-contain border rounded"
                            />
                          </div>
                        )}
                        
                        <div>
                          <Label htmlFor="transaction-notes">ملاحظات إضافية (اختياري)</Label>
                          <Textarea
                            id="transaction-notes"
                            placeholder="أضف أي ملاحظات حول عملية الدفع..."
                            value={transactionNotes}
                            onChange={(e) => setTransactionNotes(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedMethod === 'instapay' && (
                    <div>
                      <h4 className="font-medium mb-2">تعليمات الدفع عبر InstaPay:</h4>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border mb-4">
                        <div className="text-lg font-bold text-orange-600 mb-2">
                          رقم الهاتف: {paymentSettings?.instapay?.number || '01126664422'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {paymentSettings?.instapay?.instructions || 'قم بتحويل المبلغ المطلوب إلى هذا الرقم'}
                        </div>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
                        <li>افتح تطبيق InstaPay</li>
                        <li>حول ${planPrice} للرقم: {paymentSettings?.instapay?.number || '01126664422'}</li>
                        <li>احتفظ برسالة التأكيد</li>
                        <li>ارفع صورة الإيصال أدناه</li>
                      </ol>
                      
                      {/* رفع الإيصال */}
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="receipt-upload">رفع إيصال الدفع *</Label>
                          <Input
                            id="receipt-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            className="mt-1"
                          />
                        </div>
                        
                        {receiptPreview && (
                          <div className="mt-2">
                            <Label>معاينة الإيصال:</Label>
                            <img 
                              src={receiptPreview} 
                              alt="Receipt preview" 
                              className="mt-1 max-w-full h-32 object-contain border rounded"
                            />
                          </div>
                        )}
                        
                        <div>
                          <Label htmlFor="transaction-notes">ملاحظات إضافية (اختياري)</Label>
                          <Textarea
                            id="transaction-notes"
                            placeholder="أضف أي ملاحظات حول عملية الدفع..."
                            value={transactionNotes}
                            onChange={(e) => setTransactionNotes(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedMethod === 'bank' && (
                    <div>
                      <h4 className="font-medium mb-2">تعليمات التحويل البنكي:</h4>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border mb-4">
                        <div className="text-sm space-y-2">
                          <div><strong>البنك:</strong> {paymentSettings?.bank?.bankName || 'البنك الأهلي المصري'}</div>
                          <div><strong>رقم الحساب:</strong> {paymentSettings?.bank?.accountNumber || '1234567890123'}</div>
                          <div><strong>اسم الحساب:</strong> {paymentSettings?.bank?.accountName || 'شركة إداية للتقنية'}</div>
                          <div><strong>المبلغ:</strong> ${planPrice}</div>
                          {paymentSettings?.bank?.swiftCode && (
                            <div><strong>SWIFT Code:</strong> {paymentSettings.bank.swiftCode}</div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                          {paymentSettings?.bank?.instructions || 'قم بتحويل المبلغ المطلوب إلى الحساب المذكور'}
                        </div>
                      </div>
                      
                      {/* رفع الإيصال */}
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="receipt-upload-bank">رفع إيصال التحويل *</Label>
                          <Input
                            id="receipt-upload-bank"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            className="mt-1"
                          />
                        </div>
                        
                        {receiptPreview && (
                          <div className="mt-2">
                            <Label>معاينة الإيصال:</Label>
                            <img 
                              src={receiptPreview} 
                              alt="Receipt preview" 
                              className="mt-1 max-w-full h-32 object-contain border rounded"
                            />
                          </div>
                        )}
                        
                        <div>
                          <Label htmlFor="transaction-notes-bank">ملاحظات إضافية (اختياري)</Label>
                          <Textarea
                            id="transaction-notes-bank"
                            placeholder="أضف أي ملاحظات حول عملية التحويل..."
                            value={transactionNotes}
                            onChange={(e) => setTransactionNotes(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedMethod === 'stripe' && (
                    <div>
                      <h4 className="font-medium mb-2">الدفع بالبطاقة الائتمانية:</h4>
                      <p className="text-sm">سيتم توجيهك لصفحة الدفع الآمن لإتمام العملية</p>
                    </div>
                  )}
                  
                  {selectedMethod === 'paypal' && (
                    <div>
                      <h4 className="font-medium mb-2">الدفع عبر PayPal:</h4>
                      <p className="text-sm">سيتم توجيهك لموقع PayPal لإتمام العملية</p>
                    </div>
                  )}
                </div>
              )}

              <Button 
                className="w-full"
                size="lg"
                disabled={!selectedMethod || isProcessing}
                onClick={() => selectedMethod && processPayment(selectedMethod)}
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>جاري المعالجة...</span>
                  </div>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    إتمام الدفع - ${planPrice}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}