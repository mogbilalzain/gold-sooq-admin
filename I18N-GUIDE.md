# دليل نظام الترجمة - Internationalization Guide

## نظرة عامة
تم إضافة نظام ترجمة كامل يدعم اللغتين العربية والإنجليزية مع دعم RTL (Right-to-Left) للعربية.

## الميزات

### ✅ الميزات المنفذة
1. **خدمة الترجمة (Translation Service)**: خدمة مركزية لإدارة الترجمات
2. **مبدل اللغة**: زر في الهيدر للتبديل بين العربية والإنجليزية
3. **دعم RTL**: تغيير تلقائي لاتجاه الصفحة عند اختيار العربية
4. **حفظ التفضيلات**: حفظ اللغة المختارة في localStorage
5. **ترجمة ديناميكية**: تحديث تلقائي للواجهة عند تغيير اللغة

## الملفات المضافة/المعدلة

### ملفات جديدة:
1. `src/app/shared/services/translation.service.ts` - خدمة الترجمة
2. `src/app/shared/components/common/language-toggle/language-toggle.component.ts` - مكون مبدل اللغة

### ملفات معدلة:
1. `src/app/app.component.ts` - تهيئة خدمة الترجمة
2. `src/app/shared/layout/app-sidebar/app-sidebar.component.ts` - استخدام الترجمة
3. `src/app/shared/layout/app-sidebar/app-sidebar.component.html` - نصوص قابلة للترجمة
4. `src/app/shared/layout/app-header/app-header.component.ts` - إضافة مبدل اللغة
5. `src/app/shared/layout/app-header/app-header.component.html` - نص البحث قابل للترجمة
6. `src/styles.css` - إضافة دعم RTL

## كيفية الاستخدام

### في المكونات (Components):

```typescript
import { TranslationService } from '../../shared/services/translation.service';

export class MyComponent {
  constructor(public translationService: TranslationService) {}
  
  // في القالب
  // {{ translationService.t('sidebar.dashboard') }}
}
```

### في القوالب (Templates):

```html
<!-- استخدام مباشر -->
<h1>{{ translationService.t('sidebar.dashboard') }}</h1>

<!-- مع binding -->
<input [placeholder]="translationService.t('header.search')" />
```

### إضافة ترجمة جديدة:

1. افتح `src/app/shared/services/translation.service.ts`
2. أضف المفتاح الجديد في واجهة `TranslationKeys`:

```typescript
export interface TranslationKeys {
  // ... existing keys
  mySection: {
    myKey: string;
  };
}
```

3. أضف الترجمة في كلا اللغتين:

```typescript
private translations: Record<Language, TranslationKeys> = {
  ar: {
    // ...
    mySection: {
      myKey: 'النص بالعربية',
    },
  },
  en: {
    // ...
    mySection: {
      myKey: 'Text in English',
    },
  },
};
```

## المفاتيح المتاحة حالياً

### Sidebar (القائمة الجانبية):
- `sidebar.menu` - القائمة الرئيسية
- `sidebar.others` - أخرى
- `sidebar.dashboard` - لوحة التحكم
- `sidebar.products` - المنتجات
- `sidebar.orders` - الطلبات
- `sidebar.customers` - العملاء
- `sidebar.goldPrices` - أسعار الذهب
- `sidebar.reports` - التقارير
- `sidebar.charts` - الرسوم البيانية
- `sidebar.profile` - الملف الشخصي
- `sidebar.settings` - الإعدادات
- ... والمزيد

### Header (الهيدر):
- `header.search` - نص البحث

### Common (مشترك):
- `common.loading` - جاري التحميل
- `common.save` - حفظ
- `common.cancel` - إلغاء
- `common.delete` - حذف
- `common.edit` - تعديل
- `common.add` - إضافة
- `common.search` - بحث

## دعم RTL

النظام يدعم RTL تلقائياً:
- عند اختيار العربية، يتم تعيين `dir="rtl"` على `html`
- يتم إضافة class `rtl` على `body`
- CSS يتكيف تلقائياً مع الاتجاه

### CSS RTL Utilities:

```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="ltr"] {
  direction: ltr;
  text-align: left;
}
```

## حفظ التفضيلات

اللغة المختارة تُحفظ تلقائياً في `localStorage` تحت المفتاح `language`:
- `ar` - العربية
- `en` - الإنجليزية

عند إعادة تحميل الصفحة، يتم استعادة اللغة المحفوظة تلقائياً.

## التطوير المستقبلي

### اقتراحات للتحسين:
1. إضافة المزيد من اللغات (فرنسي، ألماني، إلخ)
2. تحميل الترجمات من ملفات JSON خارجية
3. إضافة دعم للترجمات المتعددة (Pluralization)
4. إضافة دعم للتاريخ والأرقام حسب اللغة
5. إضافة دعم للخطوط العربية المخصصة

## الاختبار

لاختبار نظام الترجمة:

1. شغّل المشروع:
```bash
npm start
```

2. افتح المتصفح على `http://localhost:4200`

3. اضغط على زر مبدل اللغة في الهيدر

4. لاحظ تغيير:
   - جميع النصوص في القائمة الجانبية
   - نص البحث
   - اتجاه الصفحة (RTL/LTR)

## ملاحظات مهمة

- اللغة الافتراضية هي العربية (`ar`)
- جميع الترجمات موجودة في ملف واحد (`translation.service.ts`) لسهولة الصيانة
- يمكن نقل الترجمات إلى ملفات JSON منفصلة لاحقاً إذا لزم الأمر
- النظام متوافق مع Angular 20+ و Tailwind CSS v4

---

تم التنفيذ: 2024

