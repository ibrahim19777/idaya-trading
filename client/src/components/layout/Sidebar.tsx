import { Link, useLocation } from 'wouter';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { IdayaLogo } from '@/components/ui/IdayaLogo';
import { 
  ChartLine, 
  Link as LinkIcon, 
  Bot, 
  History, 
  Bell, 
  Crown, 
  Calculator, 
  Shield,
  CreditCard,
  Brain,
  MessageCircle,
  Receipt,
  LogOut
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', key: 'nav.overview', icon: ChartLine },
  { path: '/connections', key: 'nav.connections', icon: LinkIcon },
  { path: '/bot-control', key: 'nav.bot', icon: Bot },
  { path: '/ai-trading', key: 'nav.aitrading', icon: Brain },
  { path: '/trades', key: 'nav.trades', icon: History },
  { path: '/notifications', key: 'nav.notifications', icon: Bell },
  { path: '/subscriptions', key: 'nav.subscriptions', icon: Crown },
  { path: '/calculator', key: 'nav.calculator', icon: Calculator },
  { path: '/payment-history', key: 'nav.payments', icon: Receipt },
  { path: '/contact', key: 'nav.contact', icon: MessageCircle },
];

export function Sidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-gradient-to-b from-white/90 via-blue-50/50 to-indigo-100/50 dark:from-gray-900/90 dark:via-blue-900/50 dark:to-indigo-900/50 backdrop-blur-xl shadow-2xl min-h-screen border-r border-white/20 dark:border-gray-700/30 relative overflow-hidden">
      {/* خلفية تأثيرات بصرية */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-pink-500/20 rounded-full blur-2xl translate-x-16 translate-y-16"></div>
      
      <nav className="p-4 space-y-3 relative z-10">
        {navItems.map(({ path, key, icon: Icon }, index) => {
          const isActive = location === path;
          
          return (
            <Link key={path} href={path}>
              <div className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-gray-700/30'
              }`}>
                {/* تأثير النبضة للعنصر النشط */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                )}
                
                {/* أيقونة بسيطة على اليسار */}
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                } transition-colors duration-300`} />
                
                {/* النص مباشرة بعد الأيقونة */}
                <span className={`font-medium ${
                  isActive 
                    ? 'text-white' 
                    : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                } transition-colors duration-300`}>
                  {t(key)}
                </span>
                
                {/* شريط جانبي للعنصر النشط */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                )}
              </div>
            </Link>
          );
        })}
        
        {user?.isAdmin && (
          <>
            <div className="my-6 border-t border-gradient-to-r from-transparent via-white/30 to-transparent dark:via-gray-600/30"></div>
            <Link href="/admin">
              <div className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                location === '/admin'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-gray-700/30'
              }`}>
                {/* تأثير النبضة للأدمن */}
                {location === '/admin' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                )}
                
                {/* أيقونة الأدمن بسيطة على اليسار */}
                <Shield className={`w-5 h-5 flex-shrink-0 ${
                  location === '/admin' 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                } transition-colors duration-300`} />
                
                {/* نص الأدمن مباشرة بعد الأيقونة */}
                <span className={`font-medium ${
                  location === '/admin' 
                    ? 'text-white' 
                    : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                } transition-colors duration-300`}>
                  {t('nav.admin')}
                </span>
                
                {location === '/admin' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                )}
              </div>
            </Link>
          </>
        )}
        
        {/* زر تسجيل الخروج في أسفل القائمة */}
        <div className="mt-8 pt-4 border-t border-white/20 dark:border-gray-700/30">
          <button
            onClick={async () => {
              console.log('🚪 بدء عملية تسجيل الخروج...');
              
              try {
                // تسجيل الخروج من Firebase
                const { signOut } = await import('firebase/auth');
                const { auth } = await import('@/lib/firebase');
                await signOut(auth);
              } catch (error) {
                console.log('Firebase signout error (continuing anyway):', error);
              }
              
              // مسح جميع البيانات المحلية
              localStorage.clear();
              sessionStorage.clear();
              
              // مسح cookies إضافية
              document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
              });
              
              console.log('✅ تم تسجيل الخروج بنجاح');
              
              // إعادة توجيه فوري
              window.location.href = '/';
            }}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 backdrop-blur-sm border border-transparent hover:border-red-200 dark:hover:border-red-800/30 w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300" />
            
            <span className="font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
              تسجيل الخروج
            </span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
