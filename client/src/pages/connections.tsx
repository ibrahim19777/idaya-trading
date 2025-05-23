import { Layout } from '@/components/layout/Layout';
import { PlatformConnector } from '@/components/trading/PlatformConnector';

export default function ConnectionsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">ربط المنصات</h1>
          <p className="text-gray-600 dark:text-gray-400">ربط حسابات التداول الخاصة بك</p>
        </div>

        <PlatformConnector />
      </div>
    </Layout>
  );
}
