import React from 'react';
import { Head } from '@inertiajs/react';
import { Utensils, AlertCircle, MessageCircle, Phone } from 'lucide-react';

interface Props {
    restaurantName: string;
    logoUrl: string | null;
    brandColor: string;
    reason: 'draft' | 'subscription_expired';
    whatsappUrl: string | null;
    phone: string | null;
}

export default function Unavailable({
    restaurantName,
    logoUrl,
    brandColor,
    reason,
    whatsappUrl,
    phone,
}: Props) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
            <Head title={`قائمة طعام غير متاحة - ${restaurantName}`} />

            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-lg border border-gray-100 space-y-4">
                <div
                    className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md overflow-hidden"
                    style={{ backgroundColor: brandColor || '#ea580c' }}
                >
                    {logoUrl ? (
                        <img src={logoUrl} alt={restaurantName} className="w-full h-full object-cover" />
                    ) : (
                        <Utensils className="w-8 h-8" />
                    )}
                </div>

                <div>
                    <h1 className="text-lg font-bold text-gray-900">{restaurantName}</h1>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mt-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>
                            {reason === 'draft'
                                ? 'المنيو قيد التجهيز من قبل الإدارة'
                                : 'قائمة الطعام غير متاحة حالياً'}
                        </span>
                    </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                    نعتذر منك، قائمة الطعام غير متاحة للتصفح في الوقت الحالي. يمكنك التواصل المباشر مع المطعم عبر الوسائل أدناه:
                </p>

                <div className="space-y-2 pt-2">
                    {whatsappUrl && (
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition min-h-[46px]"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>تواصل مع المطعم عبر واتساب</span>
                        </a>
                    )}

                    {phone && (
                        <a
                            href={`tel:${phone}`}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition min-h-[46px]"
                        >
                            <Phone className="w-4 h-4 text-gray-600" />
                            <span dir="ltr">{phone}</span>
                        </a>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                    <img src="/images/fastpage-logo.png" alt="FastPage" className="h-4 w-auto object-contain" />
                    <span>FastPage &bull; حلول رقمية سريعة لمطعمك وكافيهك</span>
                </div>
            </div>
        </div>
    );
}
