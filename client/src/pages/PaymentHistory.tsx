import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { Calendar, CreditCard, Download, Receipt, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Layout } from "@/components/layout/Layout";

export default function PaymentHistory() {
  const { user } = useAuth();
  const { t, language } = useTranslation();

  // جلب سجل المدفوعات للمستخدم
  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['/api/payments', user?.id],
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { 
        label: language === 'ar' ? 'في الانتظار' : 'Pending',
        variant: 'secondary' as const,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      },
      approved: { 
        label: language === 'ar' ? 'مؤكد' : 'Approved',
        variant: 'default' as const,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      },
      rejected: { 
        label: language === 'ar' ? 'مرفوض' : 'Rejected',
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap = {
      vodafone: language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash',
      instapay: language === 'ar' ? 'إنستاباي' : 'InstaPay',
      stripe: language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card',
      paypal: language === 'ar' ? 'باي بال' : 'PayPal',
      bank: language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'
    };
    return methodMap[method as keyof typeof methodMap] || method;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'سجل المدفوعات' : 'Payment History'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {language === 'ar' 
              ? 'عرض جميع مدفوعاتك واشتراكاتك السابقة' 
              : 'View all your payments and subscription history'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'إجمالي المدفوعات' : 'Total Payments'}
                </p>
                <p className="text-2xl font-bold">
                  {Array.isArray(payments) ? payments.filter((p: any) => p.status === 'approved').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'إجمالي المبلغ' : 'Total Amount'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${Array.isArray(payments) ? payments.filter((p: any) => p.status === 'approved')
                    .reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0)
                    .toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'في الانتظار' : 'Pending'}
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Array.isArray(payments) ? payments.filter((p: any) => p.status === 'pending').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'آخر دفعة' : 'Last Payment'}
                </p>
                <p className="text-sm font-medium">
                  {payments && payments.length > 0 
                    ? formatDistanceToNow(new Date(payments[0].createdAt), {
                        addSuffix: true,
                        locale: language === 'ar' ? ar : enUS
                      })
                    : (language === 'ar' ? 'لا توجد' : 'None')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {language === 'ar' ? 'جميع المدفوعات' : 'All Payments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {language === 'ar' ? 'لا توجد مدفوعات' : 'No payments yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? 'لم تقم بأي عمليات دفع حتى الآن'
                  : 'You haven\'t made any payments yet'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => {
                const status = getStatusBadge(payment.status);
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {getPaymentMethodLabel(payment.method)}
                          </h3>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDistanceToNow(new Date(payment.createdAt), {
                            addSuffix: true,
                            locale: language === 'ar' ? ar : enUS
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${payment.amount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        #{payment.id}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}