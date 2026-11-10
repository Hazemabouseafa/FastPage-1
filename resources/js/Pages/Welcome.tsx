import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Utensils, QrCode, Smartphone, Zap, ArrowLeft, Check, Phone, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface Props {
    demoSlug: string;
    annualPrice: number;
}

export default function Welcome({ demoSlug, annualPrice }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-gray-50 text-gray-900 flex flex-col justify-between">
            <Head title="منيو كيو آر مصر - أسرع قائمة طعام رقمية لمطعمك" />

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100/60 px-4 py-3.5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-base font-extrabold text-gray-900 tracking-tight">منيو كيو آر</span>
                            <span className="text-[10px] block font-bold text-orange-600 leading-none">مصر 🇪🇬</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('login')}
                            className="text-xs font-bold px-3.5 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition min-h-[40px] flex items-center"
                        >
                            تسجيل الدخول
                        </Link>
                        <Link
                            href={route('register')}
                            className="text-xs font-bold px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 shadow-sm shadow-orange-600/20 transition min-h-[40px] flex items-center"
                        >
                            سجل مطعمك
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 flex-1 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 text-orange-800 text-xs font-bold mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>مخصص للمطاعم والكافيهات في مصر</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-[1.25] tracking-tight max-w-2xl">
                    منيو رقمي أنيق لمطعمك <br />
                    <span className="text-orange-600">في أقل من ٥ دقائق</span>
                </h1>

                <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-lg leading-relaxed">
                    زبائنك يمسحون رمز الـ QR بكاميرا الموبايل ليتصفحوا قائمة طعامك فوراً وبسرعة فائقة، بدون الحاجة لتحميل تطبيقات وبدون تسجيل.
                </p>

                {/* Price Pill */}
                <div className="mt-6 inline-flex flex-col items-center bg-white border-2 border-orange-500/30 rounded-2xl p-4 shadow-xl shadow-orange-950/5">
                    <span className="text-xs text-gray-500 font-medium">الاشتراك السنوي الثابت</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl sm:text-4xl font-black text-orange-600">{annualPrice}</span>
                        <span className="text-sm font-bold text-gray-700">ج.م / سنة</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full mt-2">
                        بدون أي عمولات على المبيعات &bull; بدون خطط شهرية
                    </span>
                </div>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <Link
                        href={route('register')}
                        className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-extrabold text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition min-h-[52px]"
                    >
                        <span>أنشئ منيو مطعمك الآن</span>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    <a
                        href={`/m/${demoSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-sm py-3.5 px-6 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition min-h-[52px]"
                    >
                        <QrCode className="w-4 h-4 text-orange-600" />
                        <span>معاينة منيو كشري التحرير التجريبي</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </a>
                </div>

                {/* Value Propositions Grid */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-right">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">إدارة كاملة من الموبايل</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            عدل الأسعار، أضف وجبات جديدة، أو اوقف صنف نفد بضغطة زر واحدة وأنت في مطبخك من هاتفك.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">سرعة خارقة للزبون</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            صفحة منيو خفيفة جداً تفتح بلمح البصر على شبكات 3G/4G وأضعف هواتف الأندرويد.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                            <QrCode className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">ستاند طاولة جاهز للطباعة</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            حمّل رمز الـ QR عالي الدقة واطبع كروت الطاولات بتصميم أنيق فوراً بدون مصممين.
                        </p>
                    </div>
                </div>

                {/* Step-by-Step Flow */}
                <div className="mt-16 w-full text-right bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-sm">
                    <h2 className="text-lg font-black text-gray-900 mb-4 text-center">كيف يعمل النظام؟</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                        <div className="p-3">
                            <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">١</div>
                            <h4 className="text-sm font-bold text-gray-900">سجل حسابك</h4>
                            <p className="text-xs text-gray-500 mt-1">اسم المطعم ورقم الواتساب</p>
                        </div>
                        <div className="p-3">
                            <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">٢</div>
                            <h4 className="text-sm font-bold text-gray-900">أضف الوجبات</h4>
                            <p className="text-xs text-gray-500 mt-1">الأقسام والأسعار والصور</p>
                        </div>
                        <div className="p-3">
                            <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">٣</div>
                            <h4 className="text-sm font-bold text-gray-900">اطبع الـ QR</h4>
                            <p className="text-xs text-gray-500 mt-1">ضعه على طاولات الصالة</p>
                        </div>
                        <div className="p-3">
                            <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">٤</div>
                            <h4 className="text-sm font-bold text-gray-900">استقبل الزبائن</h4>
                            <p className="text-xs text-gray-500 mt-1">مسح فوري بدون تطبيقات</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white py-6 px-4 text-center text-xs text-gray-400">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                        منيو كيو آر مصر &copy; {new Date().getFullYear()} &bull; حل تقني مصري لإدارة قوائم الطعام الرقمية
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 font-semibold">
                        <Link href={route('login')} className="hover:text-orange-600">دخول الإدارة</Link>
                        <span>&bull;</span>
                        <Link href={route('register')} className="hover:text-orange-600">اشتراك جديد</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
