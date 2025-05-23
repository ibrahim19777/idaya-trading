import { Layout } from '@/components/layout/Layout';
import { BotControl } from '@/components/trading/BotControl';

export default function BotControlPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">التحكم بالبوت</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة وتحكم في البوت الذكي للتداول</p>
        </div>

        <BotControl />
      </div>
    </Layout>
  );
}
