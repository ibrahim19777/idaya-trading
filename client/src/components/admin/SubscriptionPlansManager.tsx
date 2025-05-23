import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSubscriptionPlanSchema, type SubscriptionPlan } from "@shared/schema";
import { z } from "zod";
import { Edit, Trash2, Plus, DollarSign, Users, Package } from "lucide-react";

const planFormSchema = insertSubscriptionPlanSchema.extend({
  features: z.array(z.string()).optional(),
});

type PlanFormData = z.infer<typeof planFormSchema>;

export function SubscriptionPlansManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
  });

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      planType: "basic",
      monthlyPrice: "0.00",
      yearlyPrice: "0.00",
      maxPlatforms: 1,
      features: [],
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PlanFormData) => apiRequest('POST', '/api/subscription-plans', {
      ...data,
      features: data.features || [],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "✅ تم إنشاء الباقة بنجاح",
        description: "تمت إضافة باقة الاشتراك الجديدة",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "❌ خطأ في إنشاء الباقة",
        description: "حدث خطأ أثناء إنشاء باقة الاشتراك",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PlanFormData> }) => 
      apiRequest('PATCH', `/api/subscription-plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "✅ تم تحديث الباقة بنجاح",
        description: "تم تحديث باقة الاشتراك بنجاح",
      });
      setEditingPlan(null);
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "❌ خطأ في تحديث الباقة",
        description: "حدث خطأ أثناء تحديث باقة الاشتراك",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/subscription-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "✅ تم حذف الباقة بنجاح",
        description: "تم حذف باقة الاشتراك بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطأ في حذف الباقة",
        description: "حدث خطأ أثناء حذف باقة الاشتراك",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PlanFormData) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      nameAr: plan.nameAr,
      planType: plan.planType,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      maxPlatforms: plan.maxPlatforms,
      features: Array.isArray(plan.features) ? plan.features : [],
      isActive: plan.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري تحميل باقات الاشتراك...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة باقات الاشتراك</h2>
          <p className="text-muted-foreground">إدارة وتعديل أسعار باقات الاشتراك</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "تعديل باقة الاشتراك" : "إضافة باقة اشتراك جديدة"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan ? "تعديل تفاصيل وأسعار الباقة" : "إنشاء باقة اشتراك جديدة مع الأسعار والمميزات"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الباقة (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Premium" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الباقة (العربية)</FormLabel>
                        <FormControl>
                          <Input placeholder="متميز" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الباقة</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full p-2 border rounded">
                            <option value="basic">أساسي</option>
                            <option value="premium">متميز</option>
                            <option value="enterprise">مؤسسات</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السعر الشهري ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="99.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearlyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السعر السنوي ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="999.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="maxPlatforms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عدد المنصات المسموح</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="3" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingPlan ? "تحديث الباقة" : "إنشاء الباقة"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(plans as SubscriptionPlan[])?.map((plan: SubscriptionPlan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {plan.nameAr}
                  </CardTitle>
                  <CardDescription>{plan.name}</CardDescription>
                </div>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold">
                    <DollarSign className="h-4 w-4" />
                    {plan.monthlyPrice}
                  </div>
                  <p className="text-sm text-muted-foreground">شهرياً</p>
                </div>
                
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold">
                    <DollarSign className="h-4 w-4" />
                    {plan.yearlyPrice}
                  </div>
                  <p className="text-sm text-muted-foreground">سنوياً</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>المنصات: {plan.maxPlatforms === 999 ? "غير محدود" : plan.maxPlatforms}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(plan)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(plan.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}