import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Utensils, ShieldCheck, Store } from 'lucide-react';

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

    const fillAdminDemo = () => {
        setData({
            email: 'admin@qrmenu.eg',
            password: 'Password123!',
            remember: true,
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول - منيو كيو آر" />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30 mb-3">
                    <Utensils className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">تسجيل الدخول</h1>
                <p className="text-xs text-gray-500 mt-1">أهلاً بك مجدداً في لوحة إدارة قائمة طعامك</p>
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
                        type="email"
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

            {/* Quick Demo Fill Buttons for Testing */}
            <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
                    حسابات تجريبية سريعة
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={fillOwnerDemo}
                        className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100/60 text-right transition flex items-center gap-2"
                    >
                        <Store className="w-4 h-4 text-orange-600 shrink-0" />
                        <div>
                            <div className="text-xs font-bold text-gray-900 leading-tight">صاحب مطعم</div>
                            <div className="text-[10px] text-gray-500 font-mono">owner@koshary...</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={fillAdminDemo}
                        className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-right transition flex items-center gap-2"
                    >
                        <ShieldCheck className="w-4 h-4 text-gray-700 shrink-0" />
                        <div>
                            <div className="text-xs font-bold text-gray-900 leading-tight">مدير النظام</div>
                            <div className="text-[10px] text-gray-500 font-mono">admin@qrmenu...</div>
                        </div>
                    </button>
                </div>
            </div>
        </GuestLayout>
    );
}
