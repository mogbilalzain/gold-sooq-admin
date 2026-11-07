import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CategoryFormComponent } from './pages/categories/category-form/category-form.component';
import { PostsAdsComponent } from './pages/posts-ads/posts-ads.component';
import { PostFormComponent } from './pages/posts-ads/post-form/post-form.component';
import { UsersComponent } from './pages/users/users.component';
import { UserFormComponent } from './pages/users/user-form/user-form.component';
import { MetalsPricesComponent } from './pages/metals-prices/metals-prices.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { NotificationFormComponent } from './pages/notifications/notification-form/notification-form.component';
import { ForgotPasswordComponent } from './pages/auth-pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth-pages/reset-password/reset-password.component';
import { ChangePasswordComponent } from './pages/auth-pages/change-password/change-password.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AdAttributesComponent } from './pages/ad-attributes/ad-attributes.component';
import { PostDetailsComponent } from './pages/posts-ads/post-details/post-details.component';
import { UserProfileComponent } from './pages/users/user-profile/user-profile.component';
import { UserAdsComponent } from './pages/users/user-ads/user-ads.component';
import { IdentityRequestsComponent } from './pages/identity-requests/identity-requests.component';
import { IdentityRequestDetailsComponent } from './pages/identity-requests/identity-request-details/identity-request-details.component';
import { BusinessRequestsComponent } from './pages/business-requests/business-requests.component';
import { BusinessRequestDetailsComponent } from './pages/business-requests/business-request-details/business-request-details.component';
import { BusinessProfileComponent } from './pages/business-profiles/business-profile/business-profile.component';
import { ContactMessagesComponent } from './pages/contact-messages/contact-messages.component';
import { ContactMessageDetailsComponent } from './pages/contact-messages/contact-message-details/contact-message-details.component';
import { AdminInboxComponent } from './pages/admin-inbox/admin-inbox.component';
import { SiteAnalyticsComponent } from './pages/site-analytics/site-analytics.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path:'',
    component:AppLayoutComponent,
    canActivate: [authGuard],
    children:[
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title:
          'Angular Ecommerce Dashboard | TailAdmin - Angular Admin Dashboard Template',
      },
      {
        path:'calendar',
        component:CalenderComponent,
        title:'Angular Calender | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'profile',
        component:ProfileComponent,
        title:'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'form-elements',
        component:FormElementsComponent,
        title:'Angular Form Elements Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'basic-tables',
        component:BasicTablesComponent,
        title:'Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'blank',
        component:BlankComponent,
        title:'Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      // support tickets
      {
        path:'invoice',
        component:InvoicesComponent,
        title:'Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'line-chart',
        component:LineChartComponent,
        title:'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'bar-chart',
        component:BarChartComponent,
        title:'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'alerts',
        component:AlertsComponent,
        title:'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'avatars',
        component:AvatarElementComponent,
        title:'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'badge',
        component:BadgesComponent,
        title:'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'buttons',
        component:ButtonsComponent,
        title:'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'images',
        component:ImagesComponent,
        title:'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'videos',
        component:VideosComponent,
        title:'Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'categories',
        component:CategoriesComponent,
        title:'Categories Management | Gold Market Admin'
      },
      {
        path:'categories/add',
        component:CategoryFormComponent,
        title:'Add Category | Gold Market Admin'
      },
      {
        path:'categories/edit/:id',
        component:CategoryFormComponent,
        title:'Edit Category | Gold Market Admin'
      },
      {
        path:'posts-ads',
        component:PostsAdsComponent,
        title:'Posts & Ads Management | Gold Market Admin'
      },
      {
        path:'posts-ads/edit/:id',
        component:PostFormComponent,
        title:'Edit Post | Gold Market Admin'
      },
      {
        path:'posts-ads/:id',
        component:PostDetailsComponent,
        title:'Ad Details | Gold Market Admin'
      },
      {
        path:'ad-attributes',
        component:AdAttributesComponent,
        title:'Ad Attributes | Gold Market Admin'
      },
      {
        path:'users',
        component:UsersComponent,
        title:'Users Management | Gold Market Admin'
      },
      {
        path:'users/edit/:id',
        component:UserFormComponent,
        title:'Edit User | Gold Market Admin'
      },
      {
        path:'users/:id/ads',
        component:UserAdsComponent,
        title:'User Ads | Gold Market Admin'
      },
      {
        path:'users/:id',
        component:UserProfileComponent,
        title:'User Profile | Gold Market Admin'
      },
      {
        path:'identity-requests',
        component:IdentityRequestsComponent,
        title:'Identity Verification | Gold Market Admin'
      },
      {
        path:'identity-requests/:id',
        component:IdentityRequestDetailsComponent,
        title:'Identity Request Details | Gold Market Admin'
      },
      {
        path:'business-requests',
        component:BusinessRequestsComponent,
        title:'Business Verification | Gold Market Admin'
      },
      {
        path:'business-requests/:id',
        component:BusinessRequestDetailsComponent,
        title:'Business Request Details | Gold Market Admin'
      },
      {
        path:'business-profiles/:userId',
        component:BusinessProfileComponent,
        title:'Business Profile | Gold Market Admin'
      },
      {
        path:'contact-messages',
        component:ContactMessagesComponent,
        title:'Contact Messages | Gold Market Admin'
      },
      {
        path:'contact-messages/:id',
        component:ContactMessageDetailsComponent,
        title:'Contact Message Details | Gold Market Admin'
      },
      {
        path:'metals-prices',
        component:MetalsPricesComponent,
        title:'Metals Prices | Gold Market Admin'
      },
      {
        path:'admin-inbox',
        component:AdminInboxComponent,
        title:'Admin Notifications | Gold Market Admin'
      },
      {
        path:'site-analytics',
        component:SiteAnalyticsComponent,
        title:'Website Visitors | Gold Market Admin'
      },
      {
        path:'notifications',
        component:NotificationsComponent,
        title:'Notifications Management | Gold Market Admin'
      },
      {
        path:'notifications/send',
        component:NotificationFormComponent,
        title:'Send Notification | Gold Market Admin'
      },
      {
        path:'change-password',
        component:ChangePasswordComponent,
        title:'Change Password | Gold Market Admin'
      },
      {
        path:'settings',
        component:SettingsComponent,
        title:'Settings | Gold Market Admin'
      },
    ]
  },
  // auth pages
  {
    path:'signin',
    component:SignInComponent,
    title:'Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'forgot-password',
    component:ForgotPasswordComponent,
    title:'Forgot Password | Gold Market Admin'
  },
  {
    path:'reset-password',
    component:ResetPasswordComponent,
    title:'Reset Password | Gold Market Admin'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // error pages
  {
    path:'**',
    component:NotFoundComponent,
    title:'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
