import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Utensils, AlertTriangle, Home } from 'lucide-react';

interface Props {
    slug: string;
}

export default function NotFound({ slug }: Props) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center" dir="rtl">
            <Head title="المطعم غير موجود" />

            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-lg border border-gray-100 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <h1 className="text-lg font-black text-gray-900">لم يتم العثور على هذا المطعم</h1>
                <p className="text-xs text-gray-500 leading-relaxed">
                    الرابط الذي قمت بفتحه <span className="font-mono text-orange-600">/m/{slug}</span> غير مسجل في نظامنا أو قد تم تغييره.
                </p>

                <div className="pt-2">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition min-h-[44px]"
                    >
                        <Home className="w-4 h-4" />
                        <span>الصفحة الرئيسية لـ FastPage</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
