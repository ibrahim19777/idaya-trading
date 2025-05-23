import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { 
  CreditCard, 
  Upload, 
  Phone, 
  Building2, 
  Wallet, 
  DollarSign,
  Check,
  X,
  Settings,
  Link2,
  ImageIcon,
  Banknote
} from "lucide-react";

// Payment Method Schema
const paymentMethodSchema = z.object({
  name: z.string().min(1, "اسم طريقة الدفع مطلوب"),
  type: z.enum(["visa", "paypal", "instapay", "vodafone_cash", "bank_transfer"]),
  apiKey: z.string().optional(),
  secretKey: z.string().optional(),
  phoneNumber: z.string().optional(),
  accountDetails: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Payment Receipt Schema
const paymentReceiptSchema = z.object({
  amount: z.string().min(1, "المبلغ مطلوب"),
  paymentMethodId: z.number(),
  transactionId: z.string().optional(),
  phoneNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;
type PaymentReceiptForm = z.infer<typeof paymentReceiptSchema>;

export default function PaymentMethodsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
    queryFn: () => apiRequest('/api/payment-methods').then(res => res.json()),
  });

  const methodForm = useForm<PaymentMethodForm>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      type: "visa",
      isActive: true,
    },
  });

  const receiptForm = useForm<PaymentReceiptForm>({
    resolver: zodResolver(paymentReceiptSchema),
    defaultValues: {
      amount: "",
      paymentMethodId: 0,
    },
  });

  const createMethodMutation = useMutation({
    mutationFn: (data: PaymentMethodForm) => 
      apiRequest('/api/payment-methods', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({
        title: "✅ تم إضافة طريقة الدفع",
        description: "تمت إضافة طريقة الدفع بنجاح",
      });
      setIsMethodDialogOpen(false);
      methodForm.reset();
    },
    onError: () => {
      toast({
        title: "❌ خطأ في إضافة طريقة الدفع",
        description: "تحقق من البيانات المدخلة",
        variant: "destructive",
      });
    },
  });

  const uploadReceiptMutation = useMutation({
    mutationFn: async (data: PaymentReceiptForm & { receipt?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      if (selectedFile) {
        formData.append('receipt', selectedFile);
      }
      
      return apiRequest('/api/payment-receipts', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ تم رفع الإيصال بنجاح",
        description: "سيتم مراجعة الإيصال وتأكيد الدفع قريباً",
      });
      setIsReceiptDialogOpen(false);
      receiptForm.reset();
      setSelectedFile(null);
      setPreviewUrl("");
    },
    onError: () => {
      toast({
        title: "❌ خطأ في رفع الإيصال",
        description: "تحقق من الملف والبيانات",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "visa": return <CreditCard className="h-5 w-5" />;
      case "paypal": return <Wallet className="h-5 w-5" />;
      case "instapay": return <Building2 className="h-5 w-5" />;
      case "vodafone_cash": return <Phone className="h-5 w-5" />;
      case "bank_transfer": return <Banknote className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getPaymentMethodName = (type: string) => {
    switch (type) {
      case "visa": return "فيزا";
      case "paypal": return "PayPal";
      case "instapay": return "إنستاباي";
      case "vodafone_cash": return "فودافون كاش";
      case "bank_transfer": return "تحويل بنكي";
      default: return type;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري تحميل طرق الدفع...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">طرق الدفع</h1>
          <p className="text-muted-foreground">إدارة طرق الدفع ورفع إيصالات التحويل</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isMethodDialogOpen} onOpenChange={setIsMethodDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                إضافة طريقة دفع
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                رفع إيصال دفع
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="methods" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="methods">طرق الدفع المتاحة</TabsTrigger>
          <TabsTrigger value="receipts">إيصالات الدفع</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Visa Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  فيزا / ماستركارد
                </CardTitle>
                <CardDescription>دفع مباشر بالبطاقة الائتمانية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  • دفع آمن ومشفر
                  • تأكيد فوري
                  • رسوم معالجة 2.9%
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Stripe API Key:</p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="sk_test_..." 
                      defaultValue=""
                      className="font-mono text-xs"
                      type="password"
                    />
                    <Button size="sm">
                      <Link2 className="h-4 w-4 mr-2" />
                      ربط
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PayPal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  PayPal
                </CardTitle>
                <CardDescription>الدفع عبر PayPal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  • حماية المشتري
                  • دعم عالمي
                  • رسوم معالجة 3.4%
                </div>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">PayPal Client ID:</p>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="AXh..." 
                        defaultValue=""
                        className="font-mono text-xs"
                        type="password"
                      />
                      <Button size="sm">
                        <Link2 className="h-4 w-4 mr-2" />
                        ربط
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">PayPal Client Secret:</p>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="EJn..." 
                        defaultValue=""
                        className="font-mono text-xs"
                        type="password"
                      />
                      <Button size="sm">تحديث</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* InstaPay */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  إنستاباي
                </CardTitle>
                <CardDescription>تحويل فوري بين البنوك المصرية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  • تحويل فوري 24/7
                  • جميع البنوك المصرية
                  • رسوم منخفضة
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">رقم InstaPay:</p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="01234567890" 
                      defaultValue="01234567890"
                      className="font-mono"
                    />
                    <Button size="sm">حفظ</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vodafone Cash */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  فودافون كاش
                </CardTitle>
                <CardDescription>تحويل عبر محفظة فودافون</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  • سهولة في الاستخدام
                  • متاح في جميع نقاط البيع
                  • رسوم تحويل منخفضة
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">رقم فودافون كاش:</p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="01012345678" 
                      defaultValue="01012345678"
                      className="font-mono"
                    />
                    <Button size="sm">حفظ</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  تحويل بنكي
                </CardTitle>
                <CardDescription>تحويل مباشر للحساب البنكي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  • تحويل آمن
                  • رسوم منخفضة
                  • يتطلب تأكيد يدوي
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-sm"><strong>البنك:</strong> البنك الأهلي المصري</p>
                  <p className="text-sm"><strong>رقم الحساب:</strong> 1234567890123456</p>
                  <p className="text-sm"><strong>اسم الحساب:</strong> شركة إداية للتكنولوجيا</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إيصالات الدفع المرفوعة</CardTitle>
              <CardDescription>جميع إيصالات الدفع المرفوعة وحالة المراجعة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                لا توجد إيصالات مرفوعة بعد
                <br />
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsReceiptDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  رفع إيصال دفع
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Method Dialog */}
      <Dialog open={isMethodDialogOpen} onOpenChange={setIsMethodDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة طريقة دفع جديدة</DialogTitle>
            <DialogDescription>
              إضافة وتكوين طريقة دفع جديدة مع API
            </DialogDescription>
          </DialogHeader>
          
          <Form {...methodForm}>
            <form onSubmit={methodForm.handleSubmit((data) => createMethodMutation.mutate(data))} className="space-y-4">
              <FormField
                control={methodForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم طريقة الدفع</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: بايبال الشركة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methodForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع طريقة الدفع</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full p-2 border rounded">
                        <option value="visa">فيزا / ماستركارد</option>
                        <option value="paypal">PayPal</option>
                        <option value="instapay">إنستاباي</option>
                        <option value="vodafone_cash">فودافون كاش</option>
                        <option value="bank_transfer">تحويل بنكي</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methodForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مفتاح API للربط التلقائي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methodForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف (للمحافظ الإلكترونية)</FormLabel>
                    <FormControl>
                      <Input placeholder="01234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={createMethodMutation.isPending}>
                  إضافة طريقة الدفع
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Payment Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>رفع إيصال دفع</DialogTitle>
            <DialogDescription>
              رفع إيصال التحويل أو الدفع للمراجعة والتأكيد
            </DialogDescription>
          </DialogHeader>
          
          <Form {...receiptForm}>
            <form onSubmit={receiptForm.handleSubmit((data) => uploadReceiptMutation.mutate(data))} className="space-y-4">
              <FormField
                control={receiptForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ المدفوع</FormLabel>
                    <FormControl>
                      <Input placeholder="100.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={receiptForm.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم العملية (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="TXN123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={receiptForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف المرسل منه</FormLabel>
                    <FormControl>
                      <Input placeholder="01234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>صورة الإيصال</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto rounded" />
                      <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">اختر صورة الإيصال</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <FormField
                control={receiptForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات إضافية</FormLabel>
                    <FormControl>
                      <Textarea placeholder="أي ملاحظات أو تفاصيل إضافية..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={uploadReceiptMutation.isPending}>
                  <Upload className="h-4 w-4 mr-2" />
                  رفع الإيصال
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}