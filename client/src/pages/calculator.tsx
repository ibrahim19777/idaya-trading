import { Layout } from '@/components/layout/Layout';
import { ProfitCalculator } from '@/components/calculator/ProfitCalculator';

export default function CalculatorPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">حاسبة الأرباح</h1>
          <p className="text-gray-600 dark:text-gray-400">احسب العائد المتوقع حسب رأس المال والاستراتيجية</p>
        </div>

        <ProfitCalculator />
      </div>
    </Layout>
  );
}
