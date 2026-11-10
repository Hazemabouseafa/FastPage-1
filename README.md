# منيو كيو آر مصر (QR Restaurant Menu SaaS) 🇪🇬

منصة برمجية سحابية متعددة المستأجرين (Multi-tenant SaaS) مبنية خصيصاً للمطاعم والكافيهات في السوق المصري، بتصميم **Mobile-First** وواجهة عربية أصيلة (RTL)، تتيح لأصحاب المطاعم إنشاء قائمة طعام رقمية تفاعلية بلمح البصر من هواتفهم الذكية، وطباعة كروت الطاولة مع رمز QR عالي الدقة دون الحاجة لأي تطبيقات أو تسجيل دخول للزبائن.

---

## 💡 نموذج العمل (Business Model)

- **السعر السنوي**: **٣٠٠ جنيه مصري فقط** لكل مطعم سنوياً (بدون أي عمولات على الطلبات أو المبيعات).
- **نوع الاشتراك**: اشتراك سنوي ثابت (٣٦٥ يوماً من تاريخ التفعيل). لا توجد باقات شهرية أو اشتراكات معقدة.
- **حد الحساب**: مطعم واحد لكل حساب مالك في النسخة الأولى (MVP).
- **التفعيل والتجديد**: يتم تفعيل وتجديد الاشتراكات يدوياً وبأمان من قبل **مدير النظام (Super Admin)** بعد استلام التحويل (فودافون كاش / إنستاباي / تحويل بنكي).
- **دورة حياة الاشتراك**:
  - `pending` (في انتظار التفعيل بعد التسجيل مباشرة).
  - `active` (مفعل لمدة ٣٦٥ يوماً كاملة).
  - `grace` (فترة سماح إضافية لمدة ٧ أيام بعد انتهاء السنة لإتاحة التجديد).
  - `expired` (منتهي الصلاحية؛ تظهر للزبون رسالة اعتذار أنيقة مع زر تواصل واتساب).
  - `suspended` (معلق إدارياً من قبل Super Admin).
- **ثبات الروابط والـ QR**: الروابط ورموز QR لا تتغير نهائياً عند التجديد أو تعديل الأصناف والأسعار.

---

## 🛠️ البنية التقنية (Tech Stack)

| المكون | التقنية |
| :--- | :--- |
| **Backend** | Laravel 11, PHP 8.2+ / 8.3 |
| **Database** | PostgreSQL 16 (Production & Coolify) / SQLite (Automated Tests) |
| **Frontend** | Inertia.js v2, React 18, TypeScript |
| **Styling** | Tailwind CSS v3, RTL Support, Google Fonts (Cairo) |
| **Icons** | Lucide React |
| **QR Code Engine** | `bacon/bacon-qr-code` (Vector SVG/PNG generation) |
| **Containerization** | Docker, Docker Compose, Coolify-ready, Nginx + PHP-FPM 8.3 |

---

## 📱 التصميم وتجربة المستخدم (Mobile-First Design)

- **الاتجاه والخطوط**: واجهة عربية أصيلة (`dir="rtl"`, `lang="ar"`) بخط **Cairo** المريح للقراءة.
- **الهوية البصرية**: واجهة بيضاء نقية وبسيطة مع لمسات دافئة بلون البرتقالي المصري (`#ea580c`).
- **شاشات الهواتف**: مصمم ومختبر ليعمل بسلاسة فائقة بدءاً من **320px** وحتى الشاشات الكبيرة (320px, 375px, 390px, 768px, 1440px).
- **الاستخدام بيد واحدة**: شريط تنقل سفلي مثبت (Sticky Bottom Navigation) وأزرار تحكم بحجم لمس مريح (Touch targets >= 48px).
- **تبديل توفر الأصناف بلمسة واحدة**: زر فوري لتبديل حالة الوجبة (متوفر / غير متوفر) يتيح لمدير الصالة أو الشيف إيقاف صنف نفد من المطبخ خلال ثانية واحدة.
- **ستاند الطاولة القابل للطباعة**: صفحة مخصصة للطباعة أو الحفظ كـ PDF بتنسيق ستاند الطاولة (A5 / Table Tent) جاهزة للطباعة الفورية.

---

## 🔒 الأمان وعزل المستأجرين (Security & Tenant Isolation)

1. **عزل البيانات الصارم (Tenant Scoping)**:
   - كافة استعلامات الأصناف والأقسام محصورة برمجياً بمعرف المطعم التابع للمستخدم الموثق `auth()->user()->restaurant->id`.
   - لا يتم الوثوق بأي `restaurant_id` قادم من طلبات الواجهة الأمامية.
2. **منع ثغرات IDOR**:
   - تطبيق Laravel Policies (`RestaurantPolicy`, `CategoryPolicy`, `MenuItemPolicy`) للتحقق من ملكية أي سجل قبل التعديل أو الحذف.
3. **أمان رفع الصور والملفات**:
   - فحص امتدادات ونوع MIME للصور (JPEG, PNG, WebP).
   - تحديد حجم أقصى للملفات (2 ميجابايت).
