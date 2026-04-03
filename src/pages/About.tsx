import { Info, Target, Users, Shield, Zap, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/Card';

export function About() {
  const { t } = useLanguage();

  const values = [
    { icon: Target, title: t.about.values[0].title, description: t.about.values[0].description, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
    { icon: Zap, title: t.about.values[1].title, description: t.about.values[1].description, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
    { icon: Shield, title: t.about.values[2].title, description: t.about.values[2].description, color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
  ];

  const stats = [
    { label: t.about.stats.datasets, value: '1,200+', icon: TrendingUp },
    { label: t.about.stats.labels, value: '5.4M+', icon: Users },
    { label: t.about.stats.users, value: '25,000+', icon: Info },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
          <Info className="w-4 h-4" />
          <span>Our Journey</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-[#00a8ff] to-[#9c88ff] bg-clip-text text-transparent">
          {t.about.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {t.about.subtitle}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center group hover:-translate-y-1 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 mb-4 group-hover:scale-110 transition-transform">
              <stat.icon className="w-6 h-6 text-[#00a8ff]" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Card className="p-8 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.about.story.title}
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>{t.about.story.content1}</p>
            <p>{t.about.story.content2}</p>
          </div>
        </Card>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00a8ff] to-[#9c88ff] opacity-10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white dark:bg-gray-900 p-2 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
             <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Users className="w-16 h-16 text-[#00a8ff] mx-auto opacity-50" />
                    <p className="text-gray-400 font-medium">Visualization of our global network</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="space-y-8 pb-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="space-y-4 p-6 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${value.color}`}>
                <value.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}