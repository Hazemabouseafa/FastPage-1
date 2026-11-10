import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import {
    Utensils,
    QrCode,
    Settings,
    CreditCard,
    Plus,
    Edit2,
    Trash2,
    Check,
    Copy,
    Share2,
    Printer,
    Download,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    Clock,
    X,
    Upload,
    ToggleLeft,
    ToggleRight,
    Search,
    MessageCircle,
    Eye,
    Sparkles,
} from 'lucide-react';

interface MenuItem {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: string | number;
    image_url: string | null;
    is_available: boolean;
    display_order: number;
}

interface Category {
    id: number;
    name: string;
    display_order: number;
    is_active: boolean;
    menu_items_count?: number;
}

interface Restaurant {
    id: number;
    name: string;
    slug: string;
    whatsapp_number: string;
    phone_number: string | null;
    brand_color: string;
    description: string | null;
    is_published: boolean;
    subscription_status: string;
    days_remaining: number;
    public_url: string;
    formatted_whatsapp_url: string | null;
    logo_url: string | null;
}

interface Props {
    restaurant: Restaurant;
    categories: Category[];
    items: MenuItem[];
    stats: {
        total_items: number;
        available_items: number;
        unavailable_items: number;
        total_categories: number;
        is_published: boolean;
        has_active_subscription: boolean;
        subscription_status: string;
        days_remaining: number;
    };
}

const PRESET_COLORS = [
    { name: 'برتقالي دافئ', hex: '#ea580c' },
    { name: 'عنبري ذهبي', hex: '#d97706' },
    { name: 'أخضر زمردي', hex: '#059669' },
    { name: 'أحمر قرمزي', hex: '#dc2626' },
    { name: 'أزرق ملكي', hex: '#2563eb' },
    { name: 'رمادي داكن', hex: '#1e293b' },
];

