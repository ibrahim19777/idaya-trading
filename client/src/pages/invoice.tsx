import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Download, FileText, Calendar, User, CreditCard } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Invoice() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [invoiceData, setInvoiceData] = useState<any>(null);

  // استخراج معرف الفاتورة من URL
  const urlParams = new URLSearchParams(window.location.search);
  const paymentId = urlParams.get('paymentId');

  // جلب تفاصيل الدفعة
  const { data: payment } = useQuery({
    queryKey: ['/api/payments', paymentId],
    enabled: !!paymentId,
  });

  useEffect(() => {
    if (payment) {
      setInvoiceData({
        invoiceNumber: `INV-${payment.id.toString().padStart(6, '0')}`,
        date: new Date(payment.createdAt || Date.now()).toLocaleDateString('ar-EG'),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-EG'),
        payment: payment
      });
    }
  }, [payment]);

  const downloadInvoice = () => {
    // إنشاء محتوى الفاتورة للتحميل
    const invoiceContent = `
فاتورة منصة إداية للتداول الذكي
=====================================

رقم الفاتورة: ${invoiceData.invoiceNumber}
تاريخ الإصدار: ${invoiceData.date}
تاريخ الاستحقاق: ${invoiceData.dueDate}

بيانات العميل:
الاسم: ${user?.name}
البريد الإلكتروني: ${user?.email}

تفاصيل الطلب:
الخطة: ${payment?.plan}
المبلغ: $${payment?.amount}
حالة الدفع: ${payment?.status === 'completed' ? 'مكتمل' : payment?.status === 'pending' ? 'في الانتظار' : 'ملغي'}
طريقة الدفع: ${payment?.method}

الإجمالي: $${payment?.amount}

شكراً لاختيارك منصة إداية!
`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `فاتورة-${invoiceData.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!paymentId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">فاتورة غير موجودة</h2>
            <p className="text-gray-600 mb-4">لم يتم العثور على الفاتورة المطلوبة</p>
            <Button onClick={() => setLocation('/dashboard')}>
              العودة للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>جاري تحميل الفاتورة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* رأس الصفحة */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">الفاتورة</h1>
          <p className="text-gray-600 mt-2">فاتورة رقم: {invoiceData.invoiceNumber}</p>
        </div>
        <div className="space-x-2">
          <Button onClick={downloadInvoice} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تحميل الفاتورة
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* محتوى الفاتورة */}
      <Card className="print:shadow-none">
        <CardHeader className="bg-primary text-white print:bg-black print:text-black">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">منصة إداية</CardTitle>
              <p className="text-blue-100 print:text-gray-600">منصة التداول الذكي المدعومة بالذكاء الاصطناعي</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 print:text-gray-600">www.idaya.com</p>
              <p className="text-blue-100 print:text-gray-600">support@idaya.com</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* معلومات الفاتورة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                بيانات العميل
              </h3>
              <div className="space-y-2">
                <p><strong>الاسم:</strong> {user?.name}</p>
                <p><strong>البريد الإلكتروني:</strong> {user?.email}</p>
                <p><strong>معرف العميل:</strong> #{user?.id}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                تفاصيل الفاتورة
              </h3>
              <div className="space-y-2">
                <p><strong>رقم الفاتورة:</strong> {invoiceData.invoiceNumber}</p>
                <p><strong>تاريخ الإصدار:</strong> {invoiceData.date}</p>
                <p><strong>تاريخ الاستحقاق:</strong> {invoiceData.dueDate}</p>
                <Badge variant={payment?.status === 'completed' ? 'default' : payment?.status === 'pending' ? 'secondary' : 'destructive'}>
                  {payment?.status === 'completed' ? 'مدفوع' : payment?.status === 'pending' ? 'في الانتظار' : 'ملغي'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* تفاصيل الطلب */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              تفاصيل الطلب
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2">الوصف</th>
                    <th className="text-center py-2">الكمية</th>
                    <th className="text-right py-2">السعر</th>
                    <th className="text-right py-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3">
                      <div>
                        <p className="font-medium">خطة {payment?.plan}</p>
                        <p className="text-sm text-gray-600">اشتراك شهري في منصة إداية للتداول</p>
                      </div>
                    </td>
                    <td className="text-center py-3">1</td>
                    <td className="py-3">${payment?.amount}</td>
                    <td className="py-3 font-medium">${payment?.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Separator className="my-6" />

          {/* الإجمالي */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>${payment?.amount}</span>
              </div>
              <div className="flex justify-between">
                <span>الضرائب:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span>-$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي:</span>
                <span>${payment?.amount}</span>
              </div>
            </div>
          </div>

          {/* معلومات الدفع */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2">معلومات الدفع:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">طريقة الدفع:</span> {payment?.method}
              </div>
              <div>
                <span className="font-medium">حالة الدفع:</span> {payment?.status === 'completed' ? 'مكتمل' : payment?.status === 'pending' ? 'في الانتظار' : 'ملغي'}
              </div>
            </div>
          </div>

          {/* الشروط والأحكام */}
          <div className="mt-8 text-sm text-gray-600">
            <h4 className="font-medium mb-2">الشروط والأحكام:</h4>
            <ul className="space-y-1 text-xs">
              <li>• يتم تجديد الاشتراك تلقائياً كل شهر</li>
              <li>• يمكن إلغاء الاشتراك في أي وقت من لوحة التحكم</li>
              <li>• لا يتم استرداد الرسوم المدفوعة</li>
              <li>• تطبق الشروط والأحكام الكاملة المتاحة على الموقع</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* تذييل للطباعة */}
      <div className="text-center text-sm text-gray-500 mt-4 print:block hidden">
        شكراً لاختيارك منصة إداية - منصة التداول الذكي
      </div>
    </div>
  );
}