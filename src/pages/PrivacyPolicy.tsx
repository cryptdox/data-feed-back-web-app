import { Shield, Eye, Lock, UserCheck, Mail, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/Card';

export function PrivacyPolicy() {
    const { t } = useLanguage();

    const iconMap = [Eye, Shield, Lock, UserCheck];

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8 pb-16">
            {/* Header */}
            <div className="space-y-4 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4 group hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-[#00a8ff]" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    {t.privacyPolicy.title}
                </h1>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{t.privacyPolicy.lastUpdated}</span>
                </div>
            </div>

            {/* Intro */}
            <Card className="p-8 border-l-4 border-l-[#00a8ff]">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    "{t.privacyPolicy.intro}"
                </p>
            </Card>

            {/* Policy Sections */}
            <div className="space-y-8">
                {t.privacyPolicy.sections.map((section, index) => {
                    const Icon = iconMap[index % iconMap.length];
                    return (
                        <div key={index} className="space-y-4 group">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-[#00a8ff]/10 group-hover:text-[#00a8ff] transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {section.title}
                                </h2>
                            </div>
                            <div className="pl-10">
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                    {section.content}
                                </p>
                            </div>
                            {index < t.privacyPolicy.sections.length - 1 && (
                                <div className="pt-8 border-b border-gray-100 dark:border-gray-800"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Contact Support */}
            <Card className="bg-gradient-to-br from-[#192a56] to-[#273c75] border-none text-white p-8 overflow-hidden relative group">
                <div className="absolute -right-12 -bottom-12 opacity-10 transform scale-150 group-hover:scale-[1.6] transition-transform duration-500">
                    <Lock className="w-48 h-48" />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-bold flex items-center space-x-3">
                        <Mail className="w-6 h-6 text-[#00a8ff]" />
                        <span>Privacy Concerns?</span>
                    </h3>
                    <p className="text-gray-300 max-w-xl text-lg">
                        If you have any questions regarding your privacy or data security, please don't hesitate to reach out to our dedicated privacy team at:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                            <Mail className="w-4 h-4 text-[#00a8ff]" />
                            <span className="font-mono">cryptdox.ethos@gmail.com</span>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                            <Shield className="w-4 h-4 text-[#00a8ff]" />
                            <span className="font-mono">Terms of Service</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Footer Note */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-500 pt-8">
                © 2026 DataLabel Space. All rights reserved. Your data is handled with care.
            </p>
        </div>
    );
}