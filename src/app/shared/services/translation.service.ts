import { Injectable, Signal, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'ar' | 'en';

export interface TranslationKeys {
  // Sidebar
  sidebar: {
    menu: string;
    others: string;
    dashboard: string;
    dashboardMain: string;
    products: string;
    allProducts: string;
    addProduct: string;
    categories: string;
    orders: string;
    allOrders: string;
    newOrders: string;
    processingOrders: string;
    customers: string;
    customersList: string;
    addCustomer: string;
    goldPrices: string;
    viewPrices: string;
    updatePrices: string;
    priceHistory: string;
    reports: string;
    salesReports: string;
    productsReports: string;
    customersReports: string;
    charts: string;
    lineChart: string;
    barChart: string;
    profile: string;
    settings: string;
    generalSettings: string;
    security: string;
    posts: string;
    notifications: string;
  };
  // Header
  header: {
    search: string;
  };
  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    previous: string;
    next: string;
    showing: string;
    to: string;
    of: string;
    results: string;
    actions: string;
    saving: string;
  };
  // Dashboard
      dashboard: {
        totalUsers: string;
        totalPosts: string;
        activePosts: string;
        totalCategories: string;
      };
      // Categories
      categories: {
        title: string;
        subtitle: string;
        category: string;
        name: string;
        image: string;
        noImage: string;
        noCategories: string;
        confirmDelete: string;
        addCategory: string;
        editCategory: string;
        addCategorySubtitle: string;
        editCategorySubtitle: string;
        nameEn: string;
        nameAr: string;
        nameEnPlaceholder: string;
        nameArPlaceholder: string;
        nameEnRequired: string;
        nameArRequired: string;
        imageUrl: string;
        imageUrlPlaceholder: string;
        parentCategory: string;
        parentCategoryPlaceholder: string;
        parentCategoryHint: string;
      };
      // Posts/Ads
      posts: {
        title: string;
        subtitle: string;
        all: string;
        active: string;
        inactive: string;
        price: string;
        status: string;
        featured: string;
        yes: string;
        no: string;
        currency: string;
        noPosts: string;
        confirmDelete: string;
        editPost: string;
        editPostSubtitle: string;
        detail: string;
        titlePlaceholder: string;
        detailPlaceholder: string;
        pricePlaceholder: string;
        isActive: string;
        isFeatured: string;
        fillRequired: string;
        postIdRequired: string;
      };
      // Users
      users: {
        title: string;
        subtitle: string;
        all: string;
        active: string;
        inactive: string;
        verified: string;
        unverified: string;
        name: string;
        phoneNumber: string;
        email: string;
        status: string;
        noUsers: string;
        confirmDelete: string;
        editUser: string;
        editUserSubtitle: string;
        namePlaceholder: string;
        emailPlaceholder: string;
        isActive: string;
        isVerified: string;
        yes: string;
        no: string;
        nameRequired: string;
        userIdRequired: string;
      };
      // Metals Prices
      metals: {
        title: string;
        subtitle: string;
        gold: string;
        silver: string;
        platinum: string;
        historical: string;
        date: string;
        noData: string;
        triggerNotification: string;
        confirmTrigger: string;
        notificationSent: string;
        sending: string;
        '7days': string;
        '1month': string;
        '3months': string;
      };
      // Notifications
      notifications: {
        title: string;
        subtitle: string;
        sendNotification: string;
        sendNotificationSubtitle: string;
        noNotifications: string;
        confirmDelete: string;
        sentAt: string;
        sent: string;
        arabicContent: string;
        englishContent: string;
        arabic: string;
        english: string;
        fieldTitle: string;
        message: string;
        titlePlaceholder: string;
        messagePlaceholder: string;
        send: string;
        sending: string;
        fillRequired: string;
      };
  // Auth
  auth: {
    signIn: string;
    signUp: string;
    signInTitle: string;
    signInSubtitle: string;
    phoneNumber: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    dontHaveAccount: string;
    signInWithGoogle: string;
    signInWithX: string;
    or: string;
    backToDashboard: string;
    signingIn: string;
    loginError: string;
    signOut: string;
    slogan: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage$ = new BehaviorSubject<Language>('ar');
  private translations: Record<Language, TranslationKeys> = {
    ar: {
      sidebar: {
        menu: 'القائمة الرئيسية',
        others: 'أخرى',
        dashboard: 'لوحة التحكم',
        dashboardMain: 'الرئيسية',
        products: 'المنتجات',
        allProducts: 'جميع المنتجات',
        addProduct: 'إضافة منتج',
        categories: 'الفئات',
        orders: 'الطلبات',
        allOrders: 'جميع الطلبات',
        newOrders: 'طلبات جديدة',
        processingOrders: 'طلبات قيد التنفيذ',
        customers: 'العملاء',
        customersList: 'قائمة العملاء',
        addCustomer: 'إضافة عميل',
        goldPrices: 'أسعار الذهب',
        viewPrices: 'عرض الأسعار',
        updatePrices: 'تحديث الأسعار',
        priceHistory: 'التاريخ',
        reports: 'التقارير',
        salesReports: 'تقارير المبيعات',
        productsReports: 'تقارير المنتجات',
        customersReports: 'تقارير العملاء',
        charts: 'الرسوم البيانية',
        lineChart: 'رسم بياني خطي',
        barChart: 'رسم بياني عمودي',
        profile: 'الملف الشخصي',
        settings: 'الإعدادات',
        generalSettings: 'الإعدادات العامة',
        security: 'الأمان',
        posts: 'الإعلانات',
        notifications: 'الإشعارات',
      },
      header: {
        search: 'ابحث في لوحة التحكم...',
      },
      common: {
        loading: 'جاري التحميل...',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        add: 'إضافة',
        search: 'بحث',
        previous: 'السابق',
        next: 'التالي',
        showing: 'عرض',
        to: 'إلى',
        of: 'من',
        results: 'نتيجة',
        actions: 'الإجراءات',
        saving: 'جاري الحفظ',
      },
      dashboard: {
        totalUsers: 'إجمالي المستخدمين',
        totalPosts: 'إجمالي الإعلانات',
        activePosts: 'الإعلانات النشطة',
        totalCategories: 'إجمالي الفئات',
      },
      categories: {
        title: 'الفئات',
        subtitle: 'إدارة فئات المنتجات والخدمات',
        category: 'فئة',
        name: 'الاسم',
        image: 'الصورة',
        noImage: 'لا توجد صورة',
        noCategories: 'لا توجد فئات',
        confirmDelete: 'هل أنت متأكد من حذف هذه الفئة؟',
        addCategory: 'إضافة فئة',
        editCategory: 'تعديل فئة',
        addCategorySubtitle: 'إضافة فئة جديدة',
        editCategorySubtitle: 'تعديل بيانات الفئة',
        nameEn: 'الاسم بالإنجليزية',
        nameAr: 'الاسم بالعربية',
        nameEnPlaceholder: 'أدخل الاسم بالإنجليزية',
        nameArPlaceholder: 'أدخل الاسم بالعربية',
        nameEnRequired: 'الاسم بالإنجليزية مطلوب',
        nameArRequired: 'الاسم بالعربية مطلوب',
        imageUrl: 'رابط الصورة',
        imageUrlPlaceholder: 'https://example.com/image.jpg',
        parentCategory: 'الفئة الرئيسية',
        parentCategoryPlaceholder: 'معرف الفئة الرئيسية (اختياري)',
        parentCategoryHint: 'اتركه فارغاً إذا كانت هذه فئة رئيسية',
      },
      posts: {
        title: 'الإعلانات والمنشورات',
        subtitle: 'إدارة جميع الإعلانات والمنشورات',
        all: 'الكل',
        active: 'نشط',
        inactive: 'غير نشط',
        price: 'السعر',
        status: 'الحالة',
        featured: 'مميز',
        yes: 'نعم',
        no: 'لا',
        currency: 'ر.س',
        noPosts: 'لا توجد إعلانات',
        confirmDelete: 'هل أنت متأكد من حذف هذا الإعلان؟',
        editPost: 'تعديل إعلان',
        editPostSubtitle: 'تعديل بيانات الإعلان',
        detail: 'التفاصيل',
        titlePlaceholder: 'أدخل عنوان الإعلان',
        detailPlaceholder: 'أدخل تفاصيل الإعلان',
        pricePlaceholder: 'أدخل السعر',
        isActive: 'نشط',
        isFeatured: 'مميز',
        fillRequired: 'يرجى ملء جميع الحقول المطلوبة',
        postIdRequired: 'معرف الإعلان مطلوب',
      },
      users: {
        title: 'المستخدمين',
        subtitle: 'إدارة جميع المستخدمين',
        all: 'الكل',
        active: 'نشط',
        inactive: 'غير نشط',
        verified: 'موثق',
        unverified: 'غير موثق',
        name: 'الاسم',
        phoneNumber: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        status: 'الحالة',
        noUsers: 'لا يوجد مستخدمين',
        confirmDelete: 'هل أنت متأكد من حذف هذا المستخدم؟',
        editUser: 'تعديل مستخدم',
        editUserSubtitle: 'تعديل بيانات المستخدم',
        namePlaceholder: 'أدخل الاسم الكامل',
        emailPlaceholder: 'أدخل البريد الإلكتروني',
        isActive: 'نشط',
        isVerified: 'موثق',
        yes: 'نعم',
        no: 'لا',
        nameRequired: 'الاسم مطلوب',
        userIdRequired: 'معرف المستخدم مطلوب',
      },
      metals: {
        title: 'أسعار المعادن',
        subtitle: 'عرض وإدارة أسعار الذهب والفضة والبلاتين',
        gold: 'الذهب',
        silver: 'الفضة',
        platinum: 'البلاتين',
        historical: 'التاريخ',
        date: 'التاريخ',
        noData: 'لا توجد بيانات',
        triggerNotification: 'إرسال إشعار يومي',
        confirmTrigger: 'هل تريد إرسال إشعار يومي بأسعار المعادن؟',
        notificationSent: 'تم إرسال الإشعار بنجاح',
        sending: 'جاري الإرسال',
        '7days': '7 أيام',
        '1month': 'شهر واحد',
        '3months': '3 أشهر',
      },
      notifications: {
        title: 'الإشعارات',
        subtitle: 'إدارة الإشعارات المرسلة للمستخدمين',
        sendNotification: 'إرسال إشعار جديد',
        sendNotificationSubtitle: 'إرسال إشعار متعدد اللغات لجميع المستخدمين',
        noNotifications: 'لا توجد إشعارات',
        confirmDelete: 'هل أنت متأكد من حذف هذا الإشعار؟',
        sentAt: 'تم الإرسال في',
        sent: 'تم الإرسال',
        arabicContent: 'المحتوى العربي',
        englishContent: 'المحتوى الإنجليزي',
        arabic: 'عربي',
        english: 'إنجليزي',
        fieldTitle: 'العنوان',
        message: 'الرسالة',
        titlePlaceholder: 'أدخل عنوان الإشعار',
        messagePlaceholder: 'أدخل نص الرسالة',
        send: 'إرسال',
        sending: 'جاري الإرسال',
        fillRequired: 'يرجى ملء جميع الحقول المطلوبة',
      },
      auth: {
        signIn: 'تسجيل الدخول',
        signUp: 'إنشاء حساب',
        signInTitle: 'تسجيل الدخول',
        signInSubtitle: 'أدخل رقم الهاتف وكلمة المرور لتسجيل الدخول!',
        phoneNumber: 'رقم الهاتف',
        password: 'كلمة المرور',
        rememberMe: 'تذكرني',
        forgotPassword: 'نسيت كلمة المرور؟',
        dontHaveAccount: 'ليس لديك حساب؟',
        signInWithGoogle: 'تسجيل الدخول باستخدام Google',
        signInWithX: 'تسجيل الدخول باستخدام X',
        or: 'أو',
        backToDashboard: 'العودة إلى لوحة التحكم',
        signingIn: 'جاري تسجيل الدخول...',
        loginError: 'فشل تسجيل الدخول. يرجى التحقق من البيانات.',
        signOut: 'تسجيل الخروج',
        slogan : 'من سبائك الذهب إلى معدات التعدين… كل شيء في مكان واحد'
      },
    },
    en: {
      sidebar: {
        menu: 'Main Menu',
        others: 'Others',
        dashboard: 'Dashboard',
        dashboardMain: 'Main',
        products: 'Products',
        allProducts: 'All Products',
        addProduct: 'Add Product',
        categories: 'Categories',
        orders: 'Orders',
        allOrders: 'All Orders',
        newOrders: 'New Orders',
        processingOrders: 'Processing Orders',
        customers: 'Customers',
        customersList: 'Customers List',
        addCustomer: 'Add Customer',
        goldPrices: 'Gold Prices',
        viewPrices: 'View Prices',
        updatePrices: 'Update Prices',
        priceHistory: 'History',
        reports: 'Reports',
        salesReports: 'Sales Reports',
        productsReports: 'Products Reports',
        customersReports: 'Customers Reports',
        charts: 'Charts',
        lineChart: 'Line Chart',
        barChart: 'Bar Chart',
        profile: 'Profile',
        settings: 'Settings',
        generalSettings: 'General Settings',
        security: 'Security',
        posts: 'Posts & Ads',
        notifications: 'Notifications',
      },
      header: {
        search: 'Search in dashboard...',
      },
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        previous: 'Previous',
        next: 'Next',
        showing: 'Showing',
        to: 'to',
        of: 'of',
        results: 'results',
        actions: 'Actions',
        saving: 'Saving',
      },
      dashboard: {
        totalUsers: 'Total Users',
        totalPosts: 'Total Posts',
        activePosts: 'Active Posts',
        totalCategories: 'Total Categories',
      },
      categories: {
        title: 'Categories',
        subtitle: 'Manage product and service categories',
        category: 'Category',
        name: 'Name',
        image: 'Image',
        noImage: 'No Image',
        noCategories: 'No categories found',
        confirmDelete: 'Are you sure you want to delete this category?',
        addCategory: 'Add Category',
        editCategory: 'Edit Category',
        addCategorySubtitle: 'Add a new category',
        editCategorySubtitle: 'Edit category information',
        nameEn: 'Name (English)',
        nameAr: 'Name (Arabic)',
        nameEnPlaceholder: 'Enter name in English',
        nameArPlaceholder: 'Enter name in Arabic',
        nameEnRequired: 'English name is required',
        nameArRequired: 'Arabic name is required',
        imageUrl: 'Image URL',
        imageUrlPlaceholder: 'https://example.com/image.jpg',
        parentCategory: 'Parent Category',
        parentCategoryPlaceholder: 'Parent category ID (optional)',
        parentCategoryHint: 'Leave empty if this is a main category',
      },
      posts: {
        title: 'Posts & Ads',
        subtitle: 'Manage all posts and advertisements',
        all: 'All',
        active: 'Active',
        inactive: 'Inactive',
        price: 'Price',
        status: 'Status',
        featured: 'Featured',
        yes: 'Yes',
        no: 'No',
        currency: 'SAR',
        noPosts: 'No posts found',
        confirmDelete: 'Are you sure you want to delete this post?',
        editPost: 'Edit Post',
        editPostSubtitle: 'Edit post information',
        detail: 'Detail',
        titlePlaceholder: 'Enter post title',
        detailPlaceholder: 'Enter post details',
        pricePlaceholder: 'Enter price',
        isActive: 'Active',
        isFeatured: 'Featured',
        fillRequired: 'Please fill all required fields',
        postIdRequired: 'Post ID is required',
      },
      users: {
        title: 'Users',
        subtitle: 'Manage all users',
        all: 'All',
        active: 'Active',
        inactive: 'Inactive',
        verified: 'Verified',
        unverified: 'Unverified',
        name: 'Name',
        phoneNumber: 'Phone Number',
        email: 'Email',
        status: 'Status',
        noUsers: 'No users found',
        confirmDelete: 'Are you sure you want to delete this user?',
        editUser: 'Edit User',
        editUserSubtitle: 'Edit user information',
        namePlaceholder: 'Enter full name',
        emailPlaceholder: 'Enter email address',
        isActive: 'Active',
        isVerified: 'Verified',
        yes: 'Yes',
        no: 'No',
        nameRequired: 'Name is required',
        userIdRequired: 'User ID is required',
      },
      metals: {
        title: 'Metals Prices',
        subtitle: 'View and manage gold, silver, and platinum prices',
        gold: 'Gold',
        silver: 'Silver',
        platinum: 'Platinum',
        historical: 'Historical',
        date: 'Date',
        noData: 'No data available',
        triggerNotification: 'Trigger Daily Notification',
        confirmTrigger: 'Do you want to send daily metals prices notification?',
        notificationSent: 'Notification sent successfully',
        sending: 'Sending',
        '7days': '7 Days',
        '1month': '1 Month',
        '3months': '3 Months',
      },
      notifications: {
        title: 'Notifications',
        subtitle: 'Manage notifications sent to users',
        sendNotification: 'Send New Notification',
        sendNotificationSubtitle: 'Send multi-language notification to all users',
        noNotifications: 'No notifications found',
        confirmDelete: 'Are you sure you want to delete this notification?',
        sentAt: 'Sent at',
        sent: 'Sent',
        arabicContent: 'Arabic Content',
        englishContent: 'English Content',
        arabic: 'Arabic',
        english: 'English',
        fieldTitle: 'Title',
        message: 'Message',
        titlePlaceholder: 'Enter notification title',
        messagePlaceholder: 'Enter notification message',
        send: 'Send',
        sending: 'Sending',
        fillRequired: 'Please fill all required fields',
      },
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signInTitle: 'Sign In',
        signInSubtitle: 'Enter your phone number and password to sign in!',
        phoneNumber: 'Phone Number',
        password: 'Password',
        rememberMe: 'Keep me logged in',
        forgotPassword: 'Forgot password?',
        dontHaveAccount: "Don't have an account?",
        signInWithGoogle: 'Sign in with Google',
        signInWithX: 'Sign in with X',
        or: 'Or',
        backToDashboard: 'Back to dashboard',
        signingIn: 'Signing in...',
        loginError: 'Login failed. Please check your credentials.',
        signOut: 'Sign out',
        slogan : 'From gold ingots to mining equipment… everything in one place.'
      },
    },
  };

  constructor() {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      this.setLanguage(savedLang);
    } else {
      this.setLanguage('ar');
    }
  }

  get currentLanguage(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  get currentLanguageValue(): Language {
    return this.currentLanguage$.value;
  }

  get isRTL(): boolean {
    return this.currentLanguage$.value === 'ar';
  }

  setLanguage(lang: Language): void {
    this.currentLanguage$.next(lang);
    localStorage.setItem('language', lang);
    
    // Update HTML dir and lang attributes
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    
    // Update body class for RTL support and Arabic font
    document.body.classList.remove('rtl', 'ltr', 'lang-ar', 'lang-en');
    document.body.classList.add(lang === 'ar' ? 'rtl' : 'ltr');
    document.body.classList.add(lang === 'ar' ? 'lang-ar' : 'lang-en');
  }

  translate(key: string): string {
    const lang = this.currentLanguage$.value;
    const keys = key.split('.');
    let value: any = this.translations[lang];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return value || key;
  }

  // Helper method for template usage
  t(key: string): string {
    return this.translate(key);
  }

  // Get all translations for current language
  getTranslations(): TranslationKeys {
    return this.translations[this.currentLanguage$.value];
  }
}

