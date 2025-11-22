# Backend Integration - Gold Market Admin

## ✅ تم إكمال التكامل

تم ربط الـ Frontend مع الـ Backend بنجاح. هذا الملف يشرح البنية والاستخدام.

## 📁 البنية (Architecture)

### 1. Environment Configuration
```
src/environments/
├── environment.ts          # Development config
└── environment.prod.ts    # Production config
```

### 2. API Infrastructure
```
src/app/shared/
├── services/
│   ├── api/
│   │   ├── api-config.service.ts      # API base URLs & endpoints
│   │   └── error-handler.service.ts   # Global error handling
│   ├── auth/
│   │   ├── auth.service.ts            # Authentication logic
│   │   └── token-storage.service.ts   # Token & user storage
│   └── data/
│       ├── categories.service.ts       # Categories CRUD
│       ├── posts-ads.service.ts       # Posts/Ads management
│       ├── users.service.ts           # Users management
│       ├── metals-prices.service.ts   # Metals prices & notifications
│       └── notifications.service.ts  # Push notifications
├── interceptors/
│   ├── auth.interceptor.ts            # JWT token injection
│   └── error.interceptor.ts           # Global error handling
└── guards/
    └── auth.guard.ts                  # Route protection
```

## 🔐 Authentication

### Login Example
```typescript
import { AuthService } from './shared/services/auth/auth.service';

constructor(private authService: AuthService) {}

login() {
  this.authService.login({
    phoneNumber: '1234567890',
    password: 'password123'
  }).subscribe({
    next: (response) => {
      if (response.status === 'success') {
        // User logged in, token saved automatically
        console.log('User:', response.data);
      }
    },
    error: (error) => {
      console.error('Login failed:', error);
    }
  });
}
```

### Logout
```typescript
this.authService.logout(); // Clears token and redirects to login
```

### Check Authentication
```typescript
if (this.authService.isAuthenticated()) {
  // User is logged in
}

if (this.authService.isAdmin()) {
  // User is admin
}
```

## 📊 Data Services

### Categories Service
```typescript
import { CategoriesService } from './shared/services/data/categories.service';

// List categories
this.categoriesService.listCategories({
  page: 1,
  limit: 20,
  langCode: 'ar' // or 'en'
}).subscribe(response => {
  console.log(response.data.categories);
});

// Create category
this.categoriesService.createCategory({
  name_en: 'Gold',
  name_ar: 'ذهب',
  image_url: 'https://...'
}).subscribe(response => {
  console.log('Created:', response.data);
});
```

### Posts/Ads Service
```typescript
import { PostsAdsService } from './shared/services/data/posts-ads.service';

// List posts with filters
this.postsAdsService.listPosts({
  page: 1,
  limit: 20,
  langCode: 'ar',
  status: 'active', // 'active' | 'inactive' | 'all'
  categoryId: 1,
  countryId: 1
}).subscribe(response => {
  console.log(response.data.posts);
});

// Update post
this.postsAdsService.updatePost({
  postAdsId: 1,
  isActive: true,
  isFeatured: false
}).subscribe(response => {
  console.log('Updated:', response.data);
});
```

### Users Service
```typescript
import { UsersService } from './shared/services/data/users.service';

// List users
this.usersService.listUsers({
  page: 1,
  limit: 20,
  status: 'all',
  verified: true,
  searchTerm: 'John'
}).subscribe(response => {
  console.log(response.data.users);
});
```

### Metals Prices Service
```typescript
import { MetalsPricesService } from './shared/services/data/metals-prices.service';

// Get latest prices
this.metalsPricesService.getLatestPrices().subscribe(response => {
  console.log('Gold:', response.data.gold);
  console.log('Silver:', response.data.silver);
});

// Get historical prices
this.metalsPricesService.getHistoricalPrices({
  period: '7d', // '7d' | '1m' | '3m'
  country: 'SD'
}).subscribe(response => {
  console.log(response.data.prices);
});

// Trigger daily notification
this.metalsPricesService.triggerDailyNotification().subscribe(response => {
  console.log('Notification sent:', response.data);
});
```

### Notifications Service
```typescript
import { NotificationsService } from './shared/services/data/notifications.service';

// Send notification
this.notificationsService.sendNotification({
  title_ar: 'عنوان بالعربية',
  title_en: 'Title in English',
  message_ar: 'رسالة بالعربية',
  message_en: 'Message in English'
}).subscribe(response => {
  console.log('Sent:', response.data);
});

// List notifications
this.notificationsService.listNotifications().subscribe(response => {
  console.log(response.data.notifications);
});
```

## 🛡️ Route Protection

Routes are automatically protected with `authGuard`:

```typescript
// app.routes.ts
{
  path: '',
  component: AppLayoutComponent,
  canActivate: [authGuard], // ✅ Protected
  children: [...]
}
```

Unauthenticated users are redirected to `/signin`.

## 🔧 Error Handling

### Global Error Handling
Errors are automatically handled by interceptors:
- **401 Unauthorized**: Token cleared, redirect to login
- **403 Forbidden**: Admin access required
- **Other errors**: Re-thrown for component-level handling

### Component-Level Error Handling
```typescript
import { ErrorHandlerService } from './shared/services/api/error-handler.service';

this.service.someMethod().subscribe({
  next: (response) => {
    // Success
  },
  error: (error) => {
    const apiError = this.errorHandler.handleError(error);
    console.error(apiError.message); // User-friendly message
  }
});
```

## 📝 API Response Format

All API responses follow this structure:

```typescript
{
  message: "success",
  status: "success",
  data: {
    // Response data
  }
}
```

## 🔑 Environment Variables

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3005/GoldSouqAPIs/api',
  apiTimeout: 30000
};
```

## 📚 Next Steps

1. ✅ Infrastructure Layer - Complete
2. ✅ Authentication - Complete
3. ✅ Data Services - Complete
4. ⏭️ Create UI Components for each service
5. ⏭️ Implement forms and tables
6. ⏭️ Add loading states and error messages
7. ⏭️ Integrate with existing dashboard pages

## 🎯 Usage Tips

1. **Always use services** - Don't call HTTP directly
2. **Handle errors** - Use ErrorHandlerService for user-friendly messages
3. **Check authentication** - Use AuthService methods
4. **Language support** - Pass `langCode: 'ar' | 'en'` in requests
5. **Pagination** - Use `page` and `limit` for list endpoints

---

**تم إنشاء جميع الـ Services والـ Infrastructure بنجاح! 🎉**

