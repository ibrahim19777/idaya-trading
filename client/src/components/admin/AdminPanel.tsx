import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NativeSelect } from '@/components/ui/native-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Users, Crown, DollarSign, Clock, Search, Edit, Ban, Check, X, Eye, Settings, Package, CreditCard, Phone, Plus, Percent, UserX, UserCheck, MessageSquare, Mail, Download } from 'lucide-react';
import { SubscriptionPlansManager } from './SubscriptionPlansManager';
import { PaymentSettingsManager } from './PaymentSettingsManager';
import { PaymentsManager } from './PaymentsManager';
// import { DiscountCodesManager } from './DiscountCodesManager';
import type { User, Payment, DiscountCode, ContactMessage } from '@shared/schema';

export function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showCreateCodeDialog, setShowCreateCodeDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();



  // Stats query
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: user?.isAdmin,
  });

  // Users query
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: user?.isAdmin,
  });

  // Payments query  
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
    enabled: user?.isAdmin,
  });

  // تسجيل البيانات للتشخيص
  console.log('Admin Panel Data:', { users, payments, userIsAdmin: user?.isAdmin });

  // Discount codes query
  const { data: discountCodes = [] } = useQuery<DiscountCode[]>({
    queryKey: ['/api/discount-codes'],
    enabled: user?.isAdmin,
  });

  // تصدير البيانات للإكسل
  const exportToExcel = async () => {
    try {
      const response = await fetch('/api/admin/export-excel');
      const data = await response.json();
      
      // تحويل البيانات لصيغة CSV وتنزيلها
      const csvContent = createCSVContent(data);
      downloadCSV(csvContent, `idaya-data-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "تم التصدير بنجاح ✅",
        description: "تم تنزيل البيانات بصيغة Excel",
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "فشل في تصدير البيانات",
        variant: "destructive",
      });
    }
  };

  const createCSVContent = (data: any) => {
    // إنشاء محتوى CSV باللغة العربية مع ترميز UTF-8
    const BOM = '\uFEFF'; // Byte Order Mark للـ UTF-8
    let csv = BOM + `تقرير بيانات منصة إداية\nتاريخ التقرير: ${data.generated}\n\n`;
    
    // المستخدمين
    if (data.users && data.users.data.length > 0) {
      csv += `${data.users.title}:\n`;
      csv += data.users.headers.join(',') + '\n';
      data.users.data.forEach((row: any[]) => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      csv += '\n';
    }
    
    // المدفوعات
    if (data.payments && data.payments.data.length > 0) {
      csv += `${data.payments.title}:\n`;
      csv += data.payments.headers.join(',') + '\n';
      data.payments.data.forEach((row: any[]) => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      csv += '\n';
    }
    
    // أكواد الخصم
    if (data.discountCodes && data.discountCodes.data.length > 0) {
      csv += `${data.discountCodes.title}:\n`;
      csv += data.discountCodes.headers.join(',') + '\n';
      data.discountCodes.data.forEach((row: any[]) => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      csv += '\n';
    }
    
    // رسائل الاتصال
    if (data.contactMessages && data.contactMessages.data.length > 0) {
      csv += `${data.contactMessages.title}:\n`;
      csv += data.contactMessages.headers.join(',') + '\n';
      data.contactMessages.data.forEach((row: any[]) => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
    }
    
    return csv;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Contact messages query
  const { data: contactMessages = [] } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact'],
    enabled: user?.isAdmin,
  });

  // Payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/payments/${paymentId}`, { status });
      return response.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: status === 'approved' ? 'تم تأكيد الدفعة' : 'تم رفض الدفعة',
        description: status === 'approved' ? 'تم تفعيل الاشتراك بنجاح' : 'تم رفض الدفعة',
        variant: status === 'approved' ? 'default' : 'destructive',
      });
    },
  });

  // Create discount code mutation
  const createDiscountCodeMutation = useMutation({
    mutationFn: async (codeData: any) => {
      const response = await apiRequest('POST', '/api/discount-codes', codeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discount-codes'] });
      toast({
        title: 'تم إنشاء الكود بنجاح',
      });
    },
  });

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('PATCH', `/api/users/${userId}/toggle-status`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: 'تم تحديث حالة المستخدم',
        description: 'تم تغيير حالة المستخدم بنجاح',
      });
    },
  });

  // Toggle admin rights mutation
  const toggleAdminRightsMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('PATCH', `/api/users/${userId}/toggle-admin`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: 'تم تحديث صلاحيات الإدارة',
        description: 'تم تغيير صلاحيات الإدارة بنجاح',
      });
    },
  });

  const handleToggleUserStatus = (userId: number) => {
    // Find the user to check their email
    const targetUser = Array.isArray(users) ? users.find((u: any) => u.id === userId) : null;
    
    // Protect ibrahim19777@me.com from being deactivated
    if (targetUser?.email === 'ibrahim19777@me.com') {
      toast({
        title: 'غير مسموح',
        description: 'لا يمكن إيقاف هذا المستخدم - محمي من النظام',
        variant: 'destructive',
      });
      return;
    }
    
    toggleUserStatusMutation.mutate(userId);
  };

  const handleToggleAdminRights = (userId: number) => {
    const targetUser = Array.isArray(users) ? users.find((u: any) => u.id === userId) : null;
    const isPromoting = !targetUser?.isAdmin;
    
    if (confirm(isPromoting ? 'هل أنت متأكد من ترقية هذا المستخدم لصلاحيات الإدارة؟' : 'هل أنت متأكد من إزالة صلاحيات الإدارة من هذا المستخدم؟')) {
      toggleAdminRightsMutation.mutate(userId);
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      // deleteUserMutation.mutate(userId);
      toast({
        title: 'ميزة قادمة',
        description: 'ميزة حذف المستخدمين ستكون متوفرة قريباً',
        variant: 'default',
      });
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter((u: any) => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredPayments = Array.isArray(payments) ? payments.filter((payment: any) => 
    paymentFilter === 'all' || payment.status === paymentFilter
  ) : [];

  if (!user?.isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">غير مصرح</h2>
        <p className="text-gray-600 dark:text-gray-400">ليس لديك صلاحية للوصول إلى لوحة الإدارة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">لوحة الإدارة</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة المستخدمين والاشتراكات والمدفوعات</p>
        </div>
        <Button 
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="h-4 w-4 ml-2" />
          تصدير البيانات
        </Button>
      </div>

      {/* Admin Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">المشتركون النشطون</p>
                  <p className="text-2xl font-bold text-green-500">{stats.activeSubscribers}</p>
                </div>
                <Crown className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الإيرادات الشهرية</p>
                  <p className="text-2xl font-bold text-yellow-500">${stats.monthlyRevenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">مدفوعات في الانتظار</p>
                  <p className="text-2xl font-bold text-red-500">{stats.pendingPayments}</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="messages">رسائل التواصل</TabsTrigger>
          <TabsTrigger value="subscriptions">باقات الاشتراك</TabsTrigger>
          <TabsTrigger value="payment-methods">طرق الدفع</TabsTrigger>
          <TabsTrigger value="receipts">إيصالات الدفع</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إدارة المستخدمين</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="البحث عن مستخدم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">تاريخ التسجيل</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الصلاحيات</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt!).toLocaleDateString('ar')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'نشط' : 'معطل'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                            {user.isAdmin ? 'مدير' : 'مستخدم'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant={user.isActive ? "outline" : "default"}
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={user.isAdmin ? "destructive" : "default"}
                              onClick={() => handleToggleAdminRights(user.id)}
                            >
                              👑
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!user.firebaseUid && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>مراجعة المدفوعات</CardTitle>
                <NativeSelect
                  value={paymentFilter}
                  onValueChange={setPaymentFilter}
                  className="w-48"
                  options={[
                    { value: "all", label: "جميع المدفوعات" },
                    { value: "pending", label: "في الانتظار" },
                    { value: "approved", label: "مؤكدة" },
                    { value: "rejected", label: "مرفوضة" }
                  ]}
                />
              </div>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">المستخدم #{payment.userId}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {payment.method} - ${payment.amount}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge 
                              variant={
                                payment.status === 'approved' ? 'default' :
                                payment.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {payment.status === 'approved' ? 'مؤكد' :
                               payment.status === 'rejected' ? 'مرفوض' : 'في الانتظار'}
                            </Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {new Date(payment.createdAt!).toLocaleDateString('ar')}
                            </p>
                          </div>
                          
                          {payment.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => updatePaymentMutation.mutate({
                                  paymentId: payment.id,
                                  status: 'approved'
                                })}
                                disabled={updatePaymentMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                                تأكيد
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updatePaymentMutation.mutate({
                                  paymentId: payment.id,
                                  status: 'rejected'
                                })}
                                disabled={updatePaymentMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                                رفض
                              </Button>
                              {payment.receiptUrl && (
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                  عرض الإيصال
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                رسائل التواصل ({Array.isArray(contactMessages) ? contactMessages.length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!contactMessages || contactMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">لا توجد رسائل تواصل حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(Array.isArray(contactMessages) ? contactMessages : []).map((message: any) => (
                    <div key={message.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{message.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{message.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={message.status === 'pending' ? 'secondary' : 'default'}>
                            {message.status === 'pending' ? 'جديدة' : 'مقروءة'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.createdAt).toLocaleDateString('ar')}
                          </p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">الموضوع:</p>
                        <p className="text-gray-900 dark:text-white">{message.subject}</p>
                      </div>
                      <div className="mb-3">
                        <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">الرسالة:</p>
                        <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded border">
                          {message.message}
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-2" />
                          الرد عبر البريد
                        </Button>
                        {message.status === 'pending' && (
                          <Button size="sm">
                            تم القراءة
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <SubscriptionPlansManager />
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods">
          <PaymentSettingsManager />
        </TabsContent>

        {/* Payments Management Tab */}
        <TabsContent value="payments">
          <PaymentsManager />
        </TabsContent>

        {/* Discount Codes Tab */}
        <TabsContent value="codes">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">إدارة رموز الخصم</h3>
            <p className="text-gray-600 dark:text-gray-400">ميزة إدارة رموز الخصم ستكون متوفرة قريباً</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
