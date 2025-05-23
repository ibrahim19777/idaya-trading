import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Eye, 
  Check, 
  X, 
  Download, 
  Calendar,
  User,
  CreditCard,
  FileImage 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function PaymentsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // جلب جميع المدفوعات
  const { data: payments, isLoading } = useQuery({
    queryKey: ['/api/payments'],
  });

  // موافقة على الدفعة
  const approveMutation = useMutation({
    mutationFn: (paymentId: number) => 
      apiRequest('PATCH', `/api/payments/${paymentId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      toast({
        title: "✅ تمت الموافقة على الدفعة",
        description: "تم تفعيل الاشتراك بنجاح",
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "❌ خطأ في الموافقة",
        description: "حدث خطأ أثناء الموافقة على الدفعة",
        variant: "destructive",
      });
    }
  });

  // رفض الدفعة
  const rejectMutation = useMutation({
    mutationFn: (paymentId: number) => 
      apiRequest('PATCH', `/api/payments/${paymentId}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      toast({
        title: "❌ تم رفض الدفعة",
        description: "تم رفض الدفعة وإشعار العميل",
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "❌ خطأ في الرفض",
        description: "حدث خطأ أثناء رفض الدفعة",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">مكتمل</Badge>;
      case 'pending':
        return <Badge variant="secondary">في الانتظار</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'vodafone':
        return '📱';
      case 'bank':
        return '🏦';
      case 'stripe':
        return '💳';
      case 'paypal':
        return '🅿️';
      default:
        return '💰';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>جاري تحميل المدفوعات...</p>
      </div>
    );
  }

  const pendingPayments = (payments || []).filter((p: any) => p.status === 'pending');
  const completedPayments = (payments || []).filter((p: any) => p.status === 'completed');
  const rejectedPayments = (payments || []).filter((p: any) => p.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة المدفوعات</h2>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>في الانتظار ({pendingPayments.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>مكتمل ({completedPayments.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>مرفوض ({rejectedPayments.length})</span>
          </div>
        </div>
      </div>

      {/* المدفوعات في الانتظار */}
      {pendingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">
              📋 مدفوعات تحتاج موافقة ({pendingPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {pendingPayments.map((payment: any) => (
                <div key={payment.id} className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getMethodIcon(payment.method)}</span>
                        <div>
                          <h4 className="font-medium">
                            {payment.plan} - ${payment.amount}
                          </h4>
                          <p className="text-sm text-gray-600">
                            العميل: {payment.userEmail || `المستخدم #${payment.userId}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(payment.createdAt || Date.now()).toLocaleDateString('ar')}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <CreditCard className="h-4 w-4" />
                          <span>{payment.method === 'vodafone' ? 'فودافون كاش' : payment.method === 'bank' ? 'تحويل بنكي' : payment.method}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Dialog open={isDialogOpen && selectedPayment?.id === payment.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            عرض
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>تفاصيل الدفعة #{payment.id}</DialogTitle>
                            <DialogDescription>
                              مراجعة تفاصيل الدفعة والإيصال المرفق
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">تفاصيل العميل:</h4>
                                <p><strong>المستخدم:</strong> {payment.userEmail || `#${payment.userId}`}</p>
                                <p><strong>الخطة:</strong> {payment.plan}</p>
                                <p><strong>المبلغ:</strong> ${payment.amount}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">تفاصيل الدفع:</h4>
                                <p><strong>الطريقة:</strong> {payment.method === 'vodafone' ? 'فودافون كاش' : payment.method === 'bank' ? 'تحويل بنكي' : payment.method}</p>
                                <p><strong>التاريخ:</strong> {new Date(payment.createdAt || Date.now()).toLocaleDateString('ar')}</p>
                                <p><strong>الحالة:</strong> {getStatusBadge(payment.status)}</p>
                              </div>
                            </div>
                            
                            {payment.notes && (
                              <div>
                                <h4 className="font-medium mb-2">ملاحظات العميل:</h4>
                                <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">{payment.notes}</p>
                              </div>
                            )}

                            {/* عرض الإيصال */}
                            {payment.receiptUrl && (
                              <div className="space-y-3">
                                <h4 className="font-medium mb-2">📄 الإيصال المرفوع:</h4>
                                <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                                  <img 
                                    src={payment.receiptUrl} 
                                    alt="إيصال الدفع"
                                    className="w-full max-w-lg mx-auto cursor-zoom-in hover:scale-105 transition-transform border rounded"
                                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                                    onClick={() => window.open(payment.receiptUrl, '_blank')}
                                  />
                                  <p className="text-center text-sm text-gray-500 mt-2">
                                    💡 اضغط على الصورة لعرضها بالحجم الكامل في نافذة جديدة
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {!payment.receiptUrl && (
                              <div className="text-center py-4 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded">
                                <p>⚠️ لم يتم رفع إيصال لهذه الدفعة</p>
                              </div>
                            )}
                            
                            {payment.receiptUrl && (
                              <div>
                                <h4 className="font-medium mb-2">الإيصال المرفق:</h4>
                                <div className="border rounded-lg p-4">
                                  <img 
                                    src={payment.receiptUrl} 
                                    alt="Payment Receipt" 
                                    className="max-w-full h-64 object-contain mx-auto"
                                  />
                                  <div className="mt-2 text-center">
                                    <Button variant="outline" size="sm">
                                      <Download className="h-4 w-4 mr-1" />
                                      تحميل الإيصال
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex space-x-2 pt-4">
                              <Button 
                                onClick={() => approveMutation.mutate(payment.id)}
                                disabled={approveMutation.isPending}
                                className="flex-1"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                موافقة وتفعيل الاشتراك
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => rejectMutation.mutate(payment.id)}
                                disabled={rejectMutation.isPending}
                                className="flex-1"
                              >
                                <X className="h-4 w-4 mr-1" />
                                رفض الدفعة
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm"
                        onClick={() => approveMutation.mutate(payment.id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        موافقة
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => rejectMutation.mutate(payment.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* جميع المدفوعات */}
      <Card>
        <CardHeader>
          <CardTitle>📊 جميع المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-2">
              {(payments || []).map((payment: any) => (
                <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getMethodIcon(payment.method)}</span>
                    <div>
                      <p className="font-medium">
                        {payment.planName || payment.plan || 'غير محدد'} - {payment.amount} جنيه
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.userName || payment.userEmail || `المستخدم #${payment.userId || 'غير محدد'}`} • {new Date(payment.createdAt || Date.now()).toLocaleDateString('ar')}
                      </p>
                      <p className="text-xs text-blue-600">
                        طريقة الدفع: {payment.method === 'vodafone' ? 'فودافون كاش' : payment.method === 'instapay' ? 'انستاباي' : payment.method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(payment.status)}
                    {payment.receiptUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(payment.receiptUrl, '_blank')}
                        title="عرض الإيصال"
                      >
                        <Eye className="h-4 w-4" />
                        إيصال
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مدفوعات حتى الآن</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}