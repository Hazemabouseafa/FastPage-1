import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Utensils, MessageCircle, Phone, Search, Share2, Check, Sparkles } from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    display_order: number;
}

interface Category {
    id: number;
    name: string;
    display_order: number;
    items: MenuItem[];
}

interface Restaurant {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    brand_color: string;
    logo_url: string | null;
    cover_url: string | null;
    whatsapp_url: string | null;
    phone: string | null;
    currency: string;
}

interface Props {
    restaurant: Restaurant;
    categories: Category[];
}

export default function Show({ restaurant, categories }: Props) {
    const [activeCategoryId, setActiveCategoryId] = useState<number>(categories[0]?.id || 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);

    const brandColor = restaurant.brand_color || '#ea580c';

    // Smooth scroll to category section
    const scrollToCategory = (catId: number) => {
        setActiveCategoryId(catId);
        const el = document.getElementById(`category-${catId}`);
        if (el) {
            const yOffset = -70; // Header & sticky tabs offset
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: restaurant.name,
                text: `تفضل بتصفح منيو ${restaurant.name}:`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-24" dir="rtl">
            <Head>
                <title>{`${restaurant.name} - قائمة الطعام`}</title>
                <meta name="description" content={restaurant.description || `قائمة طعام ${restaurant.name} الرقمية`} />
            </Head>

            {/* Restaurant Cover / Header Banner */}
            <div
                className="relative h-28 sm:h-36 w-full"
                style={{
                    background: `linear-gradient(135deg, ${brandColor} 0%, #1e1b4b 100%)`,
                }}
            >
                {restaurant.cover_url && (
                    <img
                        src={restaurant.cover_url}
                        alt="غلاف المطعم"
                        className="w-full h-full object-cover opacity-30"
                    />
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleShare}
                        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-gray-800 flex items-center justify-center shadow-md active:scale-95 transition"
                        title="مشاركة المنيو"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Restaurant Profile Info */}
            <div className="max-w-xl mx-auto px-4 -mt-12 relative z-10">
                <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-gray-100 flex flex-col items-center text-center">
                    {/* Restaurant Logo with fetchpriority="high" for LCP compliance */}
                    <div
                        className="w-20 h-20 rounded-2xl p-1 bg-white shadow-md -mt-12 mb-2.5 overflow-hidden flex items-center justify-center border-2"
                        style={{ borderColor: brandColor }}
                    >
                        {restaurant.logo_url ? (
                            <img
                                src={restaurant.logo_url}
                                alt={restaurant.name}
                                fetchPriority="high"
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            <div
                                className="w-full h-full rounded-xl flex items-center justify-center text-white"
                                style={{ backgroundColor: brandColor }}
                            >
                                <Utensils className="w-8 h-8" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                        {restaurant.name}
                    </h1>

                    {restaurant.description && (
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-sm">
                            {restaurant.description}
                        </p>
                    )}

                    {/* Quick WhatsApp / Call Link */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                        {restaurant.whatsapp_url && (
                            <a
                                href={restaurant.whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-xs hover:bg-emerald-100 transition"
                            >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>طلب أو استفسار واتساب</span>
                            </a>
                        )}

                        {restaurant.phone && (
                            <a
                                href={`tel:${restaurant.phone}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 hover:bg-gray-200 transition"
                            >
                                <Phone className="w-3.5 h-3.5 text-gray-600" />
                                <span dir="ltr">{restaurant.phone}</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Search Bar in Menu */}
                <div className="mt-3.5 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن أكلة أو مشروب بالاسم..."
                        className="w-full text-xs pr-9 pl-4 py-2.5 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 shadow-xs transition min-h-[44px]"
                        style={{ outlineColor: brandColor }}
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* Sticky Horizontal Category Tabs */}
            <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md py-2.5 px-4 mt-3 border-b border-gray-200/60 shadow-2xs">
                <div className="max-w-xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => scrollToCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all min-h-[38px] ${
                                activeCategoryId === cat.id
                                    ? 'text-white shadow-sm'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                            }`}
                            style={{
                                backgroundColor: activeCategoryId === cat.id ? brandColor : undefined,
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Sections & Food Cards */}
            <div className="max-w-xl mx-auto px-4 mt-4 space-y-6">
                {categories.map((category) => {
                    const filteredCategoryItems = category.items.filter((item) => {
                        if (!searchQuery) return true;
                        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
                    });

                    if (filteredCategoryItems.length === 0 && searchQuery) {
                        return null;
                    }

                    return (
                        <section key={category.id} id={`category-${category.id}`} className="scroll-mt-20">
                            {/* Category Header */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: brandColor }}></span>
                                <h2 className="text-base font-black text-gray-900 tracking-tight">
                                    {category.name}
                                </h2>
                                <span className="text-[11px] font-bold text-gray-400">
                                    ({filteredCategoryItems.length})
                                </span>
                            </div>

                            {/* Food Cards */}
                            <div className="space-y-2.5">
                                {filteredCategoryItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`bg-white rounded-2xl p-3.5 border transition-all shadow-xs flex items-start gap-3.5 ${
                                            item.is_available
                                                ? 'border-gray-100 hover:border-gray-200'
                                                : 'border-gray-100 bg-gray-50/70 opacity-60'
                                        }`}
                                    >
                                        {/* Card Photo (with lazy loading) */}
                                        {item.image_url && (
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-sm font-extrabold text-gray-900 leading-snug">
                                                    {item.name}
                                                </h3>
                                                <div className="text-sm font-black text-gray-900 shrink-0 font-mono text-left">
                                                    {item.price}{' '}
                                                    <span className="text-xs font-bold text-gray-500 font-sans">
                                                        {restaurant.currency}
                                                    </span>
                                                </div>
                                            </div>

                                            {item.description && (
                                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}

                                            {!item.is_available && (
                                                <div className="mt-2">
                                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700">
                                                        غير متوفر حالياً (نفد)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Floating WhatsApp Quick Order Button */}
            {restaurant.whatsapp_url && (
                <div className="fixed bottom-4 left-4 right-4 z-30 max-w-xl mx-auto flex justify-center">
                    <a
                        href={restaurant.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 transition min-h-[50px]"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>تواصل مع المطعم عبر واتساب</span>
                    </a>
                </div>
            )}

            {/* Footer */}
            <footer className="mt-16 text-center text-xs text-gray-400 py-6 border-t border-gray-100">
                <div className="max-w-xl mx-auto px-4 flex flex-col items-center gap-1.5">
                    <p className="font-semibold text-gray-500">{restaurant.name}</p>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                        <img src="/images/fastpage-logo.png" alt="FastPage" className="h-4 w-auto object-contain" />
                        <span>قائمة طعام رقمية مدعومة من <span className="font-bold text-gray-700">FastPage</span> &bull; حلول رقمية سريعة لمطعمك وكافيهك</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
