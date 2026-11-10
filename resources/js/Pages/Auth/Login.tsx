import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Utensils, Store } from 'lucide-react';

export default function Login({
    status,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fillOwnerDemo = () => {
        setData({
            email: 'owner@koshary-tahrir.eg',
            password: 'Password123!',
            remember: true,
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول - FastPage" />

            <div className="mb-6 text-center">
                <Link href="/" className="inline-block transition hover:scale-[1.02]">
                    <img src="/images/fastpage-logo.png" alt="FastPage" className="h-24 sm:h-28 w-auto mx-auto object-contain mb-3 drop-shadow-xs" />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">تسجيل الدخول</h1>
                <p className="text-xs text-gray-500 mt-1">حلول رقمية سريعة لمطعمك وكافيهك</p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="البريد الإلكتروني" />
                    <TextInput
                        id="email"
                        type="text"
                        inputMode="email"
                        name="email"
                        dir="ltr"
                        value={data.email}
                        className="mt-1 block w-full text-left min-h-[48px]"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="name@restaurant.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="كلمة المرور" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        dir="ltr"
                        value={data.password}
                        className="mt-1 block w-full min-h-[48px]"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ms-2 text-gray-600">تذكر تسجيل الدخول</span>
                    </label>
                </div>

                <div className="pt-2 space-y-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-orange-600/20 transition min-h-[48px] flex items-center justify-center gap-2"
                    >
                        {processing ? 'جاري الدخول...' : 'دخول'}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        ليس لديك حساب؟{' '}
                        <Link href={route('register')} className="text-orange-600 font-bold hover:underline">
                            سجل مطعمك الآن
                        </Link>
                    </p>
                </div>
            </form>

            {/* Quick Demo Fill Button for Testing */}
            <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
                    تجربة سريعة لصاحب المطعم
                </p>
                <button
                    type="button"
                    onClick={fillOwnerDemo}
                    className="w-full p-2.5 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100/60 text-right transition flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-orange-600 shrink-0" />
                        <div>
                            <div className="text-xs font-bold text-gray-900 leading-tight">حساب صاحب مطعم تجريبي</div>
                            <div className="text-[10px] text-gray-500 font-mono">owner@koshary-tahrir.eg</div>
                        </div>
                    </div>
                    <span className="text-[11px] font-bold text-orange-600">تعبئة تلقائية &larr;</span>
                </button>
            </div>
        </GuestLayout>
    );
}
