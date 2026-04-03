import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function Contact() {
    const { t } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Simulate API call
        setTimeout(() => {
            setStatus('sent');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    const contactInfo = [
        {
            icon: Mail,
            label: t.contact.info.email,
            value: 'cryptdox.ethos@gmail.com',
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        },
        {
            icon: Phone,
            label: t.contact.info.phone,
            value: '+880 131068 5450',
            color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
        },
        {
            icon: MapPin,
            label: t.contact.info.address,
            value: 'Dhaka, Bangladesh',
            color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
        }
    ];

    const socialLinks = [
        {
            name: 'Twitter',
            url: 'https://twitter.com/cryptdox',
            icon: Globe,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            enabled: false
        },
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/company/108141662',
            icon: Globe,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            enabled: true
        },
        {
            name: 'GitHub',
            url: 'https://github.com/cryptdox',
            icon: Globe,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            enabled: false
        },
        {
            name: 'Discord',
            url: 'https://discord.com/cryptdox',
            icon: Globe,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            enabled: false
        },
        {
            name: 'Cryptdox',
            url: 'https://cryptdox.com',
            icon: Globe,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            enabled: true
        }
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00a8ff] to-[#9c88ff] rounded-2xl mb-4 shadow-xl">
                    <Mail className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#00a8ff] to-[#9c88ff] bg-clip-text text-transparent">
                    {t.contact.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    {t.contact.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info Column */}
                <div className="lg:col-span-1 space-y-6">
                    {contactInfo.map((info, index) => (
                        <Card key={index} className="group hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-[#00a8ff]">
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-lg ${info.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                    <info.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{info.label}</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">{info.value}</p>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Social Links Card */}
                    <Card className="bg-gradient-to-br from-[#192a56] to-[#273c75] border-none text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                            <Globe className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                                <Globe className="w-5 h-5 text-[#00a8ff]" />
                                <span>{t.contact.info.social}</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {socialLinks.map((social) => social.enabled && (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        className="flex items-center space-x-2 text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
                                    >
                                        <ArrowRight className="w-4 h-4 text-[#00a8ff]" />
                                        <span>{social.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Form Column */}
                <div className="lg:col-span-2">
                    <Card className="h-full border-t-4 border-t-[#9c88ff]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                                        <MessageSquare className="w-4 h-4 text-[#00a8ff]" />
                                        <span>{t.contact.form.name}</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#00a8ff] focus:border-transparent outline-none transition-all shadow-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-[#9c88ff]" />
                                        <span>{t.contact.form.email}</span>
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#00a8ff] focus:border-transparent outline-none transition-all shadow-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t.contact.form.subject}
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#00a8ff] focus:border-transparent outline-none transition-all shadow-sm"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t.contact.form.message}
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#00a8ff] focus:border-transparent outline-none transition-all resize-none shadow-sm"
                                    placeholder="Tell us more about your inquiry..."
                                />
                            </div>

                            <Button
                                type="submit"
                                // disabled={status === 'sending'}
                                disabled={true}
                                className="w-full py-4 text-lg font-bold flex items-center justify-center space-x-2 rounded-xl"
                            >
                                {status === 'sending' ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{t.contact.form.sending}</span>
                                    </div>
                                ) : status === 'sent' ? (
                                    <span>{t.contact.form.sent}</span>
                                ) : (
                                    <>
                                        <span>{t.common.submit}</span>
                                        <Send className="w-5 h-5" />
                                    </>
                                )}
                            </Button>

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center">
                                <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                                    This feature is currently disabled!
                                </p>
                            </div>

                            {status === 'sent' && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center">
                                    <p className="text-green-600 dark:text-green-400 font-medium">
                                        {t.contact.form.sent}
                                    </p>
                                </div>
                            )}
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}