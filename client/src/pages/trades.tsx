import { Layout } from '@/components/layout/Layout';
import { TradesHistory } from '@/components/trading/TradesHistory';

export default function TradesPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">سجل الصفقات</h1>
          <p className="text-gray-600 dark:text-gray-400">عرض تفصيلي لجميع الصفقات المنفذة</p>
        </div>

        <TradesHistory />
      </div>
    </Layout>
  );
}
