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
    changePassword: string;
    posts: string;
    notifications: string;
    adAttributes: string;
    identityVerification: string;
    businessVerification: string;
    contactMessages: string;
  };
  // Header
  header: {
    search: string;
    viewAll: string;
    accountSettings: string;
  };
  // Common
      common: {
        loading: string;
        save: string;
        cancel: string;
        refresh: string;
        retry: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    previous: string;
    next: string;
    firstPage: string;
    lastPage: string;
    itemsPerPage: string;
    showing: string;
    to: string;
    of: string;
    results: string;
    actions: string;
    saving: string;
    confirm: string;
    errorTitle: string;
    close: string;
    date: string;
    details: string;
    select: string;
    status: string;
    active: string;
    inactive: string;
  };
  // Dashboard
      dashboard: {
        totalUsers: string;
        totalPosts: string;
        activePosts: string;
        totalCategories: string;
        subtitle: string;
        goldPulse: string;
        gold24k: string;
        pulsePeriod: string;
        pulseUp: string;
        pulseDown: string;
        pulseStable: string;
        goldChart: string;
        goldChartHint: string;
        karat: string;
        pricesLoadError: string;
        periodFallback: string;
        high: string;
        low: string;
        average: string;
        pendingReview: string;
        pendingReviewHint: string;
        noPending: string;
        recentPosts: string;
        recentPostsHint: string;
        viewAll: string;
        noPosts: string;
        needsAttention: string;
        needsAttentionHint: string;
        attentionAds: string;
        attentionIdentity: string;
        attentionBusiness: string;
        attentionContact: string;
        activityChart: string;
        activityChartHint: string;
        newUsers: string;
        newAds: string;
        statsLoadError: string;
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
        confirmDeleteTitle: string;
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
        uploadImage: string;
        uploading: string;
        changeImage: string;
        removeImage: string;
        imageHint: string;
        imageTypeError: string;
        imageSizeError: string;
        noParent: string;
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
        confirmDeleteTitle: string;
        approve: string;
        reject: string;
        pending: string;
        approved: string;
        rejected: string;
        allStatus: string;
        deletedByOwner: string;
        post: string;
        seller: string;
        reviewStatus: string;
        viewDetails: string;
        category: string;
        location: string;
        confirmApprove: string;
        confirmApproveTitle: string;
        confirmRejectTitle: string;
        rejectReason: string;
        rejectReasonPlaceholder: string;
        rejectReasonInvalid: string;
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
        image: string;
        sellerBusiness: string;
        sellerIndividual: string;
        identityVerified: string;
        businessVerified: string;
        priceMarket: string;
        priceContact: string;
        countryFilter: string;
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
        confirmDeleteTitle: string;
        cannotDeleteSelf: string;
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
        accountType: string;
        allAccountTypes: string;
        accountIndividual: string;
        accountBusiness: string;
        identityStatus: string;
        allIdentityStatuses: string;
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
        currentPrices: string;
        perGram: string;
        perToz: string;
        byCarat: string;
        lastUpdated: string;
        scheduleTitle: string;
        scheduleTime: string;
        scheduleCron: string;
        scheduleAudience: string;
        scheduleSource: string;
        previewTitle: string;
        confirmSendTitle: string;
        confirmSendDaily: string;
      };
      // Notifications
      notifications: {
        title: string;
        subtitle: string;
        sendNotification: string;
        sendNotificationSubtitle: string;
        noNotifications: string;
        confirmDelete: string;
        confirmDeleteTitle: string;
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
  // Settings
  settings: {
    title: string;
    subtitle: string;
    currency: string;
    currencyHint: string;
    save: string;
    saveSuccess: string;
    saveError: string;
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
    forgot: {
      title: string;
      subtitle: string;
      sendOtp: string;
      sending: string;
      phoneRequired: string;
      phoneInvalid: string;
      sendError: string;
      rememberedPassword: string;
    };
    reset: {
      title: string;
      subtitle: string;
      otpLabel: string;
      otpInvalid: string;
      didntReceive: string;
      resend: string;
      resendIn: string;
      newPassword: string;
      confirmPassword: string;
      passwordHint: string;
      passwordTooShort: string;
      passwordMismatch: string;
      resetButton: string;
      resetting: string;
      resetError: string;
    };
    change: {
      title: string;
      subtitle: string;
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
      submit: string;
      fillRequired: string;
      sameAsCurrent: string;
      success: string;
      error: string;
    };
    notAdmin: string;
  };
  // Lookup layer (blocked until endpoints are confirmed)
  lookup: {
    unavailable: string;
    blockedHint: string;
  };
  // Image uploader
  uploader: {
    hint: string;
    removeImage: string;
    uploadFailed: string;
    uploaded: string;
    uploading: string;
    chooseImage: string;
    changeImage: string;
    invalidType: string;
    tooLarge: string;
  };
  // Secure document viewer
  docViewer: {
    refresh: string;
    missing: string;
    expired: string;
    loadFailed: string;
  };
  // Backend error codes → messages (see api-error-codes.ts)
  apiErrors: Record<string, string>;
  // Ad attributes
  attributes: {
    title: string;
    subtitle: string;
    tabDefinitions: string;
    tabOptions: string;
    tabMappings: string;
    addAttribute: string;
    editAttribute: string;
    empty: string;
    definitionsHint: string;
    nameAr: string;
    nameEn: string;
    code: string;
    codeImmutable: string;
    dataType: string;
    dataTypes: Record<string, string>;
    unit: string;
    unitAr: string;
    unitEn: string;
    minValue: string;
    maxValue: string;
    minMaxInvalid: string;
    decimalPlaces: string;
    dependsOn: string;
    dependsOnHint: string;
    noDependency: string;
    deactivate: string;
    deactivateTitle: string;
    deactivateMessage: string;
    reactivate: string;
  };
  options: {
    chooseAttribute: string;
    selectAttribute: string;
    noSelectAttributes: string;
    empty: string;
    count: string;
    addOption: string;
    editOption: string;
    saveOrder: string;
    labelAr: string;
    labelEn: string;
    code: string;
    sortOrder: string;
    parentOption: string;
    chooseParentOption: string;
    dependentHint: string;
    moveUp: string;
    moveDown: string;
    deactivate: string;
    deactivateTitle: string;
    deactivateMessage: string;
    reactivate: string;
  };
  mappings: {
    assignTitle: string;
    assign: string;
    chooseSubcategory: string;
    selectSubcategory: string;
    subcategoriesOnly: string;
    chooseAttribute: string;
    attribute: string;
    isRequired: string;
    requiredWarning: string;
    isFilterable: string;
    textNotFilterable: string;
    showInCard: string;
    sortOrder: string;
    empty: string;
    parentNotAssignedWarning: string;
    unassign: string;
    unassignTitle: string;
    unassignMessage: string;
    unassignNote: string;
  };
  // Post/ad details page
  postDetails: {
    title: string;
    subtitle: string;
    backToList: string;
    images: string;
    noImages: string;
    attributes: string;
    statusTitle: string;
    reviewedAt: string;
    inactiveReason: string;
    endDate: string;
    deletedAt: string;
    classification: string;
    address: string;
    owner: string;
    viewOwnerProfile: string;
  };
  // Identity verification (KYC)
  identity: {
    list: {
      title: string;
      subtitle: string;
      user: string;
      idNumber: string;
      status: string;
      submittedAt: string;
      empty: string;
      loadFailed: string;
      userIdPlaceholder: string;
    };
    details: {
      title: string;
      subtitle: string;
      backToList: string;
      docFront: string;
      docBack: string;
      docSelfie: string;
      events: string;
      requestInfo: string;
      fullNameOnId: string;
      idExpiry: string;
      possibleDuplicate: string;
      actions: string;
      approve: string;
      approveTitle: string;
      approveHint: string;
      idNumberFromDocument: string;
      idNumberPlaceholder: string;
      idNumberInvalid: string;
      idExpiryFromDocument: string;
      idExpiryInvalid: string;
      internalNote: string;
      requestMoreInfo: string;
      moreInfoTitle: string;
      moreInfoHint: string;
      reject: string;
      rejectTitle: string;
      rejectHint: string;
      reasonCode: string;
      selectReason: string;
      missingItems: string;
      userMessage: string;
      userMessagePlaceholder: string;
      approveSuccess: string;
      moreInfoSuccess: string;
      rejectSuccess: string;
      revokeSuccess: string;
      revoke: string;
      revokeWarning: string;
      revokeConfirmTitle: string;
      revokeConfirmMessage: string;
      loadFailed: string;
    };
    status: Record<string, string>;
    reason: Record<string, string>;
    missing: Record<string, string>;
    event: Record<string, string>;
  };
  // Business verification
  business: {
    list: {
      title: string;
      subtitle: string;
      user: string;
      tradeName: string;
      authority: string;
      allAuthorities: string;
      status: string;
      submittedAt: string;
      empty: string;
      loadFailed: string;
      userIdPlaceholder: string;
    };
    details: {
      title: string;
      subtitle: string;
      backToList: string;
      docLicense: string;
      docAuthorization: string;
      events: string;
      requestInfo: string;
      legalName: string;
      licenseNumber: string;
      licenseExpiry: string;
      possibleDuplicate: string;
      identityStatus: string;
      identityExpires: string;
      actions: string;
      approve: string;
      approveTitle: string;
      approveHint: string;
      licenseCheck: string;
      checkLicense: string;
      licenseCheckFailed: string;
      licenseAvailable: string;
      licenseClaimed: string;
      licenseClaimedUser: string;
      selectAuthority: string;
      authorityNameRequired: string;
      legalNameFromDocument: string;
      licenseNumberFromDocument: string;
      authorityFromDocument: string;
      authorityNameFromDocument: string;
      licenseExpiryFromDocument: string;
      licenseExpiryInvalid: string;
      tradeNameConfirmed: string;
      businessKindConfirmed: string;
      activityTypeConfirmed: string;
      emirateConfirmed: string;
      emirateBlocked: string;
      internalNote: string;
      requestMoreInfo: string;
      moreInfoTitle: string;
      moreInfoHint: string;
      reject: string;
      rejectTitle: string;
      rejectHint: string;
      reasonCode: string;
      selectReason: string;
      missingItems: string;
      userMessage: string;
      userMessagePlaceholder: string;
      approveSuccess: string;
      moreInfoSuccess: string;
      rejectSuccess: string;
      revokeSuccess: string;
      revoke: string;
      revokeWarning: string;
      revokeConfirmTitle: string;
      revokeConfirmMessage: string;
      loadFailed: string;
    };
    status: Record<string, string>;
    reason: Record<string, string>;
    missing: Record<string, string>;
    authority: Record<string, string>;
    kind: Record<string, string>;
    activity: Record<string, string>;
    days: Record<string, string>;
    closed: string;
  };
  // Business public profile (view/edit)
  businessProfile: {
    title: string;
    subtitle: string;
    notABusinessTitle: string;
    notABusinessMessage: string;
    viewUserProfile: string;
    viewRequests: string;
    licenseEndingIn: string;
    images: string;
    logo: string;
    cover: string;
    basicInfo: string;
    tradeName: string;
    tradeNameAdminOnly: string;
    platform: string;
    noSocialLinks: string;
    noChanges: string;
    loadFailed: string;
    saveSuccess: string;
    saveFailed: string;
    status: Record<string, string>;
  };
  // User public profile page
  userProfile: {
    title: string;
    subtitle: string;
    degradedNotice: string;
    ownerName: string;
    identityExpiresOn: string;
    accountState: string;
    banned: string;
    viewActiveAds: string;
    viewBusinessProfile: string;
    businessInfo: string;
    tradeName: string;
    businessKind: string;
    activityType: string;
    contactPhone: string;
    contactEmail: string;
    website: string;
    address: string;
    description: string;
    socialLinks: string;
    workingHours: string;
    loadFailed: string;
  };
  // User active ads page
  userAds: {
    title: string;
    subtitle: string;
    backToProfile: string;
    country: string;
    scopeNote: string;
    empty: string;
    loadFailed: string;
  };
  // Website contact messages inbox
  contactMessages: {
    list: {
      title: string;
      subtitle: string;
      sender: string;
      inquiryType: string;
      subject: string;
      status: string;
      receivedAt: string;
      empty: string;
      loadFailed: string;
    };
    details: {
      title: string;
      subtitle: string;
      backToList: string;
      senderInfo: string;
      fullName: string;
      phone: string;
      email: string;
      referenceNumber: string;
      updatedAt: string;
      manage: string;
      adminNotes: string;
      adminNotesPlaceholder: string;
      save: string;
      saveSuccess: string;
      saveFailed: string;
      delete: string;
      deleteTitle: string;
      deleteWarning: string;
      deleteFailed: string;
      loadFailed: string;
    };
    status: Record<string, string>;
  };
  // Header bell: events awaiting the admin
  adminInbox: {
    title: string;
    empty: string;
    markAllRead: string;
    loadMore: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    types: Record<string, string>;
    pageSubtitle: string;
    allTypes: string;
    unreadOnly: string;
    emptyFiltered: string;
    enableDesktop: string;
    desktopBlocked: string;
  };
  // Server error codes (APIError.message) shown to the admin
  errors: Record<string, string>;
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
        changePassword: 'تغيير كلمة المرور',
        posts: 'الإعلانات',
        notifications: 'الإشعارات',
        adAttributes: 'خصائص الإعلانات',
        identityVerification: 'توثيق الهوية',
        businessVerification: 'توثيق الأعمال',
        contactMessages: 'رسائل تواصل معنا',
      },
      header: {
        search: 'ابحث في لوحة التحكم...',
        viewAll: 'عرض الكل',
        accountSettings: 'إعدادات الحساب',
      },
      common: {
        loading: 'جاري التحميل...',
        save: 'حفظ',
        cancel: 'إلغاء',
        refresh: 'تحديث',
        retry: 'إعادة المحاولة',
        delete: 'حذف',
        edit: 'تعديل',
        add: 'إضافة',
        search: 'بحث',
        previous: 'السابق',
        next: 'التالي',
        firstPage: 'الصفحة الأولى',
        lastPage: 'الصفحة الأخيرة',
        itemsPerPage: 'العناصر في الصفحة',
        showing: 'عرض',
        to: 'إلى',
        of: 'من',
        results: 'نتيجة',
        actions: 'الإجراءات',
        saving: 'جاري الحفظ',
        confirm: 'تأكيد',
        errorTitle: 'حدث خطأ',
        close: 'إغلاق',
        date: 'التاريخ',
        details: 'التفاصيل',
        select: 'اختر',
        status: 'الحالة',
        active: 'مفعّلة',
        inactive: 'معطّلة',
      },
      dashboard: {
        totalUsers: 'إجمالي المستخدمين',
        totalPosts: 'إجمالي الإعلانات',
        activePosts: 'الإعلانات النشطة',
        totalCategories: 'إجمالي الفئات',
        subtitle: 'نظرة عامة على أداء المنصة وأسعار الذهب',
        goldPulse: 'نبض سعر الذهب',
        gold24k: 'ذهب عيار 24',
        pulsePeriod: 'آخر 30 يوم',
        pulseUp: 'اتجاه صاعد',
        pulseDown: 'اتجاه هابط',
        pulseStable: 'مستقر',
        goldChart: 'مخطط سعر الذهب',
        goldChartHint: 'تطور سعر الغرام بالعملة المحلية',
        karat: 'العيار',
        pricesLoadError: 'تعذر تحميل بيانات الأسعار',
        periodFallback: 'بيانات 3 أشهر غير متاحة حالياً من الخادم — يتم عرض آخر شهر',
        high: 'الأعلى',
        low: 'الأدنى',
        average: 'المتوسط',
        pendingReview: 'بانتظار المراجعة',
        pendingReviewHint: 'إعلانات تحتاج موافقتك',
        noPending: 'لا توجد إعلانات بانتظار المراجعة',
        recentPosts: 'أحدث الإعلانات',
        recentPostsHint: 'آخر الإعلانات المضافة للمنصة',
        viewAll: 'عرض الكل',
        noPosts: 'لا توجد إعلانات بعد',
        needsAttention: 'يحتاج انتباهك',
        needsAttentionHint: 'طلبات بانتظار إجراء منك',
        attentionAds: 'إعلانات بانتظار المراجعة',
        attentionIdentity: 'طلبات توثيق الهوية',
        attentionBusiness: 'طلبات الحسابات التجارية',
        attentionContact: 'رسائل تواصل جديدة',
        activityChart: 'نشاط المنصة',
        activityChartHint: 'المستخدمون الجدد والإعلانات الجديدة يومياً — آخر 30 يوماً (توقيت دبي)',
        newUsers: 'مستخدمون جدد',
        newAds: 'إعلانات جديدة',
        statsLoadError: 'تعذر تحميل الإحصائيات',
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
        confirmDeleteTitle: 'حذف الفئة',
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
        uploadImage: 'رفع صورة',
        uploading: 'جاري الرفع...',
        changeImage: 'تغيير الصورة',
        removeImage: 'إزالة الصورة',
        imageHint: 'PNG أو JPG أو GIF (بحد أقصى 5 ميجابايت)',
        imageTypeError: 'نوع الملف غير مدعوم. اختر صورة بصيغة PNG أو JPG أو GIF',
        imageSizeError: 'حجم الصورة يتجاوز الحد المسموح (5 ميجابايت)',
        noParent: 'بدون - فئة رئيسية',
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
        confirmDeleteTitle: 'حذف الإعلان',
        approve: 'موافقة',
        reject: 'رفض',
        pending: 'قيد المراجعة',
        approved: 'مقبول',
        rejected: 'مرفوض',
        allStatus: 'كل الحالات',
        deletedByOwner: 'محذوفة',
        post: 'الإعلان',
        seller: 'البائع',
        reviewStatus: 'حالة المراجعة',
        viewDetails: 'عرض التفاصيل',
        category: 'الفئة',
        location: 'الموقع',
        confirmApprove: 'هل أنت متأكد من الموافقة على هذا الإعلان؟',
        confirmApproveTitle: 'الموافقة على الإعلان',
        confirmRejectTitle: 'رفض الإعلان',
        rejectReason: 'سبب الرفض',
        rejectReasonPlaceholder: 'اكتب سبب الرفض...',
        rejectReasonInvalid: 'سبب الرفض مطلوب (من 1 إلى 500 حرف)',
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
        image: 'الصورة',
        sellerBusiness: 'تاجر',
        sellerIndividual: 'فرد',
        identityVerified: 'هوية موثقة',
        businessVerified: 'نشاط تجاري موثق',
        priceMarket: 'حسب السوق',
        priceContact: 'تواصل للسعر',
        countryFilter: 'الدولة',
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
        confirmDeleteTitle: 'حذف المستخدم',
        cannotDeleteSelf: 'لا يمكنك حذف حسابك الحالي',
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
        accountType: 'نوع الحساب',
        allAccountTypes: 'كل أنواع الحسابات',
        accountIndividual: 'فرد',
        accountBusiness: 'تاجر',
        identityStatus: 'حالة التوثيق',
        allIdentityStatuses: 'كل حالات التوثيق',
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
        currentPrices: 'الأسعار الحالية',
        perGram: 'للجرام',
        perToz: 'للأونصة',
        byCarat: 'حسب العيار',
        lastUpdated: 'آخر تحديث',
        scheduleTitle: 'جدول الإشعار اليومي',
        scheduleTime: 'الوقت',
        scheduleCron: 'تعبير Cron',
        scheduleAudience: 'الجمهور',
        scheduleSource: 'مصدر البيانات',
        previewTitle: 'معاينة الإشعار',
        confirmSendTitle: 'إرسال الإشعار اليومي',
        confirmSendDaily: 'هل أنت متأكد من إرسال إشعار أسعار المعادن لجميع المستخدمين الآن؟',
      },
      notifications: {
        title: 'الإشعارات',
        subtitle: 'إدارة الإشعارات المرسلة للمستخدمين',
        sendNotification: 'إرسال إشعار جديد',
        sendNotificationSubtitle: 'إرسال إشعار متعدد اللغات لجميع المستخدمين',
        noNotifications: 'لا توجد إشعارات',
        confirmDelete: 'هل أنت متأكد من حذف هذا الإشعار؟',
        confirmDeleteTitle: 'حذف الإشعار',
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
      settings: {
        title: 'الإعدادات',
        subtitle: 'إدارة إعدادات النظام',
        currency: 'عملة العرض الافتراضية',
        currencyHint: 'تُستخدم هذه العملة كقيمة افتراضية عند عدم تحديد عملة في البيانات.',
        save: 'حفظ',
        saveSuccess: 'تم حفظ الإعدادات بنجاح',
        saveError: 'فشل حفظ الإعدادات. حاول مرة أخرى.',
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
        slogan: 'من سبائك الذهب إلى معدات التعدين… كل شيء في مكان واحد',
        forgot: {
          title: 'نسيت كلمة المرور',
          subtitle: 'أدخل رقم هاتفك وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور.',
          sendOtp: 'إرسال رمز التحقق',
          sending: 'جاري الإرسال...',
          phoneRequired: 'رقم الهاتف مطلوب',
          phoneInvalid: 'رقم الهاتف غير صالح',
          sendError: 'فشل إرسال رمز التحقق. حاول مرة أخرى.',
          rememberedPassword: 'تذكرت كلمة المرور؟',
        },
        reset: {
          title: 'إعادة تعيين كلمة المرور',
          subtitle: 'أدخل رمز التحقق المرسل إلى',
          otpLabel: 'رمز التحقق',
          otpInvalid: 'رمز التحقق يجب أن يكون 6 أرقام',
          didntReceive: 'لم يصلك الرمز؟',
          resend: 'إعادة الإرسال',
          resendIn: 'إعادة الإرسال خلال',
          newPassword: 'كلمة المرور الجديدة',
          confirmPassword: 'تأكيد كلمة المرور',
          passwordHint: 'يجب أن تكون 6 أحرف على الأقل',
          passwordTooShort: 'كلمة المرور قصيرة جداً (6 أحرف على الأقل)',
          passwordMismatch: 'كلمتا المرور غير متطابقتين',
          resetButton: 'إعادة تعيين كلمة المرور',
          resetting: 'جاري إعادة التعيين...',
          resetError: 'فشل إعادة تعيين كلمة المرور. تحقق من الرمز وحاول مرة أخرى.',
        },
        change: {
          title: 'تغيير كلمة المرور',
          subtitle: 'حدّث كلمة مرور حسابك الإداري',
          currentPassword: 'كلمة المرور الحالية',
          newPassword: 'كلمة المرور الجديدة',
          confirmPassword: 'تأكيد كلمة المرور الجديدة',
          submit: 'حفظ كلمة المرور',
          fillRequired: 'يرجى ملء جميع الحقول المطلوبة',
          sameAsCurrent: 'كلمة المرور الجديدة يجب أن تختلف عن الحالية',
          success: 'تم تغيير كلمة المرور بنجاح',
          error: 'فشل تغيير كلمة المرور. تحقق من كلمة المرور الحالية.',
        },
        notAdmin: 'هذا الحساب ليس حساب مدير',
      },
      lookup: {
        unavailable: 'غير متاح حالياً',
        blockedHint: 'معطّل حتى يتم تأكيد نقطة نهاية القوائم (الدول/الإمارات) من الخادم',
      },
      uploader: {
        hint: 'PNG أو JPG أو GIF (بحد أقصى 5 ميجابايت)',
        removeImage: 'إزالة الصورة',
        uploadFailed: 'فشل رفع الصورة. حاول مرة أخرى.',
        uploaded: 'تم رفع الصورة',
        uploading: 'جاري رفع الصورة...',
        chooseImage: 'اختيار صورة',
        changeImage: 'تغيير الصورة',
        invalidType: 'نوع الملف غير مدعوم. اختر صورة بصيغة PNG أو JPG أو GIF',
        tooLarge: 'حجم الصورة يتجاوز الحد المسموح (5 ميجابايت)',
      },
      docViewer: {
        refresh: 'تحديث الرابط',
        missing: 'لا يوجد مستند',
        expired: 'انتهت صلاحية الرابط المؤقت',
        loadFailed: 'تعذر تحميل المستند',
      },
      apiErrors: {
        attributeCodeExists: 'رمز الخاصية مستخدم مسبقاً',
        attributeHasValues: 'لا يمكن حذف الخاصية لأنها تحتوي على قيم',
        attributeInvalidOption: 'الخيار المحدد غير صالح لهذه الخاصية',
        parentAttributeNotAssigned: 'الخاصية الأب غير معيّنة لهذه الفئة',
        attributeHasDependents: 'لا يمكن التعطيل لوجود خصائص تعتمد عليها',
        idExpired: 'تاريخ انتهاء الهوية يجب أن يكون في المستقبل',
        identityAlreadyClaimed: 'رقم الهوية موثق لحساب آخر',
        identityRevokedContactSupport: 'تم إلغاء توثيق الهوية — يرجى التواصل مع الدعم',
        licenseExpired: 'تاريخ انتهاء الرخصة يجب أن يكون في المستقبل',
        businessLicenseAlreadyClaimed: 'الرخصة موثقة لحساب تجاري آخر',
        notABusinessProfile: 'هذا الحساب ليس حساباً تجارياً',
        unknown: 'حدث خطأ غير متوقع',
      },
      attributes: {
        title: 'خصائص الإعلانات',
        subtitle: 'إدارة خصائص الإعلانات وخياراتها وربطها بالفئات',
        tabDefinitions: 'التعريفات',
        tabOptions: 'الخيارات',
        tabMappings: 'ربط الفئات',
        addAttribute: 'إضافة خاصية',
        editAttribute: 'تعديل الخاصية',
        empty: 'لا توجد خصائص بعد',
        definitionsHint: 'الرمز (code) لا يمكن تغييره بعد الإنشاء',
        nameAr: 'الاسم بالعربية',
        nameEn: 'الاسم بالإنجليزية',
        code: 'الرمز',
        codeImmutable: 'لا يمكن تعديل الرمز بعد الإنشاء',
        dataType: 'نوع البيانات',
        dataTypes: {
          select: 'قائمة اختيار',
          number: 'رقم',
          text: 'نص',
          boolean: 'نعم/لا',
        },
        unit: 'الوحدة',
        unitAr: 'الوحدة بالعربية',
        unitEn: 'الوحدة بالإنجليزية',
        minValue: 'الحد الأدنى',
        maxValue: 'الحد الأعلى',
        minMaxInvalid: 'الحد الأدنى يجب أن يكون أصغر من أو يساوي الحد الأعلى',
        decimalPlaces: 'المنازل العشرية',
        dependsOn: 'تعتمد على خاصية',
        dependsOnHint: 'للقوائم المتسلسلة فقط (اختياري)',
        noDependency: 'بدون اعتماد',
        deactivate: 'تعطيل',
        deactivateTitle: 'تعطيل الخاصية',
        deactivateMessage: 'لن تظهر الخاصية في الإعلانات الجديدة. الإعلانات الحالية لا تتأثر.',
        reactivate: 'إعادة تفعيل',
      },
      options: {
        chooseAttribute: 'اختر خاصية لعرض خياراتها',
        selectAttribute: 'اختر خاصية',
        noSelectAttributes: 'لا توجد خصائص من نوع قائمة اختيار',
        empty: 'لا توجد خيارات لهذه الخاصية',
        count: 'عدد الخيارات',
        addOption: 'إضافة خيار',
        editOption: 'تعديل الخيار',
        saveOrder: 'حفظ الترتيب',
        labelAr: 'التسمية بالعربية',
        labelEn: 'التسمية بالإنجليزية',
        code: 'الرمز',
        sortOrder: 'الترتيب',
        parentOption: 'الخيار الأب',
        chooseParentOption: 'اختر الخيار الأب (اختياري)',
        dependentHint: 'للقوائم المتسلسلة: اختر خياراً أباً من الخاصية المرتبطة',
        moveUp: 'تحريك لأعلى',
        moveDown: 'تحريك لأسفل',
        deactivate: 'تعطيل',
        deactivateTitle: 'تعطيل الخيار',
        deactivateMessage: 'لن يظهر هذا الخيار عند إنشاء إعلانات جديدة.',
        reactivate: 'إعادة تفعيل',
      },
      mappings: {
        assignTitle: 'ربط خاصية بفئة فرعية',
        assign: 'ربط',
        chooseSubcategory: 'اختر الفئة الفرعية',
        selectSubcategory: 'اختر فئة فرعية',
        subcategoriesOnly: 'الربط متاح للفئات الفرعية فقط',
        chooseAttribute: 'اختر الخاصية',
        attribute: 'الخاصية',
        isRequired: 'إلزامية',
        requiredWarning: 'تفعيل الإلزام قد يمنع تطبيق الجوال من نشر إعلانات في هذه الفئة حتى يتم تحديثه',
        isFilterable: 'قابلة للتصفية',
        textNotFilterable: 'الخصائص النصية لا يمكن أن تكون قابلة للتصفية',
        showInCard: 'إظهار في البطاقة',
        sortOrder: 'الترتيب',
        empty: 'لا توجد خصائص مربوطة بهذه الفئة',
        parentNotAssignedWarning: 'تنبيه: الخاصية التي تعتمد عليها هذه الخاصية غير مربوطة بهذه الفئة',
        unassign: 'إلغاء الربط',
        unassignTitle: 'إلغاء ربط الخاصية',
        unassignMessage: 'هل أنت متأكد من إلغاء ربط هذه الخاصية بالفئة؟',
        unassignNote: 'القيم المحفوظة في الإعلانات الحالية لا تُحذف.',
      },
      postDetails: {
        title: 'تفاصيل الإعلان',
        subtitle: 'عرض كامل لبيانات الإعلان وحالته',
        backToList: 'العودة للقائمة',
        images: 'الصور',
        noImages: 'لا توجد صور لهذا الإعلان',
        attributes: 'الخصائص',
        statusTitle: 'الحالة',
        reviewedAt: 'تاريخ المراجعة',
        inactiveReason: 'سبب التعطيل',
        endDate: 'تاريخ الانتهاء',
        deletedAt: 'تاريخ الحذف',
        classification: 'التصنيف',
        address: 'العنوان',
        owner: 'المالك',
        viewOwnerProfile: 'عرض ملف المالك',
      },
      identity: {
        list: {
          title: 'طلبات توثيق الهوية',
          subtitle: 'مراجعة طلبات توثيق الهوية الإماراتية',
          user: 'المستخدم',
          idNumber: 'رقم الهوية',
          status: 'الحالة',
          submittedAt: 'تاريخ التقديم',
          empty: 'لا توجد طلبات',
          loadFailed: 'فشل تحميل الطلبات',
          userIdPlaceholder: 'معرف المستخدم',
        },
        details: {
          title: 'طلب توثيق هوية',
          subtitle: 'مراجعة المستندات واتخاذ القرار',
          backToList: 'العودة للطلبات',
          docFront: 'الهوية - الوجه الأمامي',
          docBack: 'الهوية - الوجه الخلفي',
          docSelfie: 'السيلفي',
          events: 'سجل الأحداث',
          requestInfo: 'بيانات الطلب',
          fullNameOnId: 'الاسم كما في الهوية',
          idExpiry: 'انتهاء الهوية',
          possibleDuplicate: 'تنبيه: رقم الهوية قد يكون مسجلاً لحساب آخر — تحقق قبل الموافقة',
          actions: 'الإجراءات',
          approve: 'موافقة',
          approveTitle: 'الموافقة على الطلب',
          approveHint: 'أدخل البيانات كما تقرأها من صورة المستند (وليس من إدخال المستخدم)',
          idNumberFromDocument: 'رقم الهوية كما في المستند',
          idNumberPlaceholder: '784-XXXX-XXXXXXX-X',
          idNumberInvalid: 'رقم الهوية يجب أن يكون 15 رقماً بعد إزالة الرموز',
          idExpiryFromDocument: 'تاريخ انتهاء الهوية كما في المستند',
          idExpiryInvalid: 'التاريخ يجب أن يكون في المستقبل (بتوقيت دبي)',
          internalNote: 'ملاحظة داخلية (لا تظهر للمستخدم)',
          requestMoreInfo: 'طلب معلومات إضافية',
          moreInfoTitle: 'طلب معلومات إضافية',
          moreInfoHint: 'سيُطلب من المستخدم إعادة التقاط المستندات المحددة وإعادة التقديم',
          reject: 'رفض',
          rejectTitle: 'رفض الطلب',
          rejectHint: 'يمكن للمستخدم تقديم طلب جديد بعد الرفض',
          reasonCode: 'سبب القرار',
          selectReason: 'اختر السبب',
          missingItems: 'العناصر الناقصة',
          userMessage: 'رسالة للمستخدم (تظهر في التطبيق)',
          userMessagePlaceholder: 'اكتب رسالة واضحة ومحترمة للمستخدم...',
          approveSuccess: 'تمت الموافقة على الطلب بنجاح',
          moreInfoSuccess: 'تم إرسال طلب المعلومات الإضافية',
          rejectSuccess: 'تم رفض الطلب',
          revokeSuccess: 'تم إلغاء توثيق الهوية',
          revoke: 'إلغاء التوثيق',
          revokeWarning: 'يبقى حجز رقم الهوية قائماً بعد الإلغاء — لا يمكن استخدامه لحساب آخر (حماية من الاحتيال)، ولن يتمكن المستخدم من تقديم طلب جديد ذاتياً.',
          revokeConfirmTitle: 'إلغاء توثيق الهوية',
          revokeConfirmMessage: 'هل أنت متأكد من إلغاء توثيق هوية هذا المستخدم؟ يبقى رقم الهوية محجوزاً.',
          loadFailed: 'فشل تحميل تفاصيل الطلب',
        },
        status: {
          draft: 'مسودة',
          pending: 'قيد المراجعة',
          more_info_required: 'بانتظار معلومات',
          approved: 'موثق',
          rejected: 'مرفوض',
          cancelled: 'ملغي',
          unverified: 'غير موثق',
          verified: 'موثق',
          expired: 'منتهي',
          revoked: 'ملغى',
          all: 'الكل',
        },
        reason: {
          id_front_unreadable: 'الوجه الأمامي للهوية غير واضح',
          id_back_unreadable: 'الوجه الخلفي للهوية غير واضح',
          selfie_mismatch: 'السيلفي لا يطابق صورة الهوية',
          selfie_unreadable: 'صورة السيلفي غير واضحة',
          id_expired: 'الهوية منتهية الصلاحية',
          id_not_uae: 'الهوية ليست إماراتية',
          name_mismatch: 'الاسم غير مطابق',
          photo_mismatch: 'الصورة غير مطابقة',
          document_tampered: 'المستند يبدو معدّلاً',
          policy_violation: 'مخالفة السياسات',
          other: 'أخرى',
        },
        missing: {
          id_front: 'الوجه الأمامي',
          id_back: 'الوجه الخلفي',
          selfie: 'السيلفي',
        },
        event: {
          submitted: 'تم تقديم الطلب',
          resubmitted: 'تمت إعادة التقديم',
          more_info_requested: 'تم طلب معلومات إضافية',
          approved: 'تمت الموافقة',
          rejected: 'تم الرفض',
          revoked: 'تم إلغاء التوثيق',
          cancelled: 'تم الإلغاء',
        },
      },
      business: {
        list: {
          title: 'طلبات توثيق الأعمال',
          subtitle: 'مراجعة طلبات توثيق الرخص التجارية',
          user: 'المستخدم',
          tradeName: 'الاسم التجاري',
          authority: 'جهة الإصدار',
          allAuthorities: 'كل الجهات',
          status: 'الحالة',
          submittedAt: 'تاريخ التقديم',
          empty: 'لا توجد طلبات',
          loadFailed: 'فشل تحميل الطلبات',
          userIdPlaceholder: 'معرف المستخدم',
        },
        details: {
          title: 'طلب توثيق نشاط تجاري',
          subtitle: 'مراجعة الرخصة التجارية واتخاذ القرار',
          backToList: 'العودة للطلبات',
          docLicense: 'الرخصة التجارية',
          docAuthorization: 'خطاب التفويض',
          events: 'سجل الأحداث',
          requestInfo: 'بيانات الطلب',
          legalName: 'الاسم القانوني',
          licenseNumber: 'رقم الرخصة',
          licenseExpiry: 'انتهاء الرخصة',
          possibleDuplicate: 'تنبيه: رقم الرخصة قد يكون مسجلاً لحساب آخر — تحقق قبل الموافقة',
          identityStatus: 'حالة توثيق الهوية',
          identityExpires: 'انتهاء توثيق الهوية',
          actions: 'الإجراءات',
          approve: 'موافقة',
          approveTitle: 'الموافقة على الطلب',
          approveHint: 'تحقق من البيانات على صورة الرخصة أولاً، ثم أكّد البيانات العامة التي ستظهر في الملف',
          licenseCheck: 'التحقق من توفر الرخصة',
          checkLicense: 'فحص الرخصة',
          licenseCheckFailed: 'فشل فحص الرخصة',
          licenseAvailable: 'الرخصة متاحة — غير موثقة لحساب آخر',
          licenseClaimed: 'الرخصة موثقة لحساب تجاري آخر',
          licenseClaimedUser: 'الحساب صاحب الرخصة',
          selectAuthority: 'اختر جهة الإصدار',
          authorityNameRequired: 'اسم جهة الإصدار (مطلوب للمناطق الحرة الأخرى)',
          legalNameFromDocument: 'الاسم القانوني كما في الرخصة',
          licenseNumberFromDocument: 'رقم الرخصة كما في المستند',
          authorityFromDocument: 'جهة الإصدار كما في الرخصة',
          authorityNameFromDocument: 'اسم جهة الإصدار كما في الرخصة',
          licenseExpiryFromDocument: 'تاريخ انتهاء الرخصة كما في المستند',
          licenseExpiryInvalid: 'التاريخ يجب أن يكون في المستقبل (بتوقيت دبي)',
          tradeNameConfirmed: 'الاسم التجاري (المعتمد للعرض)',
          businessKindConfirmed: 'نوع النشاط (المعتمد)',
          activityTypeConfirmed: 'مجال النشاط (المعتمد)',
          emirateConfirmed: 'الإمارة (المعتمدة)',
          emirateBlocked: 'اختيار الإمارة معطّل حتى تأكيد نقطة نهاية القوائم — الموافقة غير متاحة حالياً',
          internalNote: 'ملاحظة داخلية (لا تظهر للمستخدم)',
          requestMoreInfo: 'طلب معلومات إضافية',
          moreInfoTitle: 'طلب معلومات إضافية',
          moreInfoHint: 'سيُطلب من المستخدم تصحيح العناصر المحددة وإعادة التقديم',
          reject: 'رفض',
          rejectTitle: 'رفض الطلب',
          rejectHint: 'يمكن للمستخدم تقديم طلب جديد بعد الرفض',
          reasonCode: 'سبب القرار',
          selectReason: 'اختر السبب',
          missingItems: 'العناصر الناقصة',
          userMessage: 'رسالة للمستخدم (تظهر في التطبيق)',
          userMessagePlaceholder: 'اكتب رسالة واضحة ومحترمة للمستخدم...',
          approveSuccess: 'تمت الموافقة على الطلب بنجاح',
          moreInfoSuccess: 'تم إرسال طلب المعلومات الإضافية',
          rejectSuccess: 'تم رفض الطلب',
          revokeSuccess: 'تم إلغاء توثيق النشاط التجاري',
          revoke: 'إلغاء التوثيق',
          revokeWarning: 'يبقى حجز الرخصة قائماً بعد الإلغاء، ويعود الحساب لصلاحيات البيع الفردية ويفقد شارة التوثيق التجاري.',
          revokeConfirmTitle: 'إلغاء توثيق النشاط التجاري',
          revokeConfirmMessage: 'هل أنت متأكد من إلغاء توثيق هذا النشاط التجاري؟',
          loadFailed: 'فشل تحميل تفاصيل الطلب',
        },
        status: {
          draft: 'مسودة',
          pending: 'قيد المراجعة',
          more_info_required: 'بانتظار معلومات',
          approved: 'موثق',
          rejected: 'مرفوض',
          cancelled: 'ملغي',
          all: 'الكل',
        },
        reason: {
          license_unreadable: 'صورة الرخصة غير واضحة',
          license_expired: 'الرخصة منتهية الصلاحية',
          license_mismatch: 'بيانات الرخصة غير مطابقة',
          authority_mismatch: 'جهة الإصدار غير مطابقة',
          name_mismatch: 'الاسم غير مطابق',
          authorization_missing: 'خطاب التفويض مفقود',
          authorization_unreadable: 'خطاب التفويض غير واضح',
          not_authorized_person: 'المقدم غير مخول',
          document_tampered: 'المستند يبدو معدّلاً',
          policy_violation: 'مخالفة السياسات',
          other: 'أخرى',
        },
        missing: {
          license: 'الرخصة التجارية',
          authorization: 'خطاب التفويض',
          legal_name: 'الاسم القانوني',
          trade_name: 'الاسم التجاري',
          address: 'العنوان',
        },
        authority: {
          DED_DUBAI: 'اقتصادية دبي',
          ADDED: 'اقتصادية أبوظبي',
          SEDD_SHARJAH: 'اقتصادية الشارقة',
          DED_AJMAN: 'اقتصادية عجمان',
          DED_UAQ: 'اقتصادية أم القيوين',
          DED_RAK: 'اقتصادية رأس الخيمة',
          DED_FUJAIRAH: 'اقتصادية الفجيرة',
          DMCC: 'مركز دبي للسلع المتعددة',
          JAFZA: 'جبل علي (جافزا)',
          RAKEZ: 'راكز',
          OTHER_FREEZONE: 'منطقة حرة أخرى',
        },
        kind: {
          store: 'متجر',
          company: 'شركة',
        },
        activity: {
          jewelry_store: 'متجر مجوهرات',
          bullion_trading: 'تجارة سبائك',
          supplier: 'مورد',
          workshop: 'ورشة',
          other: 'أخرى',
        },
        days: {
          Monday: 'الاثنين',
          Tuesday: 'الثلاثاء',
          Wednesday: 'الأربعاء',
          Thursday: 'الخميس',
          Friday: 'الجمعة',
          Saturday: 'السبت',
          Sunday: 'الأحد',
        },
        closed: 'مغلق',
      },
      businessProfile: {
        title: 'الملف التجاري',
        subtitle: 'عرض وتعديل الملف العام للنشاط التجاري',
        notABusinessTitle: 'لا يوجد ملف تجاري',
        notABusinessMessage: 'هذا الحساب ليس حساباً تجارياً أو لم يكتمل ملفه التجاري بعد.',
        viewUserProfile: 'عرض ملف المستخدم',
        viewRequests: 'طلبات التوثيق',
        licenseEndingIn: 'رخصة تنتهي بـ',
        images: 'الصور',
        logo: 'الشعار',
        cover: 'صورة الغلاف',
        basicInfo: 'البيانات الأساسية',
        tradeName: 'الاسم التجاري',
        tradeNameAdminOnly: 'الاسم التجاري قابل للتعديل من الإدارة فقط',
        platform: 'المنصة',
        noSocialLinks: 'لا توجد روابط تواصل',
        noChanges: 'لا توجد تغييرات للحفظ',
        loadFailed: 'فشل تحميل الملف التجاري',
        saveSuccess: 'تم حفظ التعديلات بنجاح',
        saveFailed: 'فشل حفظ التعديلات',
        status: {
          verified: 'موثق',
          expired: 'منتهي',
          revoked: 'ملغى',
          unverified: 'غير موثق',
        },
      },
      userProfile: {
        title: 'ملف المستخدم',
        subtitle: 'الملف العام للمستخدم كما يظهر للإدارة',
        degradedNotice: 'هذا حساب تجاري لكن تعذر تحميل ملفه التجاري الكامل — تظهر البيانات الأساسية فقط.',
        ownerName: 'اسم المالك',
        identityExpiresOn: 'انتهاء توثيق الهوية',
        accountState: 'حالة الحساب',
        banned: 'محظور',
        viewActiveAds: 'إعلانات المستخدم النشطة',
        viewBusinessProfile: 'الملف التجاري',
        businessInfo: 'بيانات النشاط التجاري',
        tradeName: 'الاسم التجاري',
        businessKind: 'نوع النشاط',
        activityType: 'مجال النشاط',
        contactPhone: 'هاتف التواصل',
        contactEmail: 'بريد التواصل',
        website: 'الموقع الإلكتروني',
        address: 'العنوان',
        description: 'الوصف',
        socialLinks: 'روابط التواصل',
        workingHours: 'ساعات العمل',
        loadFailed: 'فشل تحميل ملف المستخدم',
      },
      userAds: {
        title: 'إعلانات المستخدم',
        subtitle: 'الإعلانات النشطة المعتمدة للمستخدم',
        backToProfile: 'العودة للملف',
        country: 'الدولة',
        scopeNote: 'تعرض هذه الصفحة الإعلانات النشطة المعتمدة فقط. لمراجعة كل الإعلانات استخدم صفحة إدارة الإعلانات.',
        empty: 'لا توجد إعلانات نشطة لهذا المستخدم',
        loadFailed: 'فشل تحميل إعلانات المستخدم',
      },
      contactMessages: {
        list: {
          title: 'رسائل تواصل معنا',
          subtitle: 'الرسائل المرسلة من نموذج تواصل معنا في الموقع',
          sender: 'المرسل',
          inquiryType: 'نوع الاستفسار',
          subject: 'الموضوع',
          status: 'الحالة',
          receivedAt: 'تاريخ الاستلام',
          empty: 'لا توجد رسائل',
          loadFailed: 'فشل تحميل الرسائل',
        },
        details: {
          title: 'رسالة',
          subtitle: 'تفاصيل رسالة التواصل ومتابعتها',
          backToList: 'العودة للرسائل',
          senderInfo: 'بيانات المرسل',
          fullName: 'الاسم الكامل',
          phone: 'الهاتف',
          email: 'البريد الإلكتروني',
          referenceNumber: 'رقم الإعلان المرجعي',
          updatedAt: 'آخر تحديث',
          manage: 'المتابعة',
          adminNotes: 'ملاحظات الإدارة',
          adminNotesPlaceholder: 'ملاحظات داخلية حول معالجة هذه الرسالة...',
          save: 'حفظ التغييرات',
          saveSuccess: 'تم تحديث الرسالة بنجاح',
          saveFailed: 'فشل تحديث الرسالة',
          delete: 'حذف الرسالة',
          deleteTitle: 'حذف هذه الرسالة؟',
          deleteWarning: 'سيتم حذف الرسالة نهائياً ولا يمكن استرجاعها.',
          deleteFailed: 'فشل حذف الرسالة',
          loadFailed: 'فشل تحميل الرسالة',
        },
        status: {
          all: 'الكل',
          new: 'جديدة',
          read: 'مقروءة',
          in_progress: 'قيد المعالجة',
          resolved: 'تم الحل',
          closed: 'مغلقة',
        },
      },
      adminInbox: {
        title: 'الإشعارات',
        empty: 'لا توجد إشعارات جديدة',
        markAllRead: 'تعليم الكل كمقروء',
        loadMore: 'عرض المزيد',
        justNow: 'الآن',
        minutesAgo: 'منذ {n} دقيقة',
        hoursAgo: 'منذ {n} ساعة',
        daysAgo: 'منذ {n} يوم',
        types: {
          new_ad_pending: 'إعلان',
          identity_submitted: 'توثيق هوية',
          business_submitted: 'توثيق تجاري',
          contact_message: 'تواصل',
        },
        pageSubtitle: 'كل الأحداث التي وصلتك: إعلانات وطلبات توثيق ورسائل تواصل',
        allTypes: 'كل الأنواع',
        unreadOnly: 'غير المقروءة فقط',
        emptyFiltered: 'لا توجد إشعارات تطابق هذا الفلتر',
        enableDesktop: 'تفعيل تنبيهات سطح المكتب',
        desktopBlocked: 'تنبيهات سطح المكتب محظورة من إعدادات المتصفح',
      },
      errors: {
        CATEGORY_HAS_SUBCATEGORIES: 'لا يمكن حذف هذه الفئة لأن لها فئات فرعية. احذف الفئات الفرعية أو انقلها أولاً.',
        CATEGORY_HAS_ADS: 'لا يمكن حذف هذه الفئة لأن لها إعلانات (بما فيها المحذوفة من أصحابها).',
        USER_IS_ADMIN: 'لا يمكن حذف حساب أدمن.',
        USER_HAS_ADS: 'لا يمكن حذف هذا المستخدم لأن له إعلانات. يمكنك تعطيل حسابه بدلاً من ذلك.',
        USER_HAS_COMMENTS: 'لا يمكن حذف هذا المستخدم لأن له تعليقات. يمكنك تعطيل حسابه بدلاً من ذلك.',
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
        changePassword: 'Change Password',
        posts: 'Posts & Ads',
        notifications: 'Notifications',
        adAttributes: 'Ad Attributes',
        identityVerification: 'Identity Verification',
        businessVerification: 'Business Verification',
        contactMessages: 'Contact Messages',
      },
      header: {
        search: 'Search in dashboard...',
        viewAll: 'View all',
        accountSettings: 'Account settings',
      },
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        refresh: 'Refresh',
        retry: 'Retry',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        previous: 'Previous',
        next: 'Next',
        firstPage: 'First page',
        lastPage: 'Last page',
        itemsPerPage: 'Items per page',
        showing: 'Showing',
        to: 'to',
        of: 'of',
        results: 'results',
        actions: 'Actions',
        saving: 'Saving',
        confirm: 'Confirm',
        errorTitle: 'Something went wrong',
        close: 'Close',
        date: 'Date',
        details: 'Details',
        select: 'Select',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
      },
      dashboard: {
        totalUsers: 'Total Users',
        totalPosts: 'Total Posts',
        activePosts: 'Active Posts',
        totalCategories: 'Total Categories',
        subtitle: 'Overview of platform performance and gold prices',
        goldPulse: 'Gold Price Pulse',
        gold24k: '24K Gold',
        pulsePeriod: 'Last 30 days',
        pulseUp: 'Uptrend',
        pulseDown: 'Downtrend',
        pulseStable: 'Stable',
        goldChart: 'Gold Price Chart',
        goldChartHint: 'Price per gram in local currency over time',
        karat: 'Karat',
        pricesLoadError: 'Could not load price data',
        periodFallback: '3-month data is currently unavailable from the server — showing the last month',
        high: 'High',
        low: 'Low',
        average: 'Average',
        pendingReview: 'Pending Review',
        pendingReviewHint: 'Ads awaiting your approval',
        noPending: 'No ads pending review',
        recentPosts: 'Recent Ads',
        recentPostsHint: 'Latest ads added to the platform',
        viewAll: 'View All',
        noPosts: 'No ads yet',
        needsAttention: 'Needs your attention',
        needsAttentionHint: 'Requests waiting for your action',
        attentionAds: 'Ads pending review',
        attentionIdentity: 'Identity verification requests',
        attentionBusiness: 'Business account requests',
        attentionContact: 'New contact messages',
        activityChart: 'Platform activity',
        activityChartHint: 'New users and new ads per day — last 30 days (Dubai time)',
        newUsers: 'New users',
        newAds: 'New ads',
        statsLoadError: 'Could not load statistics',
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
        confirmDeleteTitle: 'Delete Category',
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
        uploadImage: 'Upload image',
        uploading: 'Uploading...',
        changeImage: 'Change image',
        removeImage: 'Remove image',
        imageHint: 'PNG, JPG or GIF (max 5MB)',
        imageTypeError: 'Unsupported file type. Choose a PNG, JPG or GIF image',
        imageSizeError: 'Image exceeds the maximum allowed size (5MB)',
        noParent: 'None - main category',
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
        confirmDeleteTitle: 'Delete Post',
        approve: 'Approve',
        reject: 'Reject',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        allStatus: 'All statuses',
        deletedByOwner: 'Deleted',
        post: 'Post',
        seller: 'Seller',
        reviewStatus: 'Review Status',
        viewDetails: 'View Details',
        category: 'Category',
        location: 'Location',
        confirmApprove: 'Are you sure you want to approve this post?',
        confirmApproveTitle: 'Approve Post',
        confirmRejectTitle: 'Reject Post',
        rejectReason: 'Rejection reason',
        rejectReasonPlaceholder: 'Enter the rejection reason...',
        rejectReasonInvalid: 'Rejection reason is required (1–500 characters)',
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
        image: 'Image',
        sellerBusiness: 'Business',
        sellerIndividual: 'Individual',
        identityVerified: 'Identity verified',
        businessVerified: 'Business verified',
        priceMarket: 'Market price',
        priceContact: 'Contact for price',
        countryFilter: 'Country',
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
        confirmDeleteTitle: 'Delete User',
        cannotDeleteSelf: 'You cannot delete your own account',
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
        accountType: 'Account type',
        allAccountTypes: 'All account types',
        accountIndividual: 'Individual',
        accountBusiness: 'Business',
        identityStatus: 'Identity status',
        allIdentityStatuses: 'All identity statuses',
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
        currentPrices: 'Current Prices',
        perGram: 'Per Gram',
        perToz: 'Per Ounce',
        byCarat: 'By Carat',
        lastUpdated: 'Last Updated',
        scheduleTitle: 'Daily Notification Schedule',
        scheduleTime: 'Time',
        scheduleCron: 'Cron Expression',
        scheduleAudience: 'Audience',
        scheduleSource: 'Data Source',
        previewTitle: 'Notification Preview',
        confirmSendTitle: 'Send Daily Notification',
        confirmSendDaily: 'Are you sure you want to send the metals prices notification to all users now?',
      },
      notifications: {
        title: 'Notifications',
        subtitle: 'Manage notifications sent to users',
        sendNotification: 'Send New Notification',
        sendNotificationSubtitle: 'Send multi-language notification to all users',
        noNotifications: 'No notifications found',
        confirmDelete: 'Are you sure you want to delete this notification?',
        confirmDeleteTitle: 'Delete Notification',
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
      settings: {
        title: 'Settings',
        subtitle: 'Manage system settings',
        currency: 'Default Display Currency',
        currencyHint: 'This currency is used as a fallback when no currency is specified in the data.',
        save: 'Save',
        saveSuccess: 'Settings saved successfully',
        saveError: 'Failed to save settings. Please try again.',
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
        slogan: 'From gold ingots to mining equipment… everything in one place.',
        forgot: {
          title: 'Forgot Password',
          subtitle: 'Enter your phone number and we will send you a verification code to reset your password.',
          sendOtp: 'Send verification code',
          sending: 'Sending...',
          phoneRequired: 'Phone number is required',
          phoneInvalid: 'Invalid phone number',
          sendError: 'Failed to send verification code. Please try again.',
          rememberedPassword: 'Remembered your password?',
        },
        reset: {
          title: 'Reset Password',
          subtitle: 'Enter the verification code sent to',
          otpLabel: 'Verification code',
          otpInvalid: 'Verification code must be 6 digits',
          didntReceive: "Didn't receive the code?",
          resend: 'Resend',
          resendIn: 'Resend in',
          newPassword: 'New password',
          confirmPassword: 'Confirm password',
          passwordHint: 'Must be at least 6 characters',
          passwordTooShort: 'Password is too short (minimum 6 characters)',
          passwordMismatch: 'Passwords do not match',
          resetButton: 'Reset password',
          resetting: 'Resetting...',
          resetError: 'Failed to reset password. Check the code and try again.',
        },
        change: {
          title: 'Change Password',
          subtitle: 'Update your admin account password',
          currentPassword: 'Current password',
          newPassword: 'New password',
          confirmPassword: 'Confirm new password',
          submit: 'Save password',
          fillRequired: 'Please fill all required fields',
          sameAsCurrent: 'New password must be different from the current one',
          success: 'Password changed successfully',
          error: 'Failed to change password. Check your current password.',
        },
        notAdmin: 'This account is not an admin account',
      },
      lookup: {
        unavailable: 'Currently unavailable',
        blockedHint: 'Disabled until the countries/emirates lookup endpoint is confirmed by the backend',
      },
      uploader: {
        hint: 'PNG, JPG or GIF (max 5 MB)',
        removeImage: 'Remove image',
        uploadFailed: 'Image upload failed. Try again.',
        uploaded: 'Image uploaded',
        uploading: 'Uploading image...',
        chooseImage: 'Choose image',
        changeImage: 'Change image',
        invalidType: 'Unsupported file type. Choose a PNG, JPG or GIF image',
        tooLarge: 'The image exceeds the allowed size (5 MB)',
      },
      docViewer: {
        refresh: 'Refresh link',
        missing: 'No document',
        expired: 'Temporary link expired',
        loadFailed: 'Could not load the document',
      },
      apiErrors: {
        attributeCodeExists: 'This attribute code is already in use',
        attributeHasValues: 'Cannot delete the attribute because it has values',
        attributeInvalidOption: 'The selected option is invalid for this attribute',
        parentAttributeNotAssigned: 'The parent attribute is not assigned to this category',
        attributeHasDependents: 'Cannot deactivate: other attributes depend on it',
        idExpired: 'ID expiry date must be in the future',
        identityAlreadyClaimed: 'This ID number is already verified for another account',
        identityRevokedContactSupport: 'Identity verification was revoked — contact support',
        licenseExpired: 'License expiry date must be in the future',
        businessLicenseAlreadyClaimed: 'This license is already verified for another business account',
        notABusinessProfile: 'This account is not a business account',
        unknown: 'An unexpected error occurred',
      },
      attributes: {
        title: 'Ad Attributes',
        subtitle: 'Manage ad attributes, their options, and category mappings',
        tabDefinitions: 'Definitions',
        tabOptions: 'Options',
        tabMappings: 'Category Mappings',
        addAttribute: 'Add attribute',
        editAttribute: 'Edit attribute',
        empty: 'No attributes yet',
        definitionsHint: 'The code cannot be changed after creation',
        nameAr: 'Arabic name',
        nameEn: 'English name',
        code: 'Code',
        codeImmutable: 'The code cannot be edited after creation',
        dataType: 'Data type',
        dataTypes: {
          select: 'Select list',
          number: 'Number',
          text: 'Text',
          boolean: 'Yes/No',
        },
        unit: 'Unit',
        unitAr: 'Unit (Arabic)',
        unitEn: 'Unit (English)',
        minValue: 'Minimum value',
        maxValue: 'Maximum value',
        minMaxInvalid: 'Minimum must be less than or equal to maximum',
        decimalPlaces: 'Decimal places',
        dependsOn: 'Depends on attribute',
        dependsOnHint: 'For cascading selects only (optional)',
        noDependency: 'No dependency',
        deactivate: 'Deactivate',
        deactivateTitle: 'Deactivate attribute',
        deactivateMessage: 'The attribute will not appear in new ads. Existing ads are not affected.',
        reactivate: 'Reactivate',
      },
      options: {
        chooseAttribute: 'Choose an attribute to view its options',
        selectAttribute: 'Select attribute',
        noSelectAttributes: 'No select-type attributes exist',
        empty: 'No options for this attribute',
        count: 'Options count',
        addOption: 'Add option',
        editOption: 'Edit option',
        saveOrder: 'Save order',
        labelAr: 'Arabic label',
        labelEn: 'English label',
        code: 'Code',
        sortOrder: 'Sort order',
        parentOption: 'Parent option',
        chooseParentOption: 'Choose a parent option (optional)',
        dependentHint: 'For cascading selects: pick a parent option from the linked attribute',
        moveUp: 'Move up',
        moveDown: 'Move down',
        deactivate: 'Deactivate',
        deactivateTitle: 'Deactivate option',
        deactivateMessage: 'This option will not appear when creating new ads.',
        reactivate: 'Reactivate',
      },
      mappings: {
        assignTitle: 'Assign attribute to subcategory',
        assign: 'Assign',
        chooseSubcategory: 'Choose subcategory',
        selectSubcategory: 'Select a subcategory',
        subcategoriesOnly: 'Mapping is available for subcategories only',
        chooseAttribute: 'Choose attribute',
        attribute: 'Attribute',
        isRequired: 'Required',
        requiredWarning: 'Making this required may prevent the mobile app from posting ads in this category until it is updated',
        isFilterable: 'Filterable',
        textNotFilterable: 'Text attributes cannot be filterable',
        showInCard: 'Show in card',
        sortOrder: 'Sort order',
        empty: 'No attributes mapped to this category',
        parentNotAssignedWarning: 'Warning: the attribute this one depends on is not assigned to this category',
        unassign: 'Unassign',
        unassignTitle: 'Unassign attribute',
        unassignMessage: 'Are you sure you want to unassign this attribute from the category?',
        unassignNote: 'Values stored on existing ads are not deleted.',
      },
      postDetails: {
        title: 'Ad Details',
        subtitle: 'Full view of the ad and its status',
        backToList: 'Back to list',
        images: 'Images',
        noImages: 'This ad has no images',
        attributes: 'Attributes',
        statusTitle: 'Status',
        reviewedAt: 'Reviewed at',
        inactiveReason: 'Inactive reason',
        endDate: 'End date',
        deletedAt: 'Deleted at',
        classification: 'Classification',
        address: 'Address',
        owner: 'Owner',
        viewOwnerProfile: 'View owner profile',
      },
      identity: {
        list: {
          title: 'Identity Verification Requests',
          subtitle: 'Review Emirates ID verification requests',
          user: 'User',
          idNumber: 'ID number',
          status: 'Status',
          submittedAt: 'Submitted',
          empty: 'No requests',
          loadFailed: 'Failed to load requests',
          userIdPlaceholder: 'User ID',
        },
        details: {
          title: 'Identity Request',
          subtitle: 'Review documents and decide',
          backToList: 'Back to requests',
          docFront: 'ID — front side',
          docBack: 'ID — back side',
          docSelfie: 'Selfie',
          events: 'Audit trail',
          requestInfo: 'Request info',
          fullNameOnId: 'Full name on ID',
          idExpiry: 'ID expiry',
          possibleDuplicate: 'Warning: this ID number may be claimed by another account — verify before approving',
          actions: 'Actions',
          approve: 'Approve',
          approveTitle: 'Approve request',
          approveHint: 'Enter the data as read from the document image (not from the user input)',
          idNumberFromDocument: 'ID number from document',
          idNumberPlaceholder: '784-XXXX-XXXXXXX-X',
          idNumberInvalid: 'The ID number must be 15 digits after normalization',
          idExpiryFromDocument: 'ID expiry date from document',
          idExpiryInvalid: 'The date must be in the future (Dubai time)',
          internalNote: 'Internal note (never shown to the user)',
          requestMoreInfo: 'Request more info',
          moreInfoTitle: 'Request more info',
          moreInfoHint: 'The user will be asked to re-capture the flagged documents and resubmit',
          reject: 'Reject',
          rejectTitle: 'Reject request',
          rejectHint: 'The user can submit a new request afterwards',
          reasonCode: 'Reason',
          selectReason: 'Select a reason',
          missingItems: 'Missing items',
          userMessage: 'Message to user (shown in the app)',
          userMessagePlaceholder: 'Write a clear, respectful message...',
          approveSuccess: 'Request approved successfully',
          moreInfoSuccess: 'More-info request sent',
          rejectSuccess: 'Request rejected',
          revokeSuccess: 'Identity verification revoked',
          revoke: 'Revoke verification',
          revokeWarning: 'The identity claim stays reserved after revocation — the same ID cannot be used by another account (fraud protection), and the user cannot self-serve a new request.',
          revokeConfirmTitle: 'Revoke identity verification',
          revokeConfirmMessage: 'Are you sure you want to revoke this user\'s identity verification? The ID claim stays reserved.',
          loadFailed: 'Failed to load request details',
        },
        status: {
          draft: 'Draft',
          pending: 'Pending',
          more_info_required: 'More info required',
          approved: 'Verified',
          rejected: 'Rejected',
          cancelled: 'Cancelled',
          unverified: 'Unverified',
          verified: 'Verified',
          expired: 'Expired',
          revoked: 'Revoked',
          all: 'All',
        },
        reason: {
          id_front_unreadable: 'ID front side unreadable',
          id_back_unreadable: 'ID back side unreadable',
          selfie_mismatch: 'Selfie does not match the ID photo',
          selfie_unreadable: 'Selfie unreadable',
          id_expired: 'ID expired',
          id_not_uae: 'ID is not a UAE ID',
          name_mismatch: 'Name mismatch',
          photo_mismatch: 'Photo mismatch',
          document_tampered: 'Document appears tampered',
          policy_violation: 'Policy violation',
          other: 'Other',
        },
        missing: {
          id_front: 'ID front',
          id_back: 'ID back',
          selfie: 'Selfie',
        },
        event: {
          submitted: 'Submitted',
          resubmitted: 'Resubmitted',
          more_info_requested: 'More info requested',
          approved: 'Approved',
          rejected: 'Rejected',
          revoked: 'Verification revoked',
          cancelled: 'Cancelled',
        },
      },
      business: {
        list: {
          title: 'Business Verification Requests',
          subtitle: 'Review trade license verification requests',
          user: 'User',
          tradeName: 'Trade name',
          authority: 'Authority',
          allAuthorities: 'All authorities',
          status: 'Status',
          submittedAt: 'Submitted',
          empty: 'No requests',
          loadFailed: 'Failed to load requests',
          userIdPlaceholder: 'User ID',
        },
        details: {
          title: 'Business Request',
          subtitle: 'Review the trade license and decide',
          backToList: 'Back to requests',
          docLicense: 'Trade license',
          docAuthorization: 'Authorization letter',
          events: 'Audit trail',
          requestInfo: 'Request info',
          legalName: 'Legal name',
          licenseNumber: 'License number',
          licenseExpiry: 'License expiry',
          possibleDuplicate: 'Warning: this license number may be claimed by another account — verify before approving',
          identityStatus: 'Identity status',
          identityExpires: 'Identity expires',
          actions: 'Actions',
          approve: 'Approve',
          approveTitle: 'Approve request',
          approveHint: 'Verify the data on the license image first, then confirm the public fields shown on the profile',
          licenseCheck: 'License availability check',
          checkLicense: 'Check license',
          licenseCheckFailed: 'License check failed',
          licenseAvailable: 'License is available — not claimed by another account',
          licenseClaimed: 'License is already claimed by another business account',
          licenseClaimedUser: 'License owner account',
          selectAuthority: 'Select authority',
          authorityNameRequired: 'Authority name (required for other free zones)',
          legalNameFromDocument: 'Legal name from document',
          licenseNumberFromDocument: 'License number from document',
          authorityFromDocument: 'Authority from document',
          authorityNameFromDocument: 'Authority name from document',
          licenseExpiryFromDocument: 'License expiry from document',
          licenseExpiryInvalid: 'The date must be in the future (Dubai time)',
          tradeNameConfirmed: 'Trade name (confirmed)',
          businessKindConfirmed: 'Business kind (confirmed)',
          activityTypeConfirmed: 'Activity type (confirmed)',
          emirateConfirmed: 'Emirate (confirmed)',
          emirateBlocked: 'Emirate selection is disabled until the lookup endpoint is confirmed — approval is currently unavailable',
          internalNote: 'Internal note (never shown to the user)',
          requestMoreInfo: 'Request more info',
          moreInfoTitle: 'Request more info',
          moreInfoHint: 'The user will be asked to correct the flagged items and resubmit',
          reject: 'Reject',
          rejectTitle: 'Reject request',
          rejectHint: 'The user can submit a new application afterwards',
          reasonCode: 'Reason',
          selectReason: 'Select a reason',
          missingItems: 'Missing items',
          userMessage: 'Message to user (shown in the app)',
          userMessagePlaceholder: 'Write a clear, respectful message...',
          approveSuccess: 'Request approved successfully',
          moreInfoSuccess: 'More-info request sent',
          rejectSuccess: 'Request rejected',
          revokeSuccess: 'Business verification revoked',
          revoke: 'Revoke verification',
          revokeWarning: 'The license claim stays reserved after revocation. The account falls back to individual selling privileges and loses the business badge.',
          revokeConfirmTitle: 'Revoke business verification',
          revokeConfirmMessage: 'Are you sure you want to revoke this business verification?',
          loadFailed: 'Failed to load request details',
        },
        status: {
          draft: 'Draft',
          pending: 'Pending',
          more_info_required: 'More info required',
          approved: 'Verified',
          rejected: 'Rejected',
          cancelled: 'Cancelled',
          all: 'All',
        },
        reason: {
          license_unreadable: 'License image unreadable',
          license_expired: 'License expired',
          license_mismatch: 'License data mismatch',
          authority_mismatch: 'Authority mismatch',
          name_mismatch: 'Name mismatch',
          authorization_missing: 'Authorization letter missing',
          authorization_unreadable: 'Authorization letter unreadable',
          not_authorized_person: 'Applicant is not an authorized person',
          document_tampered: 'Document appears tampered',
          policy_violation: 'Policy violation',
          other: 'Other',
        },
        missing: {
          license: 'Trade license',
          authorization: 'Authorization letter',
          legal_name: 'Legal name',
          trade_name: 'Trade name',
          address: 'Address',
        },
        authority: {
          DED_DUBAI: 'Dubai DED',
          ADDED: 'Abu Dhabi DED',
          SEDD_SHARJAH: 'Sharjah DED',
          DED_AJMAN: 'Ajman DED',
          DED_UAQ: 'Umm Al Quwain DED',
          DED_RAK: 'Ras Al Khaimah DED',
          DED_FUJAIRAH: 'Fujairah DED',
          DMCC: 'DMCC',
          JAFZA: 'JAFZA',
          RAKEZ: 'RAKEZ',
          OTHER_FREEZONE: 'Other free zone',
        },
        kind: {
          store: 'Store',
          company: 'Company',
        },
        activity: {
          jewelry_store: 'Jewelry store',
          bullion_trading: 'Bullion trading',
          supplier: 'Supplier',
          workshop: 'Workshop',
          other: 'Other',
        },
        days: {
          Monday: 'Monday',
          Tuesday: 'Tuesday',
          Wednesday: 'Wednesday',
          Thursday: 'Thursday',
          Friday: 'Friday',
          Saturday: 'Saturday',
          Sunday: 'Sunday',
        },
        closed: 'Closed',
      },
      businessProfile: {
        title: 'Business Profile',
        subtitle: 'View and edit the public business profile',
        notABusinessTitle: 'No business profile',
        notABusinessMessage: 'This account is not a business account or its business profile is not set up yet.',
        viewUserProfile: 'View user profile',
        viewRequests: 'Verification requests',
        licenseEndingIn: 'License ending in',
        images: 'Images',
        logo: 'Logo',
        cover: 'Cover image',
        basicInfo: 'Basic info',
        tradeName: 'Trade name',
        tradeNameAdminOnly: 'Trade name is editable by admins only',
        platform: 'Platform',
        noSocialLinks: 'No social links',
        noChanges: 'No changes to save',
        loadFailed: 'Failed to load the business profile',
        saveSuccess: 'Changes saved successfully',
        saveFailed: 'Failed to save changes',
        status: {
          verified: 'Verified',
          expired: 'Expired',
          revoked: 'Revoked',
          unverified: 'Unverified',
        },
      },
      userProfile: {
        title: 'User Profile',
        subtitle: 'The user public profile as seen by admins',
        degradedNotice: 'This is a business account but its full business profile could not be loaded — basic data is shown only.',
        ownerName: 'Owner name',
        identityExpiresOn: 'Identity expiry',
        accountState: 'Account state',
        banned: 'Banned',
        viewActiveAds: 'User active ads',
        viewBusinessProfile: 'Business profile',
        businessInfo: 'Business info',
        tradeName: 'Trade name',
        businessKind: 'Business kind',
        activityType: 'Activity type',
        contactPhone: 'Contact phone',
        contactEmail: 'Contact email',
        website: 'Website',
        address: 'Address',
        description: 'Description',
        socialLinks: 'Social links',
        workingHours: 'Working hours',
        loadFailed: 'Failed to load the user profile',
      },
      userAds: {
        title: 'User Ads',
        subtitle: 'The user\'s active approved ads',
        backToProfile: 'Back to profile',
        country: 'Country',
        scopeNote: 'This page shows active approved ads only. Use the ads management page for full moderation.',
        empty: 'No active ads for this user',
        loadFailed: 'Failed to load user ads',
      },
      contactMessages: {
        list: {
          title: 'Contact Messages',
          subtitle: 'Messages submitted through the website contact form',
          sender: 'Sender',
          inquiryType: 'Inquiry type',
          subject: 'Subject',
          status: 'Status',
          receivedAt: 'Received at',
          empty: 'No messages found',
          loadFailed: 'Failed to load messages',
        },
        details: {
          title: 'Message',
          subtitle: 'Contact message details and follow-up',
          backToList: 'Back to messages',
          senderInfo: 'Sender information',
          fullName: 'Full name',
          phone: 'Phone',
          email: 'Email',
          referenceNumber: 'Reference listing ID',
          updatedAt: 'Last updated',
          manage: 'Follow-up',
          adminNotes: 'Admin notes',
          adminNotesPlaceholder: 'Internal notes about handling this message...',
          save: 'Save changes',
          saveSuccess: 'Message updated successfully',
          saveFailed: 'Failed to update message',
          delete: 'Delete message',
          deleteTitle: 'Delete this message?',
          deleteWarning: 'The message will be permanently deleted and cannot be recovered.',
          deleteFailed: 'Failed to delete message',
          loadFailed: 'Failed to load message',
        },
        status: {
          all: 'All',
          new: 'New',
          read: 'Read',
          in_progress: 'In progress',
          resolved: 'Resolved',
          closed: 'Closed',
        },
      },
      adminInbox: {
        title: 'Notifications',
        empty: 'No new notifications',
        markAllRead: 'Mark all as read',
        loadMore: 'Load more',
        justNow: 'Just now',
        minutesAgo: '{n} min ago',
        hoursAgo: '{n} h ago',
        daysAgo: '{n} d ago',
        types: {
          new_ad_pending: 'Ad',
          identity_submitted: 'Identity',
          business_submitted: 'Business',
          contact_message: 'Contact',
        },
        pageSubtitle: 'Everything that reached you: ads, verification requests and contact messages',
        allTypes: 'All types',
        unreadOnly: 'Unread only',
        emptyFiltered: 'No notifications match this filter',
        enableDesktop: 'Enable desktop alerts',
        desktopBlocked: 'Desktop alerts are blocked in your browser settings',
      },
      errors: {
        CATEGORY_HAS_SUBCATEGORIES: 'This category has subcategories. Delete or move them first.',
        CATEGORY_HAS_ADS: 'This category has ads (including ones deleted by their owners), so it cannot be deleted.',
        USER_IS_ADMIN: 'Admin accounts cannot be deleted.',
        USER_HAS_ADS: 'This user has ads, so the account cannot be deleted. You can deactivate it instead.',
        USER_HAS_COMMENTS: 'This user has comments, so the account cannot be deleted. You can deactivate it instead.',
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

  /** Translates a server error code via `errors.*`, falling back to the server's own message. */
  translateApiError(message: string): string {
    return this.translations[this.currentLanguage$.value].errors?.[message] || message;
  }

  // Get all translations for current language
  getTranslations(): TranslationKeys {
    return this.translations[this.currentLanguage$.value];
  }
}

