# التعديلات المطلوبة على لوحة تحكم الأدمن (Frontend)

الـ Base URL لجميع الطلبات: `{{baseUrl}}/AyarSouqAPIs/api`
جميع الطلبات تتطلب: `Authorization: Bearer {adminToken}` + `Content-Type: application/json`

---

## 1. عرض الصور (تغيير شامل في كل الشاشات)

الصور الآن مخزنة في R2 Cloudflare. الـ API يُرجع روابط CDN جاهزة تبدأ بـ `https://cdn.ayarsouq.com/...`

**الحقول:** `main_image_url` (صورة الإعلان) — `images[].url` (صور إضافية) — `image_url` (صورة الفئة) — `logoUrl` (شعار المتجر) — `coverUrl` (غلاف المتجر) — `userProfileImageUrl` / `avatarUrl` (صورة المستخدم)

استخدم الـ URL مباشرة في `<img src="...">`. إذا كانت القيمة `null` = لا توجد صورة (اعرض placeholder).

---

## 2. رفع الصور (Presigned Upload) — مسار موحّد

**كل رفع صور** (فئات، إعلانات، شعارات، أغلفة) يتم بنفس الطريقة عبر خطوتين:

**الخطوة 1:** `POST /media/upload-url`
```json
{ "type": "category", "contentType": "image/jpeg", "fileSize": 51200 }
```
`type` الممكنة: `"category"` | `"ad"` | `"profile"` | `"business_logo"` | `"business_cover"`
الاستجابة: `{ uploadUrl, storageKey, expiresAt }`

**الخطوة 2:** `PUT {uploadUrl}` — رفع الملف الخام مباشرة (بدون auth header)

**الخطوة 3:** استخدم `storageKey` في طلب الإنشاء/التعديل (مثل `image_storage_key` للفئة أو `logoStorageKey` للمتجر)

---

## 3. إدارة الفئات (تعديل شاشة موجودة)

**التغيير الوحيد:** استبدل رفع الصورة من FormData مباشر إلى نظام Presigned Upload (القسم 2 أعلاه).

- إنشاء فئة: `POST /admin/categories/create` بـ `{ name_en, name_ar, image_storage_key, parent_category_id }`
- تعديل فئة: `POST /admin/categories/update` بـ `{ categoryId, name_en, name_ar, image_storage_key }`
- الـ `image_storage_key` هو المفتاح المُرجع من `/media/upload-url`

---

## 4. إدارة خصائص الإعلانات (قسم جديد كامل)

خصائص مثل: الوزن، العيار، الحجم، اللون... يحتاج **3 شاشات:**

### 4.1 إدارة الخصائص (Attributes)

| الطلب | الوظيفة |
|-------|---------|
| `POST /admin/ad-attributes/attributes/list` | قائمة كل الخصائص |
| `POST /admin/ad-attributes/attributes/create` | إنشاء `{ name_en, name_ar, inputType, unit }` — `inputType`: `select` / `text` / `number` |
| `POST /admin/ad-attributes/attributes/update` | تعديل `{ attributeId, name_en, name_ar, inputType, unit }` |
| `POST /admin/ad-attributes/attributes/deactivate` | تعطيل `{ attributeId }` |

### 4.2 إدارة خيارات الخصائص (Options) — للخصائص من نوع `select`

| الطلب | الوظيفة |
|-------|---------|
| `POST /admin/ad-attributes/options/create` | إنشاء `{ attributeId, label_en, label_ar }` |
| `POST /admin/ad-attributes/options/update` | تعديل `{ optionId, label_en, label_ar }` |
| `POST /admin/ad-attributes/options/deactivate` | تعطيل `{ optionId }` |
| `POST /admin/ad-attributes/options/reorder` | ترتيب `{ attributeId, orderedOptionIds: [3,1,2] }` |

### 4.3 ربط الخصائص بالفئات الفرعية (Category-Attribute Mapping)

