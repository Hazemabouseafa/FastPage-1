# FastPage ⚡ — حلول رقمية سريعة لمطعمك وكافيهك (QR Restaurant Menu SaaS) 🇪🇬

<p align="center">
  <img src="public/images/fastpage-logo.png" alt="FastPage Logo" width="320" />
  <br>
  <strong>أسرع منصة رقمية سحابية لإدارة وتصميم قوائم الطعام (QR Menus) للمطاعم والكافيهات في مصر</strong>
</p>

---

## 💡 نظرة عامة ونموذج العمل (Business Model)

- **اسم المنصة**: **FastPage** — حلول رقمية سريعة لمطعمك وكافيهك.
- **السعر السنوي المرن**: محدد افتراضياً بـ **٣٠٠ جنيه مصري سنوياً** مع **تحكم كامل لمدير النظام لتغيير السعر في أي وقت** بضغطة زر.
- **نوع الاشتراك**: اشتراك سنوي ثابت (٣٦٥ يوماً من تاريخ التفعيل) بدون أي عمولات على الطلبات أو المبيعات وبدون باقات شهرية معقدة.
- **حد الحساب**: مطعم واحد لكل حساب مالك في النسخة الأولى (MVP).
- **التفعيل والتجديد**: يتم تفعيل وتجديد الاشتراكات يدوياً وبأمان من قبل **مدير النظام (Super Admin)** بعد استلام التحويل (إنستاباي / فودافون كاش / تحويل بنكي).
- **دورة حياة الاشتراك**:
  - `pending` (في انتظار التفعيل بعد التسجيل مباشرة).
  - `active` (مفعل لمدة ٣٦٥ يوماً كاملة).
  - `grace` (فترة سماح إضافية لمدة ٧ أيام بعد انتهاء السنة لإتاحة التجديد).
  - `expired` (منتهي الصلاحية؛ تظهر للزبون رسالة اعتذار أنيقة مع زر تواصل واتساب).
  - `suspended` (معلق إدارياً من قبل Super Admin).
- **ثبات الروابط والـ QR**: الروابط ورموز QR لا تتغير نهائياً عند التجديد أو تعديل الأصناف والأسعار.

---

## 🛠️ البنية التقنية (Tech Stack)

| المكون | التقنية المستخدمة |
| :--- | :--- |
| **Backend** | Laravel 11, PHP 8.3 |
| **Database** | PostgreSQL 16 (Production & Coolify) / SQLite (Local & Tests) |
| **Frontend** | Inertia.js v2, React 18, TypeScript |
| **Styling** | Tailwind CSS v3, RTL Support, Google Fonts (Cairo) |
| **Icons** | Lucide React |
| **QR Code Engine** | `bacon/bacon-qr-code` (Vector SVG/PNG generation) |
| **Persistent Storage** | Auto-synced `customers.json` & UTF-8 BOM `customers.csv` |
| **Containerization** | Docker, Docker Compose, Coolify-ready, Nginx + PHP-FPM 8.3 |

---

## 📱 التصميم وتجربة المستخدم (Mobile-First Design)

- **الاتجاه والخطوط**: واجهة عربية أصيلة بالكامل (`dir="rtl"`, `lang="ar"`) بخط **Cairo** المريح للقراءة.
- **الهوية البصرية**: واجهة بيضاء نقية وبسيطة مع لمسات دافئة بلون البرتقالي والأزرق المتناسق مع شعار FastPage.
- **شاشات الهواتف**: مصمم ومختبر ليعمل بسلاسة فائقة بدءاً من **320px** وحتى الشاشات الكبيرة (320px, 375px, 390px, 768px, 1440px).
- **الاستخدام بيد واحدة**: شريط تنقل سفلي مثبت (Sticky Bottom Navigation) وأزرار تحكم بحجم لمس مريح (Touch targets >= 48px).
- **تبديل توفر الأصناف بلمسة واحدة**: زر فوري لتبديل حالة الوجبة (متوفر / غير متوفر) يتيح لمدير الصالة أو الشيف إيقاف صنف نفد من المطبخ خلال ثانية واحدة من الهاتف.
- **ستاند الطاولة القابل للطباعة**: صفحة مخصصة للطباعة أو الحفظ كـ PDF بتنسيق ستاند الطاولة (A5 Table Tent) بشعار FastPage ورمز QR عالي الدقة.

---

## 🔐 مجلد ومسار لوحة تحكم السوبر أدمن (Isolated Admin Portal)

لحماية لوحة الإدارة من محاولات التخمين والفحص الآلي (Bot Scanners):
- تم عزل متحكمات الإدارة في مجلد منفصل بالكامل: `app/Http/Controllers/Admin/AdminController.php`.
- مسار اللوحة طويل ومحمي ومضبوط عبر المتغير البيئي `ADMIN_ROUTE_PATH`:
  ```text
  /fastpage-secure-superadmin-control-center
  ```
- أي محاولة لفتح المسار التقليدي `/admin` ترجع فوراً `404 Not Found` لغير المسجلين أو لأصحاب المطاعم العاديين.

### بيانات السوبر أدمن الافتراضية:
* **اسم المستخدم / البريد:** `admin@hazem`
* **كلمة المرور:** `bhgihbhggi33M@`
* **الاسم:** حازم - FastPage Admin

---

## 💾 التخزين الدائم لبيانات العملاء (Persistent Storage)

تم تجهيز النظام ليعمل مع وحدات التخزين الدائمة في بيئات Docker و Coolify لضمان حفظ بيانات العملاء حتى عند إعادة بناء الحاويات:

* **مسار التخزين الدائم داخل الحاوية:**
  ```text
  /var/www/html/storage/app/persistent
  ```
* **الملفات المنشأة والمحدثة دورياً:**
  1. `customers.json`: كائن JSON متكامل به كافة تفاصيل العملاء، المطاعم، الهواتف، الاشتراكات والتواريخ.
  2. `customers.csv`: جدول CSV بترميز UTF-8 BOM لفتح اللغة العربية مباشرة وبدقة في Microsoft Excel.
* **مزامنة تلقائية:** تتم المزامنة تلقائياً عند تسجيل أي مطعم جديد، أو تفعيل وتجديد أي اشتراك، أو تعديل السعر السنوي، بالإضافة لزر **مزامنة التخزين الآن** وأمر `php artisan saas:sync-customers`.

---

## 🚀 التثبيت والتشغيل المحلي (Local Development)

```bash
# 1. تثبيت الحزم
composer install
npm install

# 2. إعداد ملف البيئة والمفتاح
cp .env.example .env
php artisan key:generate

# 3. تشغيل الهجرات وزرع البيانات
php artisan migrate:fresh --seed

# 4. ربط وسائط التخزين وبناء الواجهة
php artisan storage:link
npm run build

# 5. تشغيل السيرفر
php artisan serve
```

---

## 🐳 النشر عبر Docker و Coolify

### 1. في Docker Compose:
```yaml
services:
  app:
    volumes:
      - uploads_data:/var/www/html/storage/app/public
      - persistent_data:/var/www/html/storage/app/persistent

volumes:
  uploads_data:
  persistent_data:
  postgres_data:
```

### 2. في لوحة Coolify:
أضف وحدة Persistent Storage باسم `fastpage-persistent-data` بالمسار:
```text
/var/www/html/storage/app/persistent
```

---

## 🧪 نتائج الاختبارات الآلية (Test Suite)

```text
Tests:    63 passed (246 assertions)
Duration: ~7.20s
```

---

## 📄 الترخيص
تم تطوير المشروع بواسطة **FastPage** — كافة الحقوق محفوظة © 2026.
