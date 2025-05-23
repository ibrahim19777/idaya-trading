import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IdayaLogo } from '@/components/ui/IdayaLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { FaGoogle, FaApple } from 'react-icons/fa';

const loginSchema = z.object({
  email: z.string().email('أدخل إيميل صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const registerSchema = z.object({
  username: z.string().min(2, 'اسم المستخدم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('أدخل إيميل صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(6, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, loginWithGoogle, loginWithApple, register } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const activeForm = isRegistering ? registerForm : loginForm;

  const onSubmit = async (data: LoginForm | RegisterForm) => {
    try {
      if (isRegistering) {
        const registerData = data as RegisterForm;
        await register(registerData.email, registerData.password, registerData.username);
        toast({
          title: 'تم إنشاء الحساب بنجاح',
          description: 'يمكنك الآن تسجيل الدخول',
        });
        setIsRegistering(false);
        registerForm.reset();
      } else {
        const loginData = data as LoginForm;
        await login(loginData.email, loginData.password);
      }
    } catch (error) {
      toast({
        title: isRegistering ? 'خطأ في إنشاء الحساب' : 'خطأ في تسجيل الدخول',
        description: 'تحقق من البيانات المدخلة',
        variant: 'destructive',
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: 'حدث خطأ أثناء تسجيل الدخول بـ Google',
        variant: 'destructive',
      });
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple();
    } catch (error) {
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: 'حدث خطأ أثناء تسجيل الدخول بـ Apple',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <IdayaLogo className="w-48 h-12" variant="full" />
          </div>
          <p className="text-gray-600">{t('app.subtitle')}</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={activeForm.handleSubmit(onSubmit)} className="space-y-6">
            {isRegistering && (
              <div>
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  {...registerForm.register('username')}
                  className="mt-2"
                />
                {registerForm.formState.errors.username && (
                  <p className="text-sm text-red-500 mt-1">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>
            )}
            
            <div>
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...activeForm.register('email')}
                className="mt-2"
              />
              {activeForm.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {activeForm.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...activeForm.register('password')}
                className="mt-2"
              />
              {activeForm.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {activeForm.formState.errors.password.message}
                </p>
              )}
            </div>
            
            {isRegistering && (
              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register('confirmPassword')}
                  className="mt-2"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={activeForm.formState.isSubmitting}
            >
              {isRegistering ? 'إنشاء حساب' : t('login.signin')}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">أو</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
              {t('login.google')}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleAppleLogin}
            >
              <FaApple className="mr-2 h-4 w-4 text-gray-800" />
              تسجيل الدخول بـ Apple
            </Button>
          </form>
          
          <p className="text-center text-sm text-gray-600 mt-6">
            {isRegistering ? 'لديك حساب؟' : 'ليس لديك حساب؟'}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary font-medium hover:underline mr-1"
            >
              {isRegistering ? 'تسجيل الدخول' : t('login.signup')}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