4. **سجل تدقيق العمليات (Audit Logging)**:
   - تسجيل عمليات تفعيل الاشتراكات، التجديد، التعليق، وتعديلات المطاعم مع عنوان IP وبيانات العملية.

---

## ⚡ السرعة والأداء (Performance)

- **كاش صفحات المنيو**: تخزين بيانات المنيو في الذاكرة (Cache) مع إبطال فوري وتلقائي عند تعديل المنيو بواسطة المالك.
- **أولوية تحميل الصور (LCP Optimization)**: تطبيق توجيهات الويب الحديثة بإعطاء `fetchpriority="high"` لشعار المطعم العلوي بدون `loading="lazy"`.
- **التحميل الكسول للوجبات**: استخدام `loading="lazy"` لكافة صور الوجبات والأصناف الثانوية لتقليل استهلاك باقة الإنترنت على شبكات الموبايل 3G/4G.
- **صفر تتبع خارجي**: لا توجد ملفات تتبع أو أكواد إعلانات تبطئ تجربة الزبون.

---

## 🚀 التثبيت والتشغيل المحلي (Local Development)

### المتطلبات الأساسية:
- PHP 8.2 أو PHP 8.3 مع ملحقات (`pdo`, `pdo_pgsql` أو `pdo_sqlite`, `gd`, `intl`, `mbstring`, `zip`)
- Composer 2.x
- Node.js 18+ و npm

### خطوات التشغيل:
```bash
# 1. الدخول لمجلد المشروع
cd qr-menu

# 2. نسخ ملف البيئة وتوليد المفتاح
cp .env.example .env
php artisan key:generate

# 3. تثبيت حزم PHP و Node
composer install
npm install

# 4. تشغيل الهجرات وزرع البيانات التجريبية
php artisan migrate:fresh --seed

# 5. ربط مجلد التخزين العام
php artisan storage:link

# 6. بناء ملفات الواجهة
npm run build

# 7. تشغيل خادم التطوير
php artisan serve
```

---

## 👤 الحسابات التجريبية الافتراضية (Seeded Accounts)

تم تجهيز قاعدة البيانات ببيانات واقعية لمطعم مصري شهير (كشري التحرير):

| الحساب | البريد الإلكتروني | كلمة المرور | الرابط |
| :--- | :--- | :--- | :--- |
| **مدير النظام (Super Admin)** | `admin@qrmenu.eg` | `Password123!` | `/admin` |
| **صاحب المطعم (Owner)** | `owner@koshary-tahrir.eg` | `Password123!` | `/dashboard` |
| **المنيو العام للزبائن** | *(متاح بدون تسجيل دخول)* | — | `/m/koshary-tahrir` |

---

## 🛡️ إنشاء مدير نظام عبر سطر الأوامر (CLI Admin Command)

لإنشاء أو ترقية أي مستخدم إلى Super Admin في بيئة الإنتاج:
```bash
php artisan saas:admin admin@yourdomain.eg --name="مدير النظام" --password="YourSecurePassword"
```

---

## 🐳 النشر عبر Docker و Coolify (Coolify / Production Deployment)

المشروع مزود بـ `Dockerfile` متعدد المراحل (Multi-stage) مع Nginx و PHP-FPM 8.3 و Supervisor، بالإضافة إلى ملف `docker-compose.yml` جاهز للنشر بضغطة زر على **Coolify**.

### المتغيرات البيئية المطلوبة في Coolify:
```env
APP_NAME="منيو كيو آر مصر"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://menu.yourdomain.eg
APP_TIMEZONE=Africa/Cairo
APP_LOCALE=ar

# قاعدة بيانات PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=qrmenu
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here

# الجلسات والكاش
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=sync
FILESYSTEM_DISK=public

# إعدادات نموذج العمل المصري
SAAS_ANNUAL_PRICE=300
ADMIN_SUPPORT_WHATSAPP=201012345678
ADMIN_SUPPORT_PHONE=01012345678
```

### التشغيل بواسطة Docker Compose محلياً:
```bash
docker compose up -d --build
```
سيعمل التطبيق على المنفذ `http://localhost:8080`.

---

## 🧪 الاختبارات الآلية (Test Suite)

تم بناء **٥٧ اختباراً شاملاً** تغطي كافة العمليات الحساسة ونموذج العمل:
- اختبارات المصادقة والتسجيل برقم الهاتف المصري.
- اختبارات عزل المستأجرين ومنع اختراق الصلاحيات (IDOR).
- اختبارات إدارة الأقسام والوجبات والتبديل السريع للتوفر.
- اختبارات دورة حياة الاشتراك (تفعيل، تجديد، تعليق، فترة سماح، انتهاء صلاحية).
- اختبارات الوصول العام للمنيو واستقرار روابط الـ QR.

لتشغيل الاختبارات:
```bash
php artisan test
```

```
Tests:    57 passed (219 assertions)
Duration: ~7.36s
```

---

## 📞 الدعم الفني والمبيعات

- **واتساب الدعم**: `+20 100 000 0000`
- **البريد الإلكتروني**: `support@qrmenu.eg`
