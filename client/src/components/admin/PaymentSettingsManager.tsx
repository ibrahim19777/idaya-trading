import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Save, CreditCard, Smartphone, Building2, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscountCodesManager } from './DiscountCodesManager';

export function PaymentSettingsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // جلب الإعدادات المحفوظة
  const { data: savedSettings } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
    retry: false,
  });

  // إعدادات الدفع المحلي
  const [localPaymentSettings, setLocalPaymentSettings] = useState({
    vodafone: {
      enabled: true,
      number: '01115000273',
      instructions: 'اتصل بـ *9*رقم المحفظة*المبلغ# أو حول المبلغ للرقم المذكور',
      name: 'فودافون كاش'
    },
    instapay: {
      enabled: true,
      number: '01115000273',
      instructions: 'حول المبلغ للرقم المذكور عبر انستاباي وارفق لقطة شاشة',
      name: 'انستاباي'
    },
    bank: {
      enabled: true,
      bankName: 'البنك الأهلي المصري',
      accountNumber: '1234567890123',
      accountName: 'شركة إداية للتقنية',
      swiftCode: 'NBEGEGCX',
      instructions: 'قم بالتحويل للحساب المذكور وارفق إيصال التحويل'
    },
    whatsapp: '01115000273',
    supportEmail: 'support@idaya.com',
    location: 'القاهرة، مصر',
    workingHours: {
      weekdays: '9:00 ص - 6:00 م',
      weekends: '10:00 ص - 4:00 م'
    },
    tax: {
      enabled: false,
      rate: 0,
      name: 'ضريبة القيمة المضافة',
      description: 'سيتم إضافة الضريبة للمبلغ الإجمالي'
    }
  });

  // إعدادات البوابات الإلكترونية
  const [gatewaySettings, setGatewaySettings] = useState({
    stripe: {
      enabled: false,
      publicKey: '',
      webhookSecret: ''
    },
    paypal: {
      enabled: false,
      environment: 'sandbox' // sandbox or live
    }
  });

  // تحديث الإعدادات عند جلب البيانات المحفوظة
  useEffect(() => {
    if (savedSettings && Object.keys(savedSettings).length > 0) {
      console.log('📥 تحديث الإعدادات من الخادم:', savedSettings);
      // تحديث البيانات المحلية بالبيانات المحفوظة فقط
      setLocalPaymentSettings(savedSettings);
      setHasUnsavedChanges(false);
    }
  }, [savedSettings]);

  // حفظ إعدادات الدفع المحلي
  const saveLocalSettingsMutation = useMutation({
    mutationFn: (settings: any) => 
      apiRequest('POST', '/api/admin/payment-settings/local', settings),
    onSuccess: async (response, variables) => {
      setHasUnsavedChanges(false);
      
      // تحديث البيانات المحلية مباشرة بالقيم المحفوظة
      console.log('🔄 تحديث البيانات المحلية بعد الحفظ:', variables);
      setLocalPaymentSettings(variables);
      
      // إعادة تحميل الإعدادات من الخادم أيضاً
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      
      toast({
        title: "✅ تم حفظ الإعدادات بنجاح",
        description: "تم تحديث إعدادات الدفع المحلي بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast({
        title: "❌ خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات. حاول مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  // حفظ إعدادات البوابات الإلكترونية
  const saveGatewaySettingsMutation = useMutation({
    mutationFn: (settings: any) => 
      apiRequest('POST', '/api/admin/payment-settings/gateways', settings),
    onSuccess: () => {
      toast({
        title: "✅ تم حفظ إعدادات البوابات",
        description: "تم تحديث إعدادات الدفع الإلكتروني",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ إعدادات البوابات",
        variant: "destructive",
      });
    }
  });

  // دالة حفظ إعدادات الشركة
  const saveLocalSettings = () => {
    saveLocalSettingsMutation.mutate(localPaymentSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إعدادات طرق الدفع</h2>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span className="text-sm text-gray-600">تحكم كامل في طرق الدفع</span>
        </div>
      </div>

      <Tabs defaultValue="local" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="local">الدفع المحلي</TabsTrigger>
          <TabsTrigger value="gateways">البوابات الإلكترونية</TabsTrigger>
          <TabsTrigger value="tax">الضرائب</TabsTrigger>
          <TabsTrigger value="company">معلومات الشركة</TabsTrigger>
          <TabsTrigger value="discounts">أكواد الخصم</TabsTrigger>
        </TabsList>

        {/* الدفع المحلي */}
        <TabsContent value="local">
          <div className="grid gap-6">
            {/* فودافون كاش */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/assets/VF Cash Logo - (RED).png" 
                      alt="Vodafone Cash" 
                      className="h-6 w-10 object-contain"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">فودافون كاش</span>
                      <span className="text-xs text-gray-500">Vodafone Cash</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={localPaymentSettings.vodafone.enabled}
                      onCheckedChange={(checked) => 
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          vodafone: { ...prev.vodafone, enabled: checked }
                        }))
                      }
                      className="data-[state=checked]:bg-blue-600 transition-all duration-300 ease-in-out"
                    />
                    <span className={`text-sm font-bold px-4 py-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      localPaymentSettings.vodafone.enabled 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {localPaymentSettings.vodafone.enabled ? '🟢 مُفعل' : '🔴 مُعطل'}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vodafone-number">رقم المحفظة</Label>
                  <Input
                    id="vodafone-number"
                    value={localPaymentSettings.vodafone.number}
                    onChange={(e) => 
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        vodafone: { ...prev.vodafone, number: e.target.value }
                      }))
                    }
                    placeholder="01xxxxxxxxx"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vodafone-instructions">تعليمات الدفع</Label>
                  <Textarea
                    id="vodafone-instructions"
                    value={localPaymentSettings.vodafone.instructions}
                    onChange={(e) => 
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        vodafone: { ...prev.vodafone, instructions: e.target.value }
                      }))
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* انستاباي */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/assets/InstaPay Logo-01.png" 
                      alt="InstaPay" 
                      className="h-6 w-12 object-contain"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">انستاباي</span>
                      <span className="text-xs text-gray-500">InstaPay</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={localPaymentSettings.instapay.enabled}
                      onCheckedChange={(checked) => 
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          instapay: { ...prev.instapay, enabled: checked }
                        }))
                      }
                      className="data-[state=checked]:bg-blue-600 transition-all duration-300 ease-in-out"
                    />
                    <span className={`text-sm font-bold px-4 py-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      localPaymentSettings.instapay.enabled 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {localPaymentSettings.instapay.enabled ? '🟢 مُفعل' : '🔴 مُعطل'}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="instapay-number">رقم المحفظة</Label>
                  <Input
                    id="instapay-number"
                    value={localPaymentSettings.instapay.number}
                    onChange={(e) => 
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        instapay: { ...prev.instapay, number: e.target.value }
                      }))
                    }
                    placeholder="01xxxxxxxxx"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="instapay-instructions">تعليمات الدفع</Label>
                  <Textarea
                    id="instapay-instructions"
                    value={localPaymentSettings.instapay.instructions}
                    onChange={(e) => 
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        instapay: { ...prev.instapay, instructions: e.target.value }
                      }))
                    }
                    placeholder="تعليمات الدفع عبر انستاباي"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* التحويل البنكي */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <span>التحويل البنكي</span>
                  <Switch 
                    checked={localPaymentSettings.bank.enabled}
                    onCheckedChange={(checked) => 
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        bank: { ...prev.bank, enabled: checked }
                      }))
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank-name">اسم البنك</Label>
                    <Input
                      id="bank-name"
                      value={localPaymentSettings.bank.bankName}
                      onChange={(e) => 
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          bank: { ...prev.bank, bankName: e.target.value }
                        }))
                      }
                      placeholder="البنك الأهلي المصري"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-number">رقم الحساب</Label>
                    <Input
                      id="account-number"
                      value={localPaymentSettings.bank.accountNumber}
                      onChange={(e) => 
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          bank: { ...prev.bank, accountNumber: e.target.value }
                        }))
                      }
                      placeholder="1234567890123"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account-name">اسم صاحب الحساب</Label>
                    <Input
                      id="account-name"
                      value={localPaymentSettings.bank.accountName}
                      onChange={(e) => 
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          bank: { ...prev.bank, accountName: e.target.value }
                        }))
                      }
                      placeholder="شركة إداية للتقنية"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="swift-code">رمز Swift (اختياري)</Label>
                    <Input
                      id="swift-code"
                      value={localPaymentSettings.bank.swiftCode}
                      onChange={(e) => 
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          bank: { ...prev.bank, swiftCode: e.target.value }
                        }))
                      }
                      placeholder="NBEGEGCX"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bank-instructions">تعليمات التحويل</Label>
                  <Textarea
                    id="bank-instructions"
                    value={localPaymentSettings.bank.instructions}
                    onChange={(e) => 
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        bank: { ...prev.bank, instructions: e.target.value }
                      }))
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* إعدادات PayPal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span>إعدادات PayPal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paypal-email">البريد الإلكتروني لـ PayPal</Label>
                  <Input
                    id="paypal-email"
                    value={localPaymentSettings.paypal?.email || ''}
                    onChange={(e) => 
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        paypal: { ...prev.paypal, email: e.target.value }
                      }))
                    }
                    placeholder="your-paypal@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="paypal-instructions">تعليمات الدفع عبر PayPal</Label>
                  <Textarea
                    id="paypal-instructions"
                    value={localPaymentSettings.paypal?.instructions || ''}
                    onChange={(e) => 
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        paypal: { ...prev.paypal, instructions: e.target.value }
                      }))
                    }
                    placeholder="قم بالدفع عبر PayPal إلى البريد الإلكتروني المحدد أعلاه"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* معلومات الدعم */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الدعم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="whatsapp">رقم الواتساب</Label>
                    <Input
                      id="whatsapp"
                      value={localPaymentSettings.whatsapp}
                      onChange={(e) => {
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          whatsapp: e.target.value
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="01000000000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="support-email">بريد الدعم</Label>
                    <Input
                      id="support-email"
                      value={localPaymentSettings.supportEmail}
                      onChange={(e) => {
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          supportEmail: e.target.value
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="support@idaya.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {/* الموقع */}
                <div>
                  <Label htmlFor="location">موقع الشركة</Label>
                  <Input
                    id="location"
                    value={localPaymentSettings.location}
                    onChange={(e) => {
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        location: e.target.value
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="القاهرة، مصر"
                    className="mt-1"
                  />
                </div>

                {/* ساعات العمل */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weekdays">ساعات العمل (الأسبوع)</Label>
                    <Input
                      id="weekdays"
                      value={localPaymentSettings.workingHours?.weekdays || ''}
                      onChange={(e) => {
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          workingHours: { 
                            ...prev.workingHours, 
                            weekdays: e.target.value 
                          }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="9:00 ص - 6:00 م"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekends">ساعات العمل (عطل نهاية الأسبوع)</Label>
                    <Input
                      id="weekends"
                      value={localPaymentSettings.workingHours?.weekends || ''}
                      onChange={(e) => {
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          workingHours: { 
                            ...prev.workingHours, 
                            weekends: e.target.value 
                          }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="10:00 ص - 4:00 م"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => saveLocalSettingsMutation.mutate(localPaymentSettings)}
              disabled={saveLocalSettingsMutation.isPending}
              className="w-full"
              variant={hasUnsavedChanges ? "default" : "secondary"}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveLocalSettingsMutation.isPending 
                ? 'جاري الحفظ...' 
                : hasUnsavedChanges 
                  ? 'حفظ التغييرات' 
                  : 'الإعدادات محفوظة'}
            </Button>
          </div>
        </TabsContent>

        {/* إعدادات الضرائب */}
        <TabsContent value="tax">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">إعدادات الضريبة</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">تحديد نسبة الضريبة المضافة على الخدمات</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* تفعيل/إلغاء الضريبة */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">تفعيل الضريبة</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      عند التفعيل، ستُضاف الضريبة لجميع الخطط والاشتراكات
                    </p>
                  </div>
                  <Switch 
                    checked={localPaymentSettings.tax.enabled}
                    onCheckedChange={(checked) => {
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        tax: { ...prev.tax, enabled: checked }
                      }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                {/* اسم الضريبة */}
                <div>
                  <Label htmlFor="tax-name">اسم الضريبة</Label>
                  <Input
                    id="tax-name"
                    value={localPaymentSettings.tax.name}
                    onChange={(e) => {
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        tax: { ...prev.tax, name: e.target.value }
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="ضريبة القيمة المضافة"
                    className="mt-1"
                  />
                </div>

                {/* نسبة الضريبة */}
                <div>
                  <Label htmlFor="tax-rate">نسبة الضريبة (%)</Label>
                  <div className="mt-1 relative">
                    <Input
                      id="tax-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={localPaymentSettings.tax.rate}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          tax: { ...prev.tax, rate: value }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="0.00"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    مثال: 14 = 14% ضريبة قيمة مضافة
                  </p>
                </div>

                {/* وصف الضريبة */}
                <div>
                  <Label htmlFor="tax-description">وصف الضريبة (اختياري)</Label>
                  <Textarea
                    id="tax-description"
                    value={localPaymentSettings.tax.description}
                    onChange={(e) => {
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        tax: { ...prev.tax, description: e.target.value }
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="سيتم إضافة الضريبة للمبلغ الإجمالي حسب القوانين المحلية"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* معاينة المبلغ مع الضريبة */}
                {localPaymentSettings.tax.enabled && localPaymentSettings.tax.rate > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">معاينة الحساب</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>سعر الخطة الأساسية:</span>
                        <span>$100.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{localPaymentSettings.tax.name} ({localPaymentSettings.tax.rate}%):</span>
                        <span>${(100 * localPaymentSettings.tax.rate / 100).toFixed(2)}</span>
                      </div>
                      <hr className="border-blue-200 dark:border-blue-800" />
                      <div className="flex justify-between font-medium">
                        <span>المجموع الإجمالي:</span>
                        <span>${(100 + (100 * localPaymentSettings.tax.rate / 100)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={() => saveLocalSettingsMutation.mutate(localPaymentSettings)}
              disabled={saveLocalSettingsMutation.isPending}
              className="w-full"
              variant={hasUnsavedChanges ? "default" : "secondary"}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveLocalSettingsMutation.isPending 
                ? 'جاري حفظ إعدادات الضريبة...' 
                : hasUnsavedChanges 
                  ? 'حفظ إعدادات الضريبة' 
                  : 'إعدادات الضريبة محفوظة'}
            </Button>
          </div>
        </TabsContent>

        {/* أكواد الخصم */}
        <TabsContent value="discounts">
          <DiscountCodesManager />
        </TabsContent>

        {/* البوابات الإلكترونية */}
        <TabsContent value="gateways">
          <div className="grid gap-6">
            {/* Stripe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">Stripe</span>
                      <span className="text-xs text-gray-500">بوابة الدفع الإلكتروني</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={gatewaySettings.stripe.enabled}
                      onCheckedChange={(checked) => 
                        setGatewaySettings(prev => ({
                          ...prev,
                          stripe: { ...prev.stripe, enabled: checked }
                        }))
                      }
                    />
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      gatewaySettings.stripe.enabled 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {gatewaySettings.stripe.enabled ? 'مُفعل' : 'مُعطل'}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stripe-public">Stripe Public Key</Label>
                  <Input
                    id="stripe-public"
                    value={gatewaySettings.stripe.publicKey}
                    onChange={(e) => 
                      setGatewaySettings(prev => ({
                        ...prev,
                        stripe: { ...prev.stripe, publicKey: e.target.value }
                      }))
                    }
                    placeholder="pk_test_..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                  <Input
                    id="stripe-webhook"
                    value={gatewaySettings.stripe.webhookSecret}
                    onChange={(e) => 
                      setGatewaySettings(prev => ({
                        ...prev,
                        stripe: { ...prev.stripe, webhookSecret: e.target.value }
                      }))
                    }
                    placeholder="whsec_..."
                    className="mt-1"
                  />
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <p><strong>تعليمات:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>احصل على المفاتيح من لوحة تحكم Stripe</li>
                    <li>تأكد من إعداد webhooks للدفعات</li>
                    <li>استخدم مفاتيح الاختبار أولاً</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* PayPal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-blue-700 rounded text-white text-xs flex items-center justify-center">P</div>
                  <span>PayPal</span>
                  <Switch 
                    checked={gatewaySettings.paypal.enabled}
                    onCheckedChange={(checked) => 
                      setGatewaySettings(prev => ({
                        ...prev,
                        paypal: { ...prev.paypal, enabled: checked }
                      }))
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>البيئة</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="sandbox"
                        checked={gatewaySettings.paypal.environment === 'sandbox'}
                        onChange={(e) => 
                          setGatewaySettings(prev => ({
                            ...prev,
                            paypal: { ...prev.paypal, environment: e.target.value }
                          }))
                        }
                      />
                      <span>اختبار (Sandbox)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="live"
                        checked={gatewaySettings.paypal.environment === 'live'}
                        onChange={(e) => 
                          setGatewaySettings(prev => ({
                            ...prev,
                            paypal: { ...prev.paypal, environment: e.target.value }
                          }))
                        }
                      />
                      <span>مباشر (Live)</span>
                    </label>
                  </div>
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <p><strong>تعليمات:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>قم بإنشاء تطبيق في PayPal Developer</li>
                    <li>احصل على Client ID و Secret</li>
                    <li>اختبر في بيئة Sandbox أولاً</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => saveGatewaySettingsMutation.mutate(gatewaySettings)}
              disabled={saveGatewaySettingsMutation.isPending}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveGatewaySettingsMutation.isPending ? 'جاري الحفظ...' : 'حفظ إعدادات البوابات'}
            </Button>
          </div>
        </TabsContent>

        {/* معلومات الشركة */}
        <TabsContent value="company">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  معلومات الشركة والدعم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني للدعم</label>
                  <Input
                    value={localPaymentSettings.supportEmail}
                    onChange={(e) => {
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        supportEmail: e.target.value
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="support@idaya.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رقم الواتساب</label>
                  <Input
                    value={localPaymentSettings.whatsapp}
                    onChange={(e) => {
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        whatsapp: e.target.value
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="01115000273"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">موقع الشركة</label>
                  <Input
                    value={localPaymentSettings.location}
                    onChange={(e) => {
                      setLocalPaymentSettings(prev => ({
                        ...prev,
                        location: e.target.value
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="القاهرة، مصر"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ساعات العمل (الأحد - الخميس)</label>
                    <Input
                      value={localPaymentSettings.workingHours.weekdays}
                      onChange={(e) => {
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            weekdays: e.target.value
                          }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="9:00 ص - 6:00 م"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ساعات العمل (الجمعة - السبت)</label>
                    <Input
                      value={localPaymentSettings.workingHours.weekends}
                      onChange={(e) => {
                        setLocalPaymentSettings(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            weekends: e.target.value
                          }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="10:00 ص - 4:00 م"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <p><strong>ملاحظة:</strong> هذه المعلومات ستظهر في صفحة "اتصل بنا" للمستخدمين</p>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={saveLocalSettings}
              disabled={saveLocalSettingsMutation.isPending || !hasUnsavedChanges}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveLocalSettingsMutation.isPending ? 'جاري الحفظ...' : 'حفظ معلومات الشركة'}
              {hasUnsavedChanges && <span className="mr-1">●</span>}
            </Button>
          </div>
        </TabsContent>

        {/* أكواد الخصم */}
        <TabsContent value="discounts">
          <Card>
            <CardHeader>
              <CardTitle>إدارة أكواد الخصم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>سيتم إضافة إدارة أكواد الخصم قريباً...</p>
                <p className="text-sm mt-2">يمكنك إدارة أكواد الخصم من قسم "أكواد الخصم" في القائمة الجانبية</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}