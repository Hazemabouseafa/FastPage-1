import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ShieldCheck,
    Store,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Ban,
    RefreshCw,
    Search,
    ExternalLink,
    Trash2,
    Calendar,
    DollarSign,
    LogOut,
    Eye,
    TrendingUp,
    History,
    Phone,
    HardDrive,
    Download,
    FileSpreadsheet,
    FileJson,
    Coins,
    Save,
} from 'lucide-react';

interface Restaurant {
    id: number;
    name: string;
    slug: string;
    whatsapp_number: string;
    phone_number: string | null;
    is_published: boolean;
    subscription_status: string;
    days_remaining: number;
    public_url: string;
    logo_url: string | null;
    categories_count: number;
    menu_items_count: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
    latest_subscription?: {
        id: number;
        status: string;
        starts_at: string | null;
        ends_at: string | null;
        price_paid: string | number;
        notes: string | null;
    };
}

interface AuditLog {
    id: number;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
    user?: {
        name: string;
        role: string;
    };
    restaurant?: {
        name: string;
        slug: string;
    };
}

interface PersistentStorageInfo {
    exists: boolean;
    directory: string;
    json_file: string;
    csv_file: string;
    json_size: number;
    csv_size: number;
    synced_at: string;
    synced_at_human?: string;
    total_customers: number;
}

interface Props {
    restaurants: Restaurant[];
    stats: {
        total_restaurants: number;
        active_subscriptions: number;
        pending_subscriptions: number;
        expired_subscriptions: number;
        suspended_subscriptions: number;
        annual_plan_price: number;
        projected_annual_revenue: number;
        total_collected: number;
    };
    filters: {
        search: string;
        status: string;
    };
    recentLogs: AuditLog[];
    adminPrefix?: string;
    persistentStorage?: PersistentStorageInfo;
}

export default function AdminIndex({ restaurants, stats, filters, recentLogs, adminPrefix, persistentStorage }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [annualPriceInput, setAnnualPriceInput] = useState(stats.annual_plan_price.toString());
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
    const [isSyncingStorage, setIsSyncingStorage] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.dashboard'), {
            search,
            status: statusFilter,
        }, {
            preserveState: true,
        });
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(route('admin.dashboard'), {
            search,
            status,
        }, {
            preserveState: true,
        });
    };

    const handleActivate = (r: Restaurant) => {
        if (confirm(`هل تريد تفعيل اشتراك 365 يوماً لمطعم "${r.name}" بقيمة ${stats.annual_plan_price} ج.م؟`)) {
            router.post(route('admin.restaurants.activate', r.id));
        }
    };

    const handleRenew = (r: Restaurant) => {
        if (confirm(`هل تريد تجديد اشتراك مطعم "${r.name}" لمدة سنة إضافية (+365 يوماً)؟`)) {
            router.post(route('admin.restaurants.renew', r.id));
        }
    };

    const handleSuspend = (r: Restaurant) => {
        if (confirm(`هل أنت متأكد من تعليق مطعم "${r.name}"؟ سيتوقف المنيو فوراً عن العمل.`)) {
            router.post(route('admin.restaurants.suspend', r.id));
        }
    };

    const handleUnsuspend = (r: Restaurant) => {
        if (confirm(`هل تريد إلغاء تعليق مطعم "${r.name}"؟`)) {
            router.post(route('admin.restaurants.unsuspend', r.id));
        }
    };

    const handleDelete = (r: Restaurant) => {
        if (confirm(`تحذير: هل أنت متأكد من حذف مطعم "${r.name}" نهائياً مع كافة الأقسام والأصناف؟`)) {
            router.delete(route('admin.restaurants.destroy', r.id));
        }
    };

    const handleUpdatePrice = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(annualPriceInput);
        if (isNaN(price) || price <= 0) {
            alert('يرجى إدخال سعر سنوي صحيح أكبر من صفر');
            return;
        }

        if (confirm(`هل أنت متأكد من تغيير سعر الاشتراك السنوي إلى ${price} ج.م؟ سيتم تطبيق السعر الجديد على الصفحة الرئيسية والتفعيلات والتجديدات القادمة.`)) {
            setIsUpdatingPrice(true);
            router.post(route('admin.pricing.update'), {
                annual_price: price,
            }, {
                preserveScroll: true,
                onFinish: () => setIsUpdatingPrice(false),
            });
        }
    };

    const handleSyncStorage = () => {
        setIsSyncingStorage(true);
        router.post(route('admin.customers.sync'), {}, {
            preserveScroll: true,
            onFinish: () => setIsSyncingStorage(false),
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 pb-16" dir="rtl">
            <Head title="FastPage - لوحة تحكم السوبر أدمن" />

            {/* Admin Header */}
            <header className="sticky top-0 z-30 bg-slate-900 text-white px-4 py-2.5 sm:py-3 shadow-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <img src="/images/fastpage-logo.png" alt="FastPage" className="h-12 sm:h-14 w-auto object-contain bg-white rounded-xl p-1.5 shadow-sm" />
                        <div>
                            <h1 className="text-base font-bold leading-tight">FastPage &bull; لوحة التحكم المركزية</h1>
                            <span className="text-[11px] text-slate-300 block font-mono mt-0.5">
                                المدير: حازم (admin@hazem) &bull; باقة {stats.annual_plan_price} ج.م/سنة
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {adminPrefix && (
                            <span className="hidden sm:inline-block text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700" title="المسار السري للوحة الإدارة">
                                /{adminPrefix}
                            </span>
                        )}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition min-h-[36px]"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>خروج</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Flash Messages */}
            {flash?.success && (
                <div className="max-w-6xl mx-auto px-4 mt-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                        <div className="flex items-center justify-between text-gray-500 mb-1">
                            <span className="text-xs font-bold">إجمالي المطاعم</span>
                            <Store className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="text-2xl font-black text-gray-900 font-mono">
                            {stats.total_restaurants}
                        </div>
                        <span className="text-[10px] text-gray-400">مطاعم مسجلة بالنظام</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                        <div className="flex items-center justify-between text-gray-500 mb-1">
                            <span className="text-xs font-bold">اشتراكات مفعلة</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 font-mono">
                            {stats.active_subscriptions}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold">تتمتع بصلاحية ٣٦٥ يوماً</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                        <div className="flex items-center justify-between text-gray-500 mb-1">
                            <span className="text-xs font-bold">في انتظار التفعيل</span>
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-2xl font-black text-amber-600 font-mono">
                            {stats.pending_subscriptions}
                        </div>
                        <span className="text-[10px] text-amber-700 font-semibold">بانتظار تأكيد التحويل</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                        <div className="flex items-center justify-between text-gray-500 mb-1">
                            <span className="text-xs font-bold">الدخل السنوي المتوقع</span>
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-black text-blue-700 font-mono">
                            {stats.projected_annual_revenue}{' '}
                            <span className="text-xs font-bold text-gray-500 font-sans">ج.م</span>
                        </div>
                        <span className="text-[10px] text-gray-400">بناءً على {stats.annual_plan_price} ج.م / مطعم</span>
                    </div>
                </div>

                {/* Admin Controls: Annual Pricing & Persistent Storage */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Annual Pricing Control Card */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                        <Coins className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">سعر الاشتراك السنوي</h3>
                                </div>
                                <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                                    تحكم فوري
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                يمكنك كمدير تغيير سعر الاشتراك السنوي. السعر الجديد يُطبق تلقائياً على واجهة الموقع، وحسابات الدخل، وأي تفعيل أو تجديد قادم.
                            </p>
                        </div>

                        <form onSubmit={handleUpdatePrice} className="pt-2 border-t border-gray-100 flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    min="1"
                                    max="100000"
                                    step="1"
                                    value={annualPriceInput}
                                    onChange={(e) => setAnnualPriceInput(e.target.value)}
                                    className="w-full text-sm font-bold pl-16 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                                    placeholder="300"
                                    required
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                                    ج.م/سنة
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingPrice || annualPriceInput === stats.annual_plan_price.toString()}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[42px]"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isUpdatingPrice ? 'جارِ الحفظ...' : 'حفظ السعر'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Persistent Storage & Customer Data Card */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                        <HardDrive className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">التخزين الدائم لبيانات العملاء (Persistent Storage)</h3>
                                </div>
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>جاهز للـ Docker / Coolify</span>
                                </span>
                            </div>

                            <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                يتم حفظ وتحديث كافة بيانات العملاء (المطاعم، الهواتف، الاشتراكات) دورياً داخل مسار التخزين الدائم:
                                <code className="block mt-1 font-mono text-[11px] bg-gray-50 text-slate-800 p-1.5 rounded border border-gray-200 dir-ltr text-left">
                                    /var/www/html/storage/app/persistent
                                </code>
                            </p>

                            <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <div>
                                    <span className="text-gray-400 block">إجمالي العملاء:</span>
                                    <span className="font-bold text-gray-800 font-mono">
                                        {persistentStorage?.total_customers ?? restaurants.length} عميل
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">آخر مزامنة للتخزين:</span>
                                    <span className="font-bold text-gray-800">
                                        {persistentStorage?.synced_at_human ?? 'مُحدث الآن'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={handleSyncStorage}
                                disabled={isSyncingStorage}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition disabled:opacity-50 min-h-[38px]"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingStorage ? 'animate-spin' : ''}`} />
                                <span>{isSyncingStorage ? 'جارِ المزامنة...' : 'مزامنة التخزين الآن'}</span>
                            </button>

                            <a
                                href={route('admin.customers.export', { format: 'json' })}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition min-h-[38px]"
                                title="تحميل ملف JSON للعملاء"
                            >
                                <FileJson className="w-3.5 h-3.5 text-amber-600" />
                                <span>تحميل JSON</span>
                            </a>

                            <a
                                href={route('admin.customers.export', { format: 'csv' })}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition min-h-[38px]"
                                title="تحميل ملف Excel / CSV للعملاء"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                <span>تحميل Excel (CSV)</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث بالاسم، الرابط، الهاتف، الإيميل..."
                            className="w-full text-xs pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 min-h-[42px]"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </form>

                    {/* Status filter buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                        {[
                            { id: '', label: 'الكل' },
                            { id: 'active', label: 'نشط' },
                            { id: 'pending', label: 'بانتظار التفعيل' },
                            { id: 'grace', label: 'فترة سماح' },
                            { id: 'expired', label: 'منتهي' },
                            { id: 'suspended', label: 'معلق' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => handleStatusFilterChange(s.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition min-h-[36px] ${
                                    statusFilter === s.id
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Restaurants List / Table */}
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">
                            قائمة المطاعم ({restaurants.length})
                        </h2>
                    </div>

                    {restaurants.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-xs">
                            لا توجد مطاعم مطابقة لشروط البحث
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {restaurants.map((r) => {
                                const sub = r.latest_subscription;
                                const isExpiredOrNone = r.subscription_status === 'expired' || r.subscription_status === 'none';

                                return (
                                    <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                                        {/* Restaurant Info */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-12 h-12 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center overflow-hidden shrink-0">
                                                {r.logo_url ? (
                                                    <img src={r.logo_url} alt={r.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Store className="w-6 h-6 text-orange-600" />
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-black text-gray-900">{r.name}</h3>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                        r.subscription_status === 'active'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : r.subscription_status === 'pending'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : r.subscription_status === 'grace'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : r.subscription_status === 'suspended'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {r.subscription_status === 'active' && 'نشط'}
                                                        {r.subscription_status === 'pending' && 'بانتظار التفعيل'}
                                                        {r.subscription_status === 'grace' && 'سماح'}
                                                        {r.subscription_status === 'suspended' && 'معلق'}
                                                        {r.subscription_status === 'expired' && 'منتهي'}
                                                        {r.subscription_status === 'none' && 'بدون اشتراك'}
                                                    </span>

                                                    {r.is_published ? (
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">منشور</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">مسودة</span>
                                                    )}
                                                </div>

                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                                                    <span className="font-mono text-orange-600 font-bold">/m/{r.slug}</span>
                                                    <span>&bull;</span>
                                                    <span>المالك: <strong className="text-gray-700">{r.user?.name}</strong></span>
                                                    <span>&bull;</span>
                                                    <span dir="ltr" className="font-mono">{r.whatsapp_number}</span>
                                                    <span>&bull;</span>
                                                    <span>{r.categories_count} أقسام &bull; {r.menu_items_count} صنف</span>
                                                </div>

                                                {sub && sub.ends_at && (
                                                    <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>ينتهي في: <strong className="text-gray-600 font-mono">{sub.ends_at.substring(0, 10)}</strong></span>
                                                        <span>(متبقي {r.days_remaining} يوم)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                                            {/* Activate / Renew Buttons */}
                                            {r.subscription_status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleActivate(r)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition min-h-[38px]"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>تفعيل ٣٦٥ يوماً</span>
                                                </button>
                                            )}

                                            {(r.subscription_status === 'active' || r.subscription_status === 'grace' || isExpiredOrNone) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRenew(r)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition min-h-[38px]"
                                                    title="تجديد لسنة إضافية"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    <span>تجديد (+سنة)</span>
                                                </button>
                                            )}

                                            {/* Suspend / Unsuspend */}
                                            {r.subscription_status !== 'suspended' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSuspend(r)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition min-h-[38px]"
                                                    title="إيقاف مؤقت للمنيو"
                                                >
                                                    <Ban className="w-3.5 h-3.5" />
                                                    <span>تعليق</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnsuspend(r)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition min-h-[38px]"
                                                >
                                                    <span>إلغاء التعليق</span>
                                                </button>
                                            )}

                                            {/* View Live Menu */}
                                            <a
                                                href={`/m/${r.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition min-h-[38px] flex items-center"
                                                title="معاينة المنيو"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>

                                            {/* WhatsApp Owner */}
                                            <a
                                                href={`https://wa.me/${r.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً إدارة مطعم ${r.name}، بخصوص اشتراك المنيو الرقمي الخاص بكم.`)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition min-h-[38px] flex items-center"
                                                title="مراسلة صاحب المطعم على واتساب"
                                            >
                                                <Phone className="w-4 h-4" />
                                            </a>

                                            {/* Delete Restaurant */}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(r)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition min-h-[38px] flex items-center"
                                                title="حذف المطعم نهائياً"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Audit Logs Table */}
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <History className="w-4 h-4 text-orange-600" />
                        <h2 className="text-sm font-bold text-gray-900">سجل النشاطات وعمليات الاشتراكات</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold">
                                    <th className="pb-2">الوقت</th>
                                    <th className="pb-2">العملية</th>
                                    <th className="pb-2">المطعم</th>
                                    <th className="pb-2">المستخدم</th>
                                    <th className="pb-2">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentLogs.map((log) => (
                                    <tr key={log.id} className="text-gray-700">
                                        <td className="py-2.5 font-mono text-gray-400 text-[11px] whitespace-nowrap" dir="ltr">
                                            {log.created_at ? log.created_at.substring(0, 16).replace('T', ' ') : ''}
                                        </td>
                                        <td className="py-2.5 font-bold whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px]">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-2.5 font-bold text-gray-900 whitespace-nowrap">
                                            {log.restaurant?.name || '—'}
                                        </td>
                                        <td className="py-2.5 whitespace-nowrap">
                                            {log.user?.name || 'النظام'}
                                        </td>
                                        <td className="py-2.5 text-gray-500 max-w-xs truncate">
                                            {log.description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