| الطلب | الوظيفة |
|-------|---------|
| `POST /admin/ad-attributes/category-attributes/list` | عرض خصائص فئة فرعية `{ subcategoryId }` |
| `POST /admin/ad-attributes/category-attributes/assign` | ربط خاصية بفئة `{ subcategoryId, attributeId, isRequired, isFilterable }` |
| `POST /admin/ad-attributes/category-attributes/update` | تعديل الربط `{ subcategoryId, attributeId, isRequired, isFilterable }` |
| `POST /admin/ad-attributes/category-attributes/unassign` | فك الربط `{ subcategoryId, attributeId }` |

---

## 5. إدارة الإعلانات (تعديلات على شاشات موجودة + شاشة جديدة)

### 5.1 قائمة الإعلانات — حقول جديدة

كل إعلان يحتوي الآن على:

| الحقل | القيم | الاستخدام |
|-------|------|-----------|
| `price_type` | `"fixed"` / `"market"` / `"contact"` | طريقة عرض السعر |
| `sellerType` | `"individual"` / `"business"` | نوع البائع |
| `isIdentityVerified` | `0` / `1` | شارة الهوية الموثقة |
| `isBusinessVerified` | `0` / `1` | شارة الحساب التجاري الموثق |
| `tradeName` | نص أو `null` | اسم المتجر (للتجاري فقط) |
| `logoUrl` | رابط أو `null` | شعار المتجر |
| `user_name` | نص | اسم المستخدم |
| `main_image_url` | رابط أو `null` | صورة الإعلان الرئيسية |

**عرض السعر حسب `price_type`:**
- `"fixed"` → عرض `price` + `currency` (مثل: 1,500 AED)
- `"market"` → عرض "سعر السوق" (بدون رقم)
- `"contact"` → عرض "تواصل للسعر" (بدون رقم)

**عرض البائع:**
- `sellerType === "business"` → عرض `tradeName` + `logoUrl` + شارات التوثيق
- `sellerType === "individual"` → عرض `user_name` + شارة الهوية (إن وُجدت)

**فلتر جديد:** `countryId` — لتصفية الإعلانات حسب الدولة

### 5.2 تفاصيل الإعلان (شاشة جديدة)

`POST /admin/posts-ads/getById` بـ `{ "postAdsId": 1, "langCode": "en" }`

الاستجابة تحتوي على كل شيء في مكان واحد:
- **الإعلان:** عنوان، وصف، سعر، `price_type`، عملة، دولة، مدينة، عنوان، تاريخ الإنشاء
- **الصور:** `main_image_url` + `images[]` (كل صورة: `{ id, url }`)
- **الخصائص:** `attributes[]` (كل خاصية: `{ name, value, unit }`)
- **التصنيف:** `categoryName`, `parentCategoryName`, `categoryId`, `parentCategoryId`
- **حالة المراجعة:** `review_status`, `reject_reason`, `reviewed_by`, `reviewed_at`
- **صاحب الإعلان:** `userId`, `userName`, `userPhone`, `userEmail`, `userProfileImageUrl`, `accountType`, `sellerType`, `isIdentityVerified`, `isBusinessVerified`, `tradeName`, `logoUrl`
- **حالة الإعلان:** `is_active`, `is_featured`, `post_end_date`, `inactive_reason`, `deleted_at`

---

## 6. إدارة المستخدمين (تعديلات + شاشات جديدة)

### 6.1 قائمة المستخدمين — حقول وفلاتر جديدة

**حقول جديدة في كل مستخدم:**

| الحقل | القيم | الوصف |
|-------|------|-------|
| `account_type` | `"individual"` / `"business"` / `null` | نوع الحساب |
| `identity_status` | `"unverified"` / `"verified"` / `"expired"` / `"revoked"` | حالة توثيق الهوية |
| `identity_expires_on` | تاريخ أو `null` | تاريخ انتهاء الهوية |
| `isIdentityVerified` | `0` / `1` | محسوب: موثق وغير منتهي |
| `isBusinessVerified` | `0` / `1` | محسوب: حساب تجاري + رخصة سارية |
| `sellerType` | `"individual"` / `"business"` | نوع البائع |
| `tradeName` | نص أو `null` | اسم المتجر |
| `businessProfileStatus` | `"unverified"` / `"verified"` / `"expired"` / `"revoked"` / `null` | حالة الملف التجاري |

