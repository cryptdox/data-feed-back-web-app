import { Card } from '../components/Card';
import { Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#487eb0] to-[#40739e] rounded-2xl mb-6">
            <SettingsIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#487eb0] to-[#40739e] bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Application settings and preferences will be available here. Configure your workspace, manage team members, and customize your experience.
          </p>
        </div>
      </Card>
    </div>
  );
}
