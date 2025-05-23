import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useTranslation } from '@/lib/i18n';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { language } = useTranslation();
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark-bg ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <div className="flex">
        {isRTL ? (
          <>
            <main className="flex-1 p-6">
              {children}
            </main>
            <Sidebar />
          </>
        ) : (
          <>
            <Sidebar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </>
        )}
      </div>
    </div>
  );
}
