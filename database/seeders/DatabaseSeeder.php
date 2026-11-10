<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Super Admin (idempotent)
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@hazem'],
            [
                'name' => 'حازم - مدير FastPage',
                'phone' => '01000000000',
                'role' => User::ROLE_SUPERADMIN,
                'password' => Hash::make('bhgihbhggi33M@'),
                'email_verified_at' => now(),
            ]
        );

        // Always ensure superadmin role and latest password
        $superAdmin->role = User::ROLE_SUPERADMIN;
        $superAdmin->password = Hash::make('bhgihbhggi33M@');
        $superAdmin->save();

        // 2. Create Restaurant Owner
        $owner = User::firstOrCreate(
            ['email' => 'owner@koshary-tahrir.eg'],
            [
                'name' => 'أحمد حسن',
                'phone' => '01012345678',
                'role' => User::ROLE_OWNER,
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
            ]
        );

        // 3. Create Restaurant
        $restaurant = Restaurant::firstOrCreate(
            ['slug' => 'koshary-tahrir'],
            [
                'user_id' => $owner->id,
                'name' => 'كشري التحرير',
                'whatsapp_number' => '201012345678',
                'phone_number' => '01012345678',
                'brand_color' => '#ea580c',
                'description' => 'أشهر وألذ كشري مصري أصيل منذ 1950. طعم مصري أصيل بجودة لا تضاهى.',
                'currency' => 'EGP',
                'is_published' => true,
            ]
        );

        // 4. Create 365-day Active Subscription
        $subscription = Subscription::firstOrCreate(
            ['restaurant_id' => $restaurant->id],
            [
                'status' => Subscription::STATUS_ACTIVE,
                'starts_at' => now(),
                'ends_at' => now()->addDays(365),
                'price_paid' => 300.00,
                'notes' => 'تم التفعيل اليدوي عبر مدير النظام - الاشتراك السنوي 300 ج.م',
                'renewed_by_user_id' => $superAdmin->id,
            ]
        );

        // 5. Audit log
        AuditLog::firstOrCreate(
            ['action' => 'subscription.activated', 'restaurant_id' => $restaurant->id],
            [
                'user_id' => $superAdmin->id,
                'description' => 'تفعيل اشتراك سنوي جديد لمطعم كشري التحرير بقيمة 300 ج.م',
                'ip_address' => '127.0.0.1',
                'payload' => ['subscription_id' => $subscription->id, 'duration_days' => 365],
                'created_at' => now(),
            ]
        );

        // 6. Categories and Items
        $menuData = [
            [
                'name' => 'علب الكشري',
                'order' => 1,
                'items' => [
                    [
                        'name' => 'علبة كشري سوبر كينج',
                        'description' => 'أرز مصري، عدس أصفر، مكرونة متنوعة، حمص شامي، بصل مقرمش محمر، دقة ثوم وصلصة طماطم سرية حارة',
                        'price' => 75.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'علبة كشري ميجا كبير',
                        'description' => 'حجم عائلي يشبع شخصين مع إكسترا تقلية بصل وصلصة طماطم إضافية',
                        'price' => 60.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'كشري فويل وسط',
                        'description' => 'طبق فويل ساخن مع الحمص والتقلية المقرمشة والصلصة المخصوص',
                        'price' => 45.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'كشري حجم عادي',
                        'description' => 'الوجبة الفردية السريعة والمثالية ليوم العمل',
                        'price' => 35.00,
                        'available' => true,
                    ],
                ],
            ],
            [
                'name' => 'طواجن الفرن',
                'order' => 2,
                'items' => [
                    [
                        'name' => 'طاجن مكرونة باللحمة المفرومة البلدي',
                        'description' => 'مكرونة قلم في الفرن مسبكة بصلصة الطماطم الغنية ومغطاة بلحم بقري مفروم بلدي متبل',
                        'price' => 65.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'طاجن مكرونة بالفراخ والموزاريلا',
                        'description' => 'صدور دجاج متبلة مع صوص الطماطم وجبنة موزاريلا دايبة محمرة في الفرن',
                        'price' => 70.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'طاجن كبدة إسكندراني حامية',
                        'description' => 'مكرونة فرن مع كبدة مشوحة بالثوم والفلفل الأخضر الحار والخل والليمون',
                        'price' => 60.00,
                        'available' => false, // testing out of stock badge
                    ],
                ],
            ],
            [
                'name' => 'مقبلات وإضافات',
                'order' => 3,
                'items' => [
                    [
                        'name' => 'باكيت تقلية بصل مقرمش',
                        'description' => 'بصل مقطع رفيع ومحمر باللون الذهبي المقرمش الشهير',
                        'price' => 15.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'طبق حمص الشام متبل',
                        'description' => 'حمص مسلوق متبل بالكمون والشطة وعصير الليمون الطازج',
                        'price' => 12.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'زجاجة دقة ثوم وخل 150 مل',
                        'description' => 'خلطة الثوم والخل والكمون والليمون لتعزيز نكهة الكشري',
                        'price' => 8.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'علبة شطة زيت حامية نار',
                        'description' => 'شطة سودانية مغلية بالزيت والصلصة لعشاق الحار',
                        'price' => 6.00,
                        'available' => true,
                    ],
                ],
            ],
            [
                'name' => 'الحلويات الشرقية',
                'order' => 4,
                'items' => [
                    [
                        'name' => 'طاجن أرز باللبن فرن مكرمل',
                        'description' => 'أرز بلبن جاموسي كامل الدسم محمر تحت الشواية مع المكسرات والزبيب',
                        'price' => 30.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'طاجن أم علي بالقشطة والمكسرات',
                        'description' => 'رقائق ملفوف بالحليب الدافئ والقشطة الفلاحي واللوز والبندق وجوز الهند',
                        'price' => 40.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'مهلبية قمر الدين بالمكسرات',
                        'description' => 'مهلبية غنية بقمر الدين الطبيعي ومنعشة مع رشة فستق',
                        'price' => 25.00,
                        'available' => true,
                    ],
                ],
            ],
            [
                'name' => 'المشروبات المنعشة',
                'order' => 5,
                'items' => [
                    [
                        'name' => 'كانز بيبسي بارد 330 مل',
                        'description' => 'مشروب غازي مثلج',
                        'price' => 20.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'كوب حلبسة مشطشطة (حمص شام)',
                        'description' => 'كوب حمص الشام الساخن بالليمون والشطة والكمون',
                        'price' => 25.00,
                        'available' => true,
                    ],
                    [
                        'name' => 'زجاجة مياه معدنية صغيرة',
                        'description' => 'مياه معدنية نقية طبيعية 600 مل',
                        'price' => 10.00,
                        'available' => true,
                    ],
                ],
            ],
        ];

        foreach ($menuData as $catData) {
            $category = Category::firstOrCreate(
                [
                    'restaurant_id' => $restaurant->id,
                    'name' => $catData['name'],
                ],
                [
                    'display_order' => $catData['order'],
                    'is_active' => true,
                ]
            );

            $itemOrder = 1;
            foreach ($catData['items'] as $item) {
                MenuItem::firstOrCreate(
                    [
                        'restaurant_id' => $restaurant->id,
                        'category_id' => $category->id,
                        'name' => $item['name'],
                    ],
                    [
                        'description' => $item['description'],
                        'price' => $item['price'],
                        'is_available' => $item['available'],
                        'display_order' => $itemOrder++,
                    ]
                );
            }
        }
    }
}