**فلاتر جديدة في الطلب:**
- `accountType`: `"individual"` | `"business"` | `"all"` (default: `"all"`)
- `identityStatus`: `"unverified"` | `"verified"` | `"expired"` | `"revoked"` | `"all"` (default: `"all"`)

### 6.2 بروفايل المستخدم العام (شاشة جديدة)

`POST /admin/users/getPublicProfile` بـ `{ "userId": 1, "langCode": "en" }`

**الأدمن يرى حتى المستخدمين المحظورين** (بخلاف الـ API العامة).

الاستجابة حسب نوع البائع:

**بائع فردي:**
```
userId, banned, status, identityStatus, identityExpiresOn, accountType, email
sellerType: "individual", displayName, phoneNumber, avatarUrl
isIdentityVerified, isBusinessVerified: false
```

**بائع تجاري (موثق):**
```
userId, banned, status, identityStatus, identityExpiresOn, accountType, email
sellerType: "business", displayName, ownerName, phoneNumber
logoUrl, coverUrl, isBusinessVerified: true, isIdentityVerified: true
businessKind, activityType, description, addressLine
contactPhone, contactEmail, websiteUrl, socialLinks[], workingHours[]
```

### 6.3 صفحة المستخدم + إعلاناته (شاشة جديدة)

`POST /admin/users/getAccountPublicPage` بـ `{ "userId": 1, "langCode": "en", "countryID": 1 }`

الاستجابة: `{ profile: {...}, ads: [...] }` — البروفايل (مثل 6.2) + قائمة إعلانات المستخدم النشطة

---

## 7. توثيق الهوية الشخصية — KYC (قسم جديد كامل)

إدارة طلبات توثيق الهوية الشخصية (بطاقة الهوية الإماراتية).

**مسار الطلب:** `draft` → `pending` → `approved` | `rejected` | `more_info_required` (→ إعادة تقديم → `pending`)

### 7.1 الشاشات المطلوبة

**قائمة الطلبات:**
`POST /admin/identity/list` بـ `{ "page": 1, "limit": 20, "status": "pending" }`
`status`: `"all"` | `"draft"` | `"pending"` | `"more_info_required"` | `"approved"` | `"rejected"` | `"cancelled"`
يمكن تصفية بـ `userId` لعرض طلبات مستخدم محدد.

**تفاصيل الطلب:**
`POST /admin/identity/getById` بـ `{ "requestId": 1 }`
الاستجابة:
- `request` — بيانات الطلب الكاملة
- `viewUrls` — روابط مؤقتة (120 ثانية) لعرض المستندات:
  - `front` — صورة الهوية الأمامية `{ url, expiresAt }`
  - `back` — صورة الهوية الخلفية `{ url, expiresAt }`
  - `selfie` — صورة السيلفي `{ url, expiresAt }`
- `possibleDuplicate` — `true` إذا رقم الهوية مُستخدم من مستخدم آخر
- `events` — سجل الأحداث (الموافقات/الرفض السابقة)

**ملاحظة مهمة:** روابط المستندات مؤقتة وتنتهي بعد 120 ثانية. إذا انتهت الصلاحية، أعد طلب `getById`.

**الموافقة:**
`POST /admin/identity/approve`
```json
{
  "requestId": 1,
  "idNumberFromDocument": "784-1234-1234567-1",
  "idExpiryDateFromDocument": "2028-06-15",
  "internalNote": "ملاحظة داخلية (اختياري)"
}
```

**طلب معلومات إضافية:**
`POST /admin/identity/requestMoreInfo`
```json
{
  "requestId": 1,
  "reasonCode": "id_front_unreadable",
  "userMessage": "الصورة غير واضحة، يرجى إعادة رفعها",
  "missingItems": ["id_front", "selfie"],
  "internalNote": "ملاحظة داخلية"
}
```
`reasonCode`: `id_front_unreadable` | `id_back_unreadable` | `selfie_mismatch` | `id_expired` | `info_mismatch` | `other`
`missingItems`: `id_front` | `id_back` | `selfie`

**الرفض:**
`POST /admin/identity/reject`
```json
{
  "requestId": 1,
  "reasonCode": "selfie_mismatch",
  "userMessage": "الصورة الشخصية لا تطابق بطاقة الهوية"
}
```

**سحب التوثيق:**
`POST /admin/identity/revoke`
```json
{ "userId": 1, "reasonCode": "other", "internalNote": "سبب السحب" }
```
يسحب شارة التوثيق من المستخدم مباشرة.

---

## 8. توثيق الحساب التجاري (قسم جديد كامل)

إدارة طلبات فتح الحساب التجاري (رخصة تجارية + خطاب تفويض).

**مسار الطلب:** `draft` → `pending` → `approved` | `rejected` | `more_info_required`

### 8.1 الشاشات المطلوبة

**قائمة الطلبات:**
`POST /admin/business/list` بـ `{ "page": 1, "limit": 20, "status": "pending" }`
`status`: `"all"` | `"draft"` | `"pending"` | `"more_info_required"` | `"approved"` | `"rejected"` | `"cancelled"`
فلاتر إضافية: `userId`, `authorityCode`

**تفاصيل الطلب:**
`POST /admin/business/getById` بـ `{ "requestId": 1 }`
الاستجابة:
- `request` — بيانات الطلب
- `profile` — الملف التجاري الحالي
- `viewUrls` — روابط مؤقتة (120 ثانية) للمستندات:
  - `license` — صورة الرخصة التجارية `{ url, expiresAt }`
  - `authorization` — خطاب التفويض `{ url, expiresAt }`
- `identitySummary` — ملخص حالة الهوية `{ identityStatus, identityExpiresOn }`
- `possibleDuplicate` — `true` إذا الرخصة مسجلة لمستخدم آخر
- `events` — سجل الأحداث

**فحص الرخصة (اختياري قبل الموافقة):**
`POST /admin/business/checkLicense`
```json
{
  "authorityCode": "DED",
  "licenseNumber": "123456"
}
```
الاستجابة: `{ claimed: true/false, claimedUserId }` — هل الرخصة مسجلة لمستخدم آخر؟

`authorityCode`: `DED` | `ADDET` | `DMCC` | `JAFZA` | `DAFZA` | `DIFC` | `RAKEZ` | `OTHER_FREEZONE`

**الموافقة:**
`POST /admin/business/approve`
```json
{
  "requestId": 1,
  "legalNameFromDocument": "شركة الذهب الخليجي ش.ذ.م.م",
  "licenseNumberFromDocument": "123456",
  "authorityCodeFromDocument": "DED",
  "authorityNameFromDocument": null,
  "licenseExpiryDateFromDocument": "2027-12-31",
  "tradeNameConfirmed": "مجوهرات الخليج",
  "businessKindConfirmed": "store",
  "activityTypeConfirmed": "gold_jewelry",
  "emirateStateIdConfirmed": 1,
  "internalNote": "ملاحظة داخلية"
}
```
`businessKindConfirmed`: `store` | `company` | `freelancer`
`activityTypeConfirmed`: `gold_jewelry` | `gold_bullion` | `watches` | `diamonds` | `workshop` | `other`

**طلب معلومات إضافية:**
`POST /admin/business/requestMoreInfo`
```json
{
  "requestId": 1,
  "reasonCode": "license_unreadable",
  "userMessage": "الرخصة غير واضحة",
  "missingItems": ["license"],
  "internalNote": "ملاحظة داخلية"
}
```
`reasonCode`: `license_unreadable` | `license_expired` | `license_mismatch` | `authorization_missing` | `authorization_invalid` | `info_mismatch` | `other`
`missingItems`: `license` | `authorization` | `legal_name` | `trade_name`

**الرفض:**
`POST /admin/business/reject`
```json
{ "requestId": 1, "reasonCode": "license_expired", "userMessage": "الرخصة منتهية الصلاحية" }
```

**سحب التوثيق التجاري:**
`POST /admin/business/revoke`
```json
{ "userId": 1, "reasonCode": "other", "internalNote": "سبب السحب" }
```
يسحب الحساب التجاري ويوقف جميع إعلانات المستخدم تلقائياً.

---

## 9. إدارة الملف التجاري العام (شاشتان جديدتان)

