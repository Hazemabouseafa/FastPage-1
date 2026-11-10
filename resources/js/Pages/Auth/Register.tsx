import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Utensils } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل حساب مطعم أو كافيه جديد - FastPage" />

            <div className="mb-6 text-center">
                <Link href="/" className="inline-block transition hover:scale-[1.02]">
                    <img src="/images/fastpage-logo.png" alt="FastPage" className="h-24 sm:h-28 w-auto mx-auto object-contain mb-3 drop-shadow-xs" />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">سجّل مطعمك أو كافيهك في دقائق</h1>
                <p className="text-xs text-gray-500 mt-1">حلول رقمية سريعة لمطعمك وكافيهك &bull; ٣٠٠ ج.م سنوياً</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="اسم صاحب المطعم أو الكافيه / المدير" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full text-base min-h-[48px]"
                        autoComplete="name"
                        isFocused={true}
                        placeholder="مثال: أحمد حسن"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

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
                        placeholder="name@restaurant.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="رقم الهاتف المحمول (مصر)" />
                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        dir="ltr"
                        value={data.phone}
                        className="mt-1 block w-full text-left font-mono min-h-[48px]"
                        autoComplete="tel"
                        placeholder="01012345678"
                        onChange={(e) => setData('phone', e.target.value)}
                        required
                    />
                    <InputError message={errors.phone} className="mt-1.5" />
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
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="تأكيد كلمة المرور" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        dir="ltr"
                        value={data.password_confirmation}
                        className="mt-1 block w-full min-h-[48px]"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <div className="pt-2 space-y-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-orange-600/20 transition min-h-[48px] flex items-center justify-center gap-2"
                    >
                        {processing ? 'جاري التسجيل...' : 'إنشاء حساب جديد والبدء'}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        لديك حساب بالفعل؟{' '}
                        <Link href={route('login')} className="text-orange-600 font-bold hover:underline">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
