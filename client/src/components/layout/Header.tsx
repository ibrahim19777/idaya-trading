import { Bell, Moon, Sun, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { IdayaLogo } from '@/components/ui/IdayaLogo';

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useTranslation();
  const isRTL = language === 'ar';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* 1. شعار إداية والنص التوضيحي */}
          <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className="flex flex-col">
              <IdayaLogo className="w-32 h-8" variant="full" />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                AI Trading Platform
              </span>
            </div>
          </div>

          {/* العناصر الأخرى */}
          <div className={`flex items-center space-x-6 ${isRTL ? 'space-x-reverse' : ''}`}>
            {/* 2. حالة الاتصال */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>متصل بـ MT5</span>
            </div>

            {/* 3. زر تبديل اللغة */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
              className="hidden md:flex"
            >
              {language === 'ar' ? 'EN' : 'العربية'}
            </Button>

            {/* 4. زر تبديل الثيم */}
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* 5. التنبيهات */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
              >
                3
              </Badge>
            </Button>
            
            {/* 6. بيانات المستخدم البسيطة */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
              {user?.isAdmin && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}