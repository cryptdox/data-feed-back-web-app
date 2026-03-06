import { Card } from '../components/Card';
import { BarChart3 } from 'lucide-react';

export function Analytics() {
  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#9c88ff] to-[#8c7ae6] rounded-2xl mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#9c88ff] to-[#8c7ae6] bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Analytics and reporting features coming soon. Track your labeling progress, team performance, and data quality metrics.
          </p>
        </div>
      </Card>
    </div>
  );
}