بعد الموافقة على الحساب التجاري، يمكن للأدمن عرض وتعديل الملف العام للمتجر.

### 9.1 عرض الملف التجاري

`POST /admin/business/getPublicProfile` بـ `{ "userId": 1 }`

الاستجابة:
```
userId, profileStatus (verified/expired/revoked)
tradeName, legalName, licenseNumberLast4, licenseExpiresOn
businessKind, activityType, authorityName
description, addressLine, contactPhone, contactEmail, websiteUrl
socialLinks: [{ platform, url }], workingHours: [{ day, open, close, closed }]
logoUrl, coverUrl, logoStorageKey, coverStorageKey
```

### 9.2 تعديل الملف التجاري

`POST /admin/business/updatePublicProfile`
```json
{
  "userId": 1,
  "tradeName": "اسم المتجر الجديد",
  "description": "وصف المتجر",
  "contactPhone": "+971501234567",
  "contactEmail": "info@shop.com",
  "addressLine": "دبي، الإمارات",
  "websiteUrl": "https://shop.com",
  "socialLinks": [{ "platform": "instagram", "url": "https://instagram.com/shop" }],
  "workingHours": [
    { "day": "Monday", "open": "09:00", "close": "18:00", "closed": false },
    { "day": "Friday", "open": "", "close": "", "closed": true }
  ],
  "logoStorageKey": "business/logos/1/abc.jpg",
  "coverStorageKey": null
}
```

- `userId` مطلوب، باقي الحقول اختيارية — أرسل فقط ما تريد تعديله
- `tradeName` — **حقل أدمن فقط** (المستخدم لا يستطيع تعديله)
- `logoStorageKey: null` أو `coverStorageKey: null` = حذف الصورة
- لرفع صورة جديدة: استخدم `/media/upload-url` بـ `type: "business_logo"` أو `"business_cover"`

---

## ملخص الشاشات المطلوبة

| # | الشاشة | النوع |
|---|--------|------|
| 1 | تغيير رفع صورة الفئة إلى presigned URL | تعديل شاشة موجودة |
| 2 | إدارة الخصائص + الخيارات + ربطها بالفئات | قسم جديد (3 شاشات) |
| 3 | عرض السعر بالشكل الجديد (fixed/market/contact) في قائمة الإعلانات | تعديل شاشة موجودة |
| 4 | عرض بيانات البائع + شارات التوثيق في قائمة الإعلانات | تعديل شاشة موجودة |
| 5 | شاشة تفاصيل الإعلان (صور + خصائص + بائع + حالة) | شاشة جديدة |
| 6 | فلاتر جديدة في قائمة المستخدمين (accountType, identityStatus) | تعديل شاشة موجودة |
| 7 | عرض بيانات التوثيق والحساب التجاري في قائمة المستخدمين | تعديل شاشة موجودة |
| 8 | بروفايل المستخدم (فردي/تجاري) | شاشة جديدة |
| 9 | صفحة المستخدم + إعلاناته | شاشة جديدة |
| 10 | إدارة توثيق الهوية (قائمة + تفاصيل + موافقة/رفض/سحب) | قسم جديد (2-3 شاشات) |
| 11 | إدارة التوثيق التجاري (قائمة + تفاصيل + فحص رخصة + موافقة/رفض/سحب) | قسم جديد (2-3 شاشات) |
| 12 | عرض الملف التجاري العام | شاشة جديدة |
| 13 | تعديل الملف التجاري العام | شاشة جديدة |

---

## ملاحظات عامة

1. **Postman Collection** شامل 57 طلب مع أمثلة: `backend/Ayar_Souq_Admin_APIs.postman_collection.json`
2. روابط مستندات KYC والرخص التجارية مؤقتة (120 ثانية) — أعد طلب `getById` عند انتهائها
3. `socialLinks` و `workingHours` هي JSON arrays
4. عند الموافقة على طلب تجاري، النظام تلقائياً: يحدّث الحساب إلى `business` + يُعيد الإعلانات المعلّقة
5. عند سحب التوثيق التجاري (`revoke`)، النظام تلقائياً يوقف جميع إعلانات المستخدم
