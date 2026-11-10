import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-gray-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white py-6 px-5 sm:p-8 rounded-3xl border border-orange-100/80 shadow-xl shadow-orange-950/5">
                    {children}
                </div>
                <div className="mt-6 text-center text-xs text-gray-400">
                    FastPage &copy; {new Date().getFullYear()} &bull; حلول رقمية سريعة لمطعمك وكافيهك
                </div>
            </div>
        </div>
    );
}
