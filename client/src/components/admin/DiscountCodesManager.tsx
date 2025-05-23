import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Percent } from 'lucide-react';
import type { DiscountCode } from '@shared/schema';

export function DiscountCodesManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    discount: '',
    maxUses: '',
    expiryDate: ''
  });
  const { toast } = useToast();

  // Fetch discount codes
  const { data: discountCodes, isLoading } = useQuery({
    queryKey: ['/api/discount-codes'],
  });

  // Create discount code mutation
  const createCodeMutation = useMutation({
    mutationFn: async (codeData: any) => {
      const response = await apiRequest('POST', '/api/discount-codes', {
        code: codeData.code,
        discount: parseInt(codeData.discount),
        maxUses: codeData.maxUses ? parseInt(codeData.maxUses) : null,
        expiryDate: codeData.expiryDate ? new Date(codeData.expiryDate) : null,
        isActive: true,
        currentUses: 0
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discount-codes'] });
      setShowCreateDialog(false);
      setNewCode({ code: '', discount: '', maxUses: '', expiryDate: '' });
      toast({
        title: '✅ تم إنشاء كود الخصم بنجاح!',
        description: 'يمكن للعملاء استخدام الكود الآن',
      });
    },
    onError: () => {
      toast({
        title: '❌ خطأ في إنشاء الكود',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  });

  const handleCreateCode = () => {
    if (!newCode.code || !newCode.discount) {
      toast({
        title: 'يرجى ملء البيانات المطلوبة',
        description: 'اسم الكود ونسبة الخصم مطلوبان',
        variant: 'destructive',
      });
      return;
    }

    createCodeMutation.mutate(newCode);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            إدارة أكواد الخصم
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة كود جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>إنشاء كود خصم جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">اسم الكود *</Label>
                  <Input
                    id="code"
                    placeholder="مثال: SAVE20"
                    value={newCode.code}
                    onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div>
                  <Label htmlFor="discount">نسبة الخصم (%) *</Label>
                  <Input
                    id="discount"
                    type="number"
                    placeholder="مثال: 20"
                    value={newCode.discount}
                    onChange={(e) => setNewCode(prev => ({ ...prev, discount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxUses">عدد الاستخدامات (اختياري)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    placeholder="اتركه فارغاً للاستخدام غير المحدود"
                    value={newCode.maxUses}
                    onChange={(e) => setNewCode(prev => ({ ...prev, maxUses: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">تاريخ الانتهاء (اختياري)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newCode.expiryDate}
                    onChange={(e) => setNewCode(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateCode}
                    disabled={createCodeMutation.isPending}
                    className="flex-1"
                  >
                    {createCodeMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الكود'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded" />
            ))}
          </div>
        ) : !discountCodes || discountCodes.length === 0 ? (
          <div className="text-center py-8">
            <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              لا توجد أكواد خصم
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              أنشئ كود خصم جديد لعملائك
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              إضافة كود خصم
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {discountCodes.map((code: DiscountCode) => (
              <div key={code.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Percent className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">{code.code}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        خصم {code.discount}% - استخدامات: {code.currentUses || 0}/{code.maxUses || 'غير محدود'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant={code.isActive ? 'default' : 'secondary'}>
                      {code.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                    {code.expiryDate && (
                      <p className="text-sm text-gray-600">
                        ينتهي: {new Date(code.expiryDate).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}