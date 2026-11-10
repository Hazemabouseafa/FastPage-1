import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Utensils, QrCode, CheckCircle2, AlertCircle, Upload, ArrowLeft } from 'lucide-react';

interface Props {
    suggestedSlug: string;
}

const PRESET_COLORS = [
    { name: 'برتقالي دافئ', hex: '#ea580c' },
    { name: 'عنبري ذهبي', hex: '#d97706' },
    { name: 'أخضر زمردي', hex: '#059669' },
    { name: 'أحمر قرمزي', hex: '#dc2626' },
    { name: 'أزرق ملكي', hex: '#2563eb' },
    { name: 'رمادي داكن', hex: '#1e293b' },
];

export default function Onboarding({ suggestedSlug }: Props) {
    const { auth } = usePage().props as any;
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [slugChecking, setSlugChecking] = useState(false);
    const [slugStatus, setSlugStatus] = useState<{ available?: boolean; message?: string } | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        whatsapp_number: auth?.user?.phone || '',
        phone_number: '',
        brand_color: '#ea580c',
        description: '',
        logo: null as File | null,
    });

    // Auto-generate slug from name if empty
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData('name', val);
        if (!data.slug) {
            const autoSlug = val
                .toLowerCase()
                .trim()
                .replace(/[\s_]+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/^-+|-+$/g, '');
            if (autoSlug) {
                setData('slug', autoSlug);
            }
        }
    };

    // Live slug availability checker with debounce
    useEffect(() => {
        if (!data.slug || data.slug.length < 2) {
            setSlugStatus(null);
            return;
        }

        const timer = setTimeout(async () => {
            setSlugChecking(true);
            try {
                const res = await fetch(`/onboarding/check-slug?slug=${encodeURIComponent(data.slug)}`);
                const json = await res.json();
                setSlugStatus(json);
            } catch (err) {
                setSlugStatus(null);
            } finally {
                setSlugChecking(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [data.slug]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-gray-50 text-gray-900 pb-12">
            <Head title="إعداد مطعمك أو كافيهك الجديد - FastPage" />

            {/* Mobile Header */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3.5">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-gray-900 leading-tight">إنشاء منيو المطعم أو الكافيه</h1>
                            <p className="text-xs text-gray-500">خطوة واحدة ويبدأ الزبائن بمسح الرمز</p>
                        </div>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-1 rounded-full">
                        ٣٠٠ ج.م / سنة
                    </span>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 pt-5">
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Welcome Banner */}
                    <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-50 rounded-xl text-orange-600 mt-0.5">
                                <QrCode className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">أهلاً بك، {auth?.user?.name}!</h2>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                    أدخل بيانات مطعمك أو كافيهك لنقوم بإنشاء رابط المنيو ورمز الـ QR المخصص لك فوراً.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logo & Brand Color Card */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">الهوية البصرية</h3>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">شعار المطعم أو الكافيه (اختياري)</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="شعار المطعم أو الكافيه" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label
                                        htmlFor="logo-input"
                                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer min-h-[44px] transition"
                                    >
                                        {logoPreview ? 'تغيير الشعار' : 'اختر صورة من هاتفك'}
                                    </label>
                                    <input
                                        id="logo-input"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleLogoChange}
                                        className="sr-only"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">PNG أو JPG بحد أقصى 2 ميجابايت</p>
                                    {errors.logo && <p className="text-xs text-red-500 mt-1 font-medium">{errors.logo}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Brand Color Presets */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">لون هوية المنيو</label>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                {PRESET_COLORS.map((col) => (
                                    <button
                                        key={col.hex}
                                        type="button"
                                        onClick={() => setData('brand_color', col.hex)}
                                        className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                                            data.brand_color === col.hex ? 'border-gray-900 scale-110 shadow' : 'border-transparent'
                                        }`}
                                        style={{ backgroundColor: col.hex }}
                                        title={col.name}
                                    >
                                        {data.brand_color === col.hex && (
                                            <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">معلومات المطعم أو الكافيه</h3>

                        {/* Restaurant Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1.5">
                                اسم المطعم أو الكافيه <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={handleNameChange}
                                placeholder="مثال: كشري الزعيم أو قهوة الفيشاوي"
                                className={`w-full text-base px-3.5 py-3 rounded-xl border ${
                                    errors.name ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                                } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition min-h-[48px]`}
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                        </div>

                        {/* Unique Slug */}
                        <div>
                            <label htmlFor="slug" className="block text-sm font-semibold text-gray-800 mb-1.5">
                                رابط المنيو المختصر <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="slug"
                                    type="text"
                                    dir="ltr"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="koshary-alzaeem"
                                    className={`w-full text-left font-mono text-sm px-3.5 py-3 rounded-xl border ${
                                        errors.slug || (slugStatus && !slugStatus.available)
                                            ? 'border-red-500 bg-red-50/20'
                                            : slugStatus?.available
                                            ? 'border-emerald-500 bg-emerald-50/20'
                                            : 'border-gray-200'
                                    } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition min-h-[48px]`}
                                    required
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {slugChecking && <span className="text-xs text-gray-400 animate-pulse">فحص...</span>}
                                    {!slugChecking && slugStatus?.available && (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    )}
                                    {!slugChecking && slugStatus && !slugStatus.available && (
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1 dir-ltr text-right">
                                رابط المنيو سيكون: <span className="text-orange-600 font-semibold font-mono">/m/{data.slug || 'your-slug'}</span>
                            </p>
                            {errors.slug && <p className="text-xs text-red-500 mt-1 font-medium">{errors.slug}</p>}
                            {slugStatus && !slugStatus.available && !errors.slug && (
                                <p className="text-xs text-red-500 mt-1 font-medium">{slugStatus.message}</p>
                            )}
                        </div>

                        {/* WhatsApp Number */}
                        <div>
                            <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-800 mb-1.5">
                                رقم الواتساب للطلبات والاستفسارات <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="whatsapp"
                                type="tel"
                                dir="ltr"
                                value={data.whatsapp_number}
                                onChange={(e) => setData('whatsapp_number', e.target.value)}
                                placeholder="01012345678"
                                className={`w-full text-left font-mono text-base px-3.5 py-3 rounded-xl border ${
                                    errors.whatsapp_number ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                                } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition min-h-[48px]`}
                                required
                            />
                            <p className="text-[11px] text-gray-400 mt-1">يظهر زر واتساب مباشر لزبائنك على المنيو</p>
                            {errors.whatsapp_number && <p className="text-xs text-red-500 mt-1 font-medium">{errors.whatsapp_number}</p>}
                        </div>

                        {/* Optional Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-1.5">
                                نبذة قصيرة عن المطعم أو الكافيه (اختياري)
                            </label>
                            <textarea
                                id="description"
                                rows={2}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="أشهى المأكولات والمشروبات الساخنة والباردة..."
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                            />
                            {errors.description && <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing || (slugStatus !== null && !slugStatus.available)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-[52px]"
                        >
                            {processing ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    جاري إنشاء مطعمك أو كافيهك...
                                </>
                            ) : (
                                <>
                                    <span>إنشاء المنيو والانتقال للوحة التحكم</span>
                                    <ArrowLeft className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
