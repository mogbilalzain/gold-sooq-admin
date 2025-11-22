# إضافة الخط العربي Cairo - Arabic Font Cairo Implementation

## نظرة عامة
تم إضافة خط Cairo العربي الجميل لدعم اللغة العربية في لوحة التحكم. الخط يتم تحميله تلقائياً من Google Fonts ويُطبق عند اختيار اللغة العربية.

## الميزات

### ✅ الخطوط المدعومة
- **العربية**: Cairo (من Google Fonts)
  - الأوزان المتاحة: 200, 300, 400, 500, 600, 700, 800, 900
- **الإنجليزية**: Outfit (الخط الافتراضي)

### ✅ التطبيق التلقائي
- عند اختيار العربية: يتم تطبيق خط Cairo تلقائياً
- عند اختيار الإنجليزية: يتم تطبيق خط Outfit

## الملفات المعدلة

### 1. `src/styles.css`
- إضافة import لخط Cairo من Google Fonts
- إضافة متغير CSS: `--font-cairo`
- إضافة قواعد CSS لتطبيق الخط عند RTL/العربية

### 2. `src/app/shared/services/translation.service.ts`
- إضافة class `lang-ar` على body عند اختيار العربية
- إضافة class `lang-en` على body عند اختيار الإنجليزية

## الكود المضاف

### Import الخط:
```css
@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap")
layer(base);
```

### متغير CSS:
```css
--font-cairo: Cairo, sans-serif;
```

### قواعد CSS:
```css
/* Arabic Font - Cairo */
[dir="rtl"],
[lang="ar"],
.lang-ar,
body.lang-ar,
html[lang="ar"] body {
  font-family: 'Cairo', sans-serif !important;
}

[dir="rtl"] *,
[lang="ar"] *,
.lang-ar * {
  font-family: 'Cairo', sans-serif;
}

/* English Font - Outfit */
[dir="ltr"],
[lang="en"],
.lang-en,
html[lang="en"] body,
body.lang-en {
  font-family: 'Outfit', sans-serif;
}
```

## كيفية العمل

1. عند اختيار اللغة العربية:
   - يتم تعيين `dir="rtl"` و `lang="ar"` على `html`
   - يتم إضافة class `lang-ar` على `body`
   - يتم تطبيق خط Cairo تلقائياً على جميع العناصر

2. عند اختيار اللغة الإنجليزية:
   - يتم تعيين `dir="ltr"` و `lang="en"` على `html`
   - يتم إضافة class `lang-en` على `body`
   - يتم تطبيق خط Outfit (الافتراضي)

## النتيجة

### في اللغة العربية:
✅ جميع النصوص تستخدم خط Cairo  
✅ الخط واضح ومقروء للعربية  
✅ دعم كامل للأوزان المختلفة (200-900)  
✅ تطبيق تلقائي على جميع العناصر  

### في اللغة الإنجليزية:
✅ جميع النصوص تستخدم خط Outfit  
✅ الخط الأصلي محفوظ  

## الاختبار

1. شغّل المشروع: `npm start`
2. افتح المتصفح على `http://localhost:4200`
3. اضغط على زر اللغة في الهيدر
4. لاحظ التغيير:
   - عند اختيار العربية: جميع النصوص تستخدم خط Cairo
   - عند اختيار الإنجليزية: جميع النصوص تستخدم خط Outfit

## ملاحظات

- الخط يتم تحميله من Google Fonts (لا حاجة لملفات محلية)
- الخط متوافق مع جميع المتصفحات الحديثة
- لا يؤثر على الأداء (تحميل سريع)
- يمكن إضافة خطوط عربية أخرى لاحقاً إذا لزم الأمر

## الخطوط البديلة (اختياري)

إذا أردت استخدام خط عربي محلي بدلاً من Google Fonts:

1. ضع ملفات الخط في `public/fonts/`
2. أضف `@font-face` في `styles.css`:
```css
@font-face {
  font-family: 'Cairo';
  src: url('/fonts/Cairo-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}
```

---

تم التنفيذ: 2024