export default function Dashboard({ restaurant, categories, items, stats }: Props) {
    const { flash, saas } = usePage().props as any;

    // Active bottom navigation tab: 'menu' | 'qr' | 'settings' | 'subscription'
    const [activeTab, setActiveTab] = useState<'menu' | 'qr' | 'settings' | 'subscription'>('menu');

    // Menu category filter
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Copy URL feedback
    const [copied, setCopied] = useState(false);

    // Category Form
    const categoryForm = useForm({
        name: '',
    });

    // Item Form
    const itemForm = useForm({
        category_id: categories.length > 0 ? categories[0].id : '',
        name: '',
        description: '',
        price: '',
        is_available: true,
        image: null as File | null,
    });
    const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);

    // Restaurant Settings Form
    const settingsForm = useForm({
        name: restaurant.name,
        whatsapp_number: restaurant.whatsapp_number,
        phone_number: restaurant.phone_number || '',
        brand_color: restaurant.brand_color || '#ea580c',
        description: restaurant.description || '',
        logo: null as File | null,
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(restaurant.logo_url);

    // Category Handlers
    const openAddCategory = () => {
        setEditingCategory(null);
        categoryForm.reset();
        setIsCategoryModalOpen(true);
    };

    const openEditCategory = (cat: Category) => {
        setEditingCategory(cat);
        categoryForm.setData('name', cat.name);
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            categoryForm.put(route('categories.update', editingCategory.id), {
                onSuccess: () => setIsCategoryModalOpen(false),
            });
        } else {
            categoryForm.post(route('categories.store'), {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    categoryForm.reset();
                },
            });
        }
    };

    const handleDeleteCategory = (cat: Category) => {
        if (confirm(`هل أنت متأكد من حذف قسم "${cat.name}" وجميع الأصناف الموجودة بداخله؟`)) {
            router.delete(route('categories.destroy', cat.id));
        }
    };

    // Item Handlers
    const openAddItem = () => {
        setEditingItem(null);
        itemForm.reset();
        itemForm.setData('category_id', selectedCategory !== 'all' ? selectedCategory : (categories[0]?.id || ''));
        setItemImagePreview(null);
        setIsItemModalOpen(true);
    };

    const openEditItem = (item: MenuItem) => {
        setEditingItem(item);
        itemForm.setData({
            category_id: item.category_id,
            name: item.name,
            description: item.description || '',
            price: String(item.price),
            is_available: item.is_available,
            image: null,
        });
        setItemImagePreview(item.image_url);
        setIsItemModalOpen(true);
    };

    const handleSaveItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            // Multipart update in Laravel requires POST with FormData
            itemForm.post(route('items.update', editingItem.id), {
                onSuccess: () => setIsItemModalOpen(false),
            });
        } else {
            itemForm.post(route('items.store'), {
                onSuccess: () => {
                    setIsItemModalOpen(false);
                    itemForm.reset();
                },
            });
        }
    };

    const handleDeleteItem = (item: MenuItem) => {
        if (confirm(`هل تريد حذف "${item.name}" نهائياً من المنيو؟`)) {
            router.delete(route('items.destroy', item.id));
        }
    };

    // 1-Tap Toggle Availability (optimistic + instant)
    const handleToggleAvailability = (item: MenuItem) => {
        router.post(route('items.toggle_availability', item.id), {}, {
            preserveScroll: true,
        });
    };

    const handleTogglePublish = () => {
        router.post(route('restaurant.toggle_publish'), {}, {
            preserveScroll: true,
        });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(restaurant.public_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.post(route('restaurant.update'), {
            preserveScroll: true,
        });
    };

    // Filter items
    const filteredItems = items.filter((item) => {
        const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-28" dir="rtl">
            <Head title={`لوحة تحكم - ${restaurant.name}`} />

            {/* Mobile Top Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-xs">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden shrink-0"
                            style={{ backgroundColor: restaurant.brand_color || '#ea580c' }}
                        >
                            {restaurant.logo_url ? (
                                <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
                            ) : (
                                <Utensils className="w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-base font-extrabold text-gray-900 leading-tight truncate max-w-[170px] xs:max-w-[220px]">
                                    {restaurant.name}
                                </h1>
                                {restaurant.is_published ? (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="منشور للعامة"></span>
                                ) : (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">مسودة</span>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono">/m/{restaurant.slug}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={restaurant.public_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-bold transition min-h-[38px]"
                        >
                            <Eye className="w-4 h-4" />
                            <span>معاينة المنيو</span>
                        </a>
                    </div>
                </div>
            </header>

            {/* Flash Messages */}
            {flash?.success && (
                <div className="max-w-2xl mx-auto px-4 mt-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="max-w-2xl mx-auto px-4 mt-3">
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}

            {/* Subscription Warning / Renewal Banner */}
            {restaurant.subscription_status === 'pending' && (
                <div className="max-w-2xl mx-auto px-4 mt-3">
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h2 className="text-xs font-bold text-amber-900">الاشتراك السنوي في انتظار التفعيل</h2>
                            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                                اشتراك مطعمك (٣٠٠ ج.م / سنة) يتم تفعيله يدوياً بواسطة إدارة المنصة. تواصل مع الدعم الفني لتفعيل المنيو فوراً.
                            </p>
                            <a
                                href={`https://wa.me/${saas?.admin_support_whatsapp || '201000000000'}?text=${encodeURIComponent(`مرحباً، أود تفعيل اشتراك مطعمي: ${restaurant.name} (رابط: ${restaurant.slug})`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-xl shadow-xs hover:bg-amber-700 transition"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>تفعيل الاشتراك عبر واتساب</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {restaurant.subscription_status === 'grace' && (
                <div className="max-w-2xl mx-auto px-4 mt-3">
                    <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h2 className="text-xs font-bold text-orange-900">أنت في فترة السماح (انتهت الـ ٣٦٥ يوماً)</h2>
                            <p className="text-[11px] text-orange-700 mt-0.5">
                                يرجى تجديد الاشتراك السنوي (٣٠٠ ج.م) لتفادي إيقاف المنيو الرقمي للزبائن.
                            </p>
                            <button
                                onClick={() => setActiveTab('subscription')}
                                className="mt-2 text-xs font-bold text-orange-700 underline"
                            >
                                تجديد الاشتراك الآن &larr;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {restaurant.subscription_status === 'expired' && (
                <div className="max-w-2xl mx-auto px-4 mt-3">
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h2 className="text-xs font-bold text-red-900">انتهى اشتراك المنيو السنوي</h2>
                            <p className="text-[11px] text-red-700 mt-0.5">
                                المنيو معطل حالياً ولا يمكن للزبائن تصفحه. جدد الاشتراك لتفعيله فوراً بنفس رابط الـ QR.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT */}
            <main className="max-w-2xl mx-auto px-4 mt-4">
                {/* 1. MENU TAB */}
                {activeTab === 'menu' && (
                    <div className="space-y-4">
                        {/* Search & Add Category Row */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن صنف أو وجبة..."
                                    className="w-full text-xs pr-9 pl-3 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition min-h-[42px]"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                            </div>

                            <button
                                type="button"
                                onClick={openAddCategory}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shrink-0 min-h-[42px] transition shadow-xs"
                            >
                                <Plus className="w-4 h-4 text-orange-600" />
                                <span>قسم جديد</span>
                            </button>
                        </div>

                        {/* Category Filter Chips (Horizontal Scrollable) */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition min-h-[38px] ${
                                    selectedCategory === 'all'
                                        ? 'bg-gray-900 text-white shadow-xs'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                الكل ({items.length})
                            </button>

                            {categories.map((cat) => (
                                <div key={cat.id} className="relative group shrink-0 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition min-h-[38px] ${
                                            selectedCategory === cat.id
                                                ? 'bg-orange-600 text-white shadow-xs'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span>{cat.name}</span>
                                        {cat.menu_items_count !== undefined && (
                                            <span className="ms-1.5 opacity-70 text-[10px]">({cat.menu_items_count})</span>
                                        )}
                                    </button>

                                    {/* Quick edit category pencil on active */}
                                    {selectedCategory === cat.id && (
                                        <button
                                            type="button"
                                            onClick={() => openEditCategory(cat)}
                                            className="ms-1 p-1.5 rounded-lg bg-orange-100 text-orange-800 hover:bg-orange-200 transition"
                                            title="تعديل هذا القسم"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Items List */}
                        {filteredItems.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200 my-6">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
                                    <Utensils className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">لا توجد أصناف هنا حالياً</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                    أضف وجباتك الأولى بأسعارها وصورها لتظهر لزبائنك فوراً على الموبايل
                                </p>
                                <button
                                    type="button"
                                    onClick={openAddItem}
                                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-600/20 hover:bg-orange-700 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>إضافة صنف جديد</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`bg-white rounded-2xl p-3.5 border transition-all shadow-xs flex items-center gap-3 ${
                                            item.is_available ? 'border-gray-100' : 'border-gray-200/80 bg-gray-50/60 opacity-80'
                                        }`}
                                    >
                                        {/* Thumbnail Photo */}
                                        <div className="w-16 h-16 rounded-xl bg-orange-50/60 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <Utensils className="w-6 h-6 text-orange-300" />
                                            )}
                                        </div>

                                        {/* Item Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm font-bold text-gray-900 leading-snug truncate">
                                                    {item.name}
                                                </h4>
                                                <span className="text-sm font-black text-orange-600 shrink-0 font-mono">
                                                    {item.price} <span className="text-xs font-bold text-gray-600 font-sans">ج.م</span>
                                                </span>
                                            </div>

                                            {item.description && (
                                                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                                    {item.description}
                                                </p>
                                            )}

                                            {/* Action Bar (One-Handed Mobile Reach) */}
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                                {/* 1-Tap Availability Switch */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleAvailability(item)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                                        item.is_available
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                    <span>{item.is_available ? 'متوفر' : 'غير متوفر (نفد)'}</span>
                                                </button>

                                                {/* Edit & Delete Buttons */}
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditItem(item)}
                                                        className="p-1.5 text-gray-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition"
                                                        title="تعديل الصنف"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteItem(item)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                                                        title="حذف الصنف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Floating Add Item Button for Smartphone */}
                        <div className="fixed bottom-20 left-4 z-20">
                            <button
                                type="button"
                                onClick={openAddItem}
                                className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-xl shadow-orange-600/40 flex items-center justify-center transition active:scale-95"
                                title="إضافة صنف جديد"
                            >
                                <Plus className="w-6 h-6 stroke-[2.5]" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. QR CODE & SHARE TAB */}
                {activeTab === 'qr' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                            <h2 className="text-base font-extrabold text-gray-900">رمز الـ QR الخاص بمطعمك</h2>
                            <p className="text-xs text-gray-500 mt-1">امسح الرمز بكاميرا هاتفك لمعاينة المنيو مباشرة</p>

                            {/* Live QR Image Box */}
                            <div className="my-5 p-4 bg-white border-2 border-dashed border-orange-200 rounded-3xl inline-block shadow-sm">
                                <img
                                    src={route('restaurant.qr.svg', restaurant.slug)}
                                    alt={`QR Code ${restaurant.name}`}
                                    className="w-52 h-52 mx-auto"
                                />
                            </div>

                            <p className="text-xs font-mono font-bold text-gray-700 dir-ltr text-center">
                                {restaurant.public_url}
                            </p>

                            {/* Action Buttons */}
                            <div className="mt-6 grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold shadow-xs transition min-h-[46px]"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                                    <span>{copied ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
                                </button>

                                <a
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`تفضل بتصفح قائمة طعام ${restaurant.name} عبر هذا الرابط:\n${restaurant.public_url}`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition min-h-[46px]"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>مشاركة واتساب</span>
                                </a>

                                <a
                                    href={route('restaurant.qr.stand', restaurant.slug)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition min-h-[46px]"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>طباعة كارت الطاولة PDF</span>
                                </a>

                                <a
                                    href={route('restaurant.qr.svg', restaurant.slug)}
                                    download={`qr-${restaurant.slug}.svg`}
                                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100 text-orange-800 text-xs font-bold transition min-h-[46px]"
                                >
                                    <Download className="w-4 h-4 text-orange-600" />
                                    <span>تحميل رمز QR عالي الدقة</span>
                                </a>
                            </div>
                        </div>

                        {/* Tips Card */}
                        <div className="bg-orange-50/60 rounded-2xl p-4 border border-orange-100 text-xs text-orange-900 leading-relaxed space-y-1.5">
                            <h4 className="font-bold flex items-center gap-1.5 text-orange-800">
                                <Sparkles className="w-4 h-4" />
                                نصيحة لتجربة زبائن ممتازة:
                            </h4>
                            <p>
                                اطبع كارت الطاولة بحجم A5 أو كارت ستاند صغير، وضعه على كل طاولة وفي مدخل المطعم.
                                الرابط ورمز الـ QR ثابتان ولا يتغيران حتى عند تعديل الوجبات أو تجديد الاشتراك!
                            </p>
                        </div>
                    </div>
                )}

                {/* 3. SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                        {/* Publish Status Card */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">حالة نشر المنيو</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {restaurant.is_published
                                        ? 'المنيو منشور للعامة ويمكن للزبائن تصفحه'
                                        : 'المنيو مخفي حالياً (مسودة أثناء التعديل)'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleTogglePublish}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[40px] flex items-center gap-1.5 ${
                                    restaurant.is_published
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${restaurant.is_published ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                                <span>{restaurant.is_published ? 'منشور (نشط)' : 'مخفي (مسودة)'}</span>
                            </button>
                        </div>

                        {/* Logo & Colors Card */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">الهوية والشعار</h3>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">شعار المطعم</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="شعار المطعم" className="w-full h-full object-cover" />
                                        ) : (
                                            <Utensils className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="settings-logo"
                                            className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer min-h-[40px] transition"
                                        >
                                            تغيير الشعار
                                        </label>
                                        <input
                                            id="settings-logo"
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    settingsForm.setData('logo', file);
                                                    setLogoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="sr-only"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">لون الهوية البصرية</label>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    {PRESET_COLORS.map((col) => (
                                        <button
                                            key={col.hex}
                                            type="button"
                                            onClick={() => settingsForm.setData('brand_color', col.hex)}
                                            className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                                                settingsForm.data.brand_color === col.hex ? 'border-gray-900 scale-110 shadow' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: col.hex }}
                                            title={col.name}
                                        >
                                            {settingsForm.data.brand_color === col.hex && (
                                                <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Basic Details Card */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3.5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">معلومات التواصل</h3>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">اسم المطعم</label>
                                <input
                                    type="text"
                                    value={settingsForm.data.name}
                                    onChange={(e) => settingsForm.setData('name', e.target.value)}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 min-h-[44px]"
                                    required
                                />
                                {settingsForm.errors.name && <p className="text-xs text-red-500 mt-1">{settingsForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">رقم الواتساب للطلبات</label>
                                <input
                                    type="tel"
                                    dir="ltr"
                                    value={settingsForm.data.whatsapp_number}
                                    onChange={(e) => settingsForm.setData('whatsapp_number', e.target.value)}
                                    className="w-full text-left font-mono text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 min-h-[44px]"
                                    required
                                />
                                {settingsForm.errors.whatsapp_number && <p className="text-xs text-red-500 mt-1">{settingsForm.errors.whatsapp_number}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">رقم هاتف إضافي (اختياري)</label>
                                <input
                                    type="tel"
                                    dir="ltr"
                                    value={settingsForm.data.phone_number}
                                    onChange={(e) => settingsForm.setData('phone_number', e.target.value)}
                                    className="w-full text-left font-mono text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 min-h-[44px]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">وصف قصير</label>
                                <textarea
                                    rows={2}
                                    value={settingsForm.data.description}
                                    onChange={(e) => settingsForm.setData('description', e.target.value)}
                                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={settingsForm.processing}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-orange-600/20 transition min-h-[48px]"
                        >
                            {settingsForm.processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                    </form>
                )}

                {/* 4. SUBSCRIPTION TAB */}
                {activeTab === 'subscription' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
                                <CreditCard className="w-7 h-7" />
                            </div>

                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                                restaurant.subscription_status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : restaurant.subscription_status === 'grace'
                                    ? 'bg-amber-100 text-amber-800'
                                    : restaurant.subscription_status === 'pending'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {restaurant.subscription_status === 'active' && 'الاشتراك نشط ومفعل'}
                                {restaurant.subscription_status === 'grace' && 'فترة سماح (تجديد مطلوب)'}
                                {restaurant.subscription_status === 'pending' && 'في انتظار التفعيل اليدوي'}
                                {restaurant.subscription_status === 'expired' && 'منتهي الصلاحية'}
                                {restaurant.subscription_status === 'suspended' && 'حساب معلق'}
                            </span>

                            <div className="text-3xl font-black text-gray-900 mt-2 font-mono">
                                {restaurant.days_remaining} <span className="text-sm font-bold text-gray-500 font-sans">يوماً متبقياً</span>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                خطة سنوية ثابتة بقيمة {saas?.annual_price || 300} ج.م فقط لمدة ٣٦٥ يوماً من تاريخ التفعيل
                            </p>

                            <div className="mt-6 pt-5 border-t border-gray-100 text-right space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-700">رسوم التجديد السنوية:</span>
                                    <span className="font-bold text-orange-600 font-mono">{saas?.annual_price || 300} ج.م</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-700">طريقة الدفع والتفعيل:</span>
                                    <span>تحويل يدوي (فودافون كاش / إنستاباي)</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href={`https://wa.me/${saas?.admin_support_whatsapp || '201000000000'}?text=${encodeURIComponent(`مرحباً، أود تجديد / تفعيل اشتراك مطعمي: ${restaurant.name} (رابط: ${restaurant.slug}) بمبلغ ${saas?.annual_price || 300} ج.م`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition min-h-[48px] flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>طلب تفعيل أو تجديد الاشتراك عبر واتساب</span>
                                </a>
                            </div>
                        </div>

                        {/* Logout Option */}
                        <div className="text-center pt-4">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-xs text-gray-400 hover:text-red-600 font-semibold transition"
                            >
                                تسجيل الخروج من الحساب
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            {/* STICKY BOTTOM NAVIGATION (ONE-HANDED MOBILE OPTIMIZED) */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 px-3 py-2 pb-safe shadow-lg">
                <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('menu')}
                        className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition min-h-[50px] ${
                            activeTab === 'menu' ? 'text-orange-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Utensils className="w-5 h-5 mb-1" />
                        <span className="text-[11px] leading-tight">المنيو</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('qr')}
                        className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition min-h-[50px] ${
                            activeTab === 'qr' ? 'text-orange-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <QrCode className="w-5 h-5 mb-1" />
                        <span className="text-[11px] leading-tight">رمز الـ QR</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition min-h-[50px] ${
                            activeTab === 'settings' ? 'text-orange-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Settings className="w-5 h-5 mb-1" />
                        <span className="text-[11px] leading-tight">الإعدادات</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('subscription')}
                        className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition min-h-[50px] relative ${
                            activeTab === 'subscription' ? 'text-orange-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <CreditCard className="w-5 h-5 mb-1" />
                        <span className="text-[11px] leading-tight">الاشتراك</span>
                        {restaurant.subscription_status !== 'active' && (
                            <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-orange-500"></span>
                        )}
                    </button>
                </div>
            </nav>

            {/* ADD / EDIT CATEGORY MODAL */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">
                                {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCategory} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">اسم القسم</label>
                                <input
                                    type="text"
                                    value={categoryForm.data.name}
                                    onChange={(e) => categoryForm.setData('name', e.target.value)}
                                    placeholder="مثال: الشوربات، الوجبات الرئيسية..."
                                    className="w-full text-sm px-3.5 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 min-h-[46px]"
                                    autoFocus
                                    required
                                />
                                {categoryForm.errors.name && <p className="text-xs text-red-500 mt-1">{categoryForm.errors.name}</p>}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={categoryForm.processing}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition min-h-[46px]"
                                >
                                    {categoryForm.processing ? 'جاري الحفظ...' : 'حفظ القسم'}
                                </button>

                                {editingCategory && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCategoryModalOpen(false);
                                            handleDeleteCategory(editingCategory);
                                        }}
                                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition min-h-[46px]"
                                        title="حذف هذا القسم"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD / EDIT MENU ITEM MODAL */}
            {isItemModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">
                                {editingItem ? 'تعديل الصنف' : 'إضافة صنف جديد'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsItemModalOpen(false)}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveItem} className="space-y-3.5">
                            {/* Category Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">القسم</label>
                                <select
                                    value={itemForm.data.category_id}
                                    onChange={(e) => itemForm.setData('category_id', e.target.value)}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 min-h-[46px]"
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Item Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">اسم الصنف أو الوجبة</label>
                                <input
                                    type="text"
                                    value={itemForm.data.name}
                                    onChange={(e) => itemForm.setData('name', e.target.value)}
                                    placeholder="مثال: كشري فويل كبير"
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 min-h-[46px]"
                                    required
                                />
                                {itemForm.errors.name && <p className="text-xs text-red-500 mt-1">{itemForm.errors.name}</p>}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">السعر (بالجنيه المصري)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        dir="ltr"
                                        value={itemForm.data.price}
                                        onChange={(e) => itemForm.setData('price', e.target.value)}
                                        placeholder="45"
                                        className="w-full text-left font-mono text-base px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 min-h-[46px]"
                                        required
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                        ج.م
                                    </span>
                                </div>
                                {itemForm.errors.price && <p className="text-xs text-red-500 mt-1">{itemForm.errors.price}</p>}
                            </div>

                            {/* Optional Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف والمكونات (اختياري)</label>
                                <textarea
                                    rows={2}
                                    value={itemForm.data.description}
                                    onChange={(e) => itemForm.setData('description', e.target.value)}
                                    placeholder="أرز، عدس، مكرونة، حمص، دقة وصلصة..."
                                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                                />
                            </div>

                            {/* Item Photo Upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">صورة الصنف (اختياري)</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                        {itemImagePreview ? (
                                            <img src={itemImagePreview} alt="معاينة" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="item-photo"
                                        className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 cursor-pointer min-h-[40px] flex items-center"
                                    >
                                        {itemImagePreview ? 'تغيير الصورة' : 'اختر صورة من الهاتف'}
                                    </label>
                                    <input
                                        id="item-photo"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                itemForm.setData('image', file);
                                                setItemImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">حد أقصى 2 ميجابايت (JPG أو PNG أو WebP)</p>
                            </div>

                            {/* Availability Toggle in form */}
                            <div className="pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={itemForm.data.is_available}
                                        onChange={(e) => itemForm.setData('is_available', e.target.checked)}
                                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                                    />
                                    <span className="text-xs font-bold text-gray-800">الصنف متوفر للطلب حالياً</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={itemForm.processing}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-orange-600/20 transition min-h-[48px]"
                                >
                                    {itemForm.processing ? 'جاري الحفظ...' : 'حفظ الصنف في المنيو'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
