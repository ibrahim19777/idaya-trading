import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "يجب أن يكون الاسم على الأقل حرفين"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  subject: z.string().min(5, "يجب أن يكون الموضوع على الأقل 5 أحرف"),
  message: z.string().min(10, "يجب أن تكون الرسالة على الأقل 10 أحرف"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactSubjects = [
  { value: "general", label: "استفسار عام", labelEn: "General Inquiry" },
  { value: "technical", label: "مشكلة تقنية", labelEn: "Technical Issue" },
  { value: "billing", label: "استفسار عن الفواتير", labelEn: "Billing Inquiry" },
  { value: "trading", label: "مشكلة في التداول", labelEn: "Trading Issue" },
  { value: "feature", label: "طلب ميزة جديدة", labelEn: "Feature Request" },
  { value: "partnership", label: "شراكة", labelEn: "Partnership" },
];

export default function ContactUs() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // جلب إعدادات الدفع للحصول على معلومات الدعم الحقيقية
  const { data: paymentSettings } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
    retry: false,
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const submitMessage = useMutation({
    mutationFn: (data: ContactFormData) =>
      apiRequest("POST", "/api/contact", data),
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "تم إرسال رسالتك بنجاح!",
        description: "سنقوم بالرد عليك في أقرب وقت ممكن.",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitMessage.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur dark:bg-gray-800/80">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                تم إرسال رسالتك بنجاح! ✅
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                شكراً لتواصلك معنا. سنقوم بمراجعة رسالتك والرد عليك خلال 24 ساعة.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                إرسال رسالة أخرى
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            اتصل بنا
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            نحن هنا لمساعدتك! لا تتردد في التواصل معنا بأي استفسار أو مشكلة.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur dark:bg-gray-800/80 mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  معلومات الاتصال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">البريد الإلكتروني</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {paymentSettings?.supportEmail || 'support@idaya.com'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">الهاتف</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {paymentSettings?.whatsapp || '01115000273'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">الموقع</p>
                    <p className="text-gray-600 dark:text-gray-300">القاهرة، مصر</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  ساعات الدعم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">الأحد - الخميس</span>
                    <span className="font-semibold text-gray-900 dark:text-white">9:00 ص - 6:00 م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">الجمعة - السبت</span>
                    <span className="font-semibold text-gray-900 dark:text-white">10:00 ص - 4:00 م</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  أرسل لنا رسالة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-white">الاسم الكامل</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="أدخل اسمك الكامل"
                                {...field}
                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-white">البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="example@email.com"
                                {...field}
                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-white">الموضوع</FormLabel>
                          <FormControl>
                            <NativeSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="اختر موضوع الرسالة"
                              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                              options={contactSubjects}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-white">الرسالة</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="اكتب رسالتك هنا... نحن نقدر وقتك ونرحب بجميع الاستفسارات والاقتراحات."
                              rows={6}
                              {...field}
                              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={submitMessage.isPending}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold"
                    >
                      {submitMessage.isPending ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          جاري الإرسال...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="w-5 h-5 mr-2" />
                          إرسال الرسالة
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}