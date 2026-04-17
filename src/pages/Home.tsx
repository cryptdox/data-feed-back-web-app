import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Rocket, Database, Tag, Upload } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { t } = useLanguage();

  const features = [
    {
      icon: Database,
      title: t.home.features.createDatasets.title,
      description: t.home.features.createDatasets.description,
      action: 'datasets',
      color: 'from-[#00a8ff] to-[#0097e6]',
    },
    {
      icon: Upload,
      title: t.home.features.uploadData.title,
      description: t.home.features.uploadData.description,
      action: 'upload',
      color: 'from-[#9c88ff] to-[#8c7ae6]',
    },
    {
      icon: Tag,
      title: t.home.features.labelData.title,
      description: t.home.features.labelData.description,
      action: 'labeling',
      color: 'from-[#4cd137] to-[#44bd32]',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#00a8ff] to-[#9c88ff] rounded-2xl mb-6">
          <Rocket className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#00a8ff] to-[#9c88ff] bg-clip-text text-transparent">
          {t.home.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t.home.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.action} className="hover:shadow-xl transition-shadow duration-300">
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {feature.description}
              </p>
              <Button onClick={() => onNavigate(feature.action)} className="w-full">
                {t.home.getStarted}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-[#192a56] to-[#273c75] border-none">
        <div className="text-white py-6">
          <h2 className="text-2xl font-bold mb-3">Ready to Launch?</h2>
          <p className="text-gray-300 mb-6">
            {t.home.subtitle}
          </p>
          <Button onClick={() => onNavigate('datasets')} variant="primary">
            {t.common.create}
          </Button>
        </div>
      </Card>
    </div>
  );
}
