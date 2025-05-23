import { Layout } from '@/components/layout/Layout';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export default function NotificationsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">التنبيهات الذكية</h1>
          <p className="text-gray-600 dark:text-gray-400">تنبيهات مخصصة بناء على أداء السوق والبوت</p>
        </div>

        <NotificationCenter />
      </div>
    </Layout>
  );
}
