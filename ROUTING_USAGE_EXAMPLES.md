# Routing Usage Examples

## Navigation Examples

### Using RouterLink in Templates

```html
<!-- Home Page -->
<a routerLink="/home">Home</a>

<!-- Account Routes -->
<a routerLink="/account/login">Login</a>
<a routerLink="/account/register">Register</a>

<!-- User Routes -->
<a routerLink="/user">User Dashboard</a>
<a routerLink="/user/profile">My Profile</a>
<a routerLink="/user/companies">My Companies</a>

<!-- Company Routes (with company ID) -->
<a routerLink="/company/1/dashboard">Dashboard</a>
<a routerLink="/company/1/schedule">Schedule</a>
<a routerLink="/company/1/financial">Financial</a>

<!-- Scheduling Routes -->
<a routerLink="/scheduling/success">Success Page</a>
<a routerLink="/scheduling/1">Schedule Service</a>
```

---

## Programmatic Navigation

### Using Router Service

```typescript
import { Router } from '@angular/router';

export class MyComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/account/login']);
  }

  navigateToDashboard(companyId: string) {
    this.router.navigate(['/company', companyId, 'dashboard']);
  }

  navigateToSchedule(serviceId: string) {
    this.router.navigate(['/scheduling', serviceId]);
  }

  navigateWithQueryParams() {
    this.router.navigate(['/user/companies'], {
      queryParams: { page: 1, sort: 'name' }
    });
  }

  navigateWithFragment() {
    this.router.navigate(['/home'], {
      fragment: 'pricing'
    });
  }
}
```

---

## Route Parameters

### Accessing Route Parameters

```typescript
import { ActivatedRoute } from '@angular/router';

export class DashboardComponent implements OnInit {
  companyId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get route parameter
    this.route.params.subscribe(params => {
      this.companyId = params['id'];
      this.loadDashboard(this.companyId);
    });

    // Alternative: Get snapshot (one-time read)
    this.companyId = this.route.snapshot.params['id'];
  }

  loadDashboard(id: string) {
    // Load dashboard data for company
  }
}
```

### Accessing Query Parameters

```typescript
export class CompaniesComponent implements OnInit {
  page: number = 1;
  sort: string = 'name';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.page = params['page'] || 1;
      this.sort = params['sort'] || 'name';
      this.loadCompanies();
    });
  }

  loadCompanies() {
    // Load companies with pagination and sorting
  }
}
```

---

## Route Guards

### Using Auth Guard

```typescript
// In your component
import { Router } from '@angular/router';

export class LoginComponent {
  constructor(private router: Router) {}

  onLoginSuccess() {
    // After successful login
    this.router.navigate(['/user']);
  }
}

// Protected routes automatically redirect to login if not authenticated
// Routes with canActivate: [authGuard] will check authentication
```

---

## Lazy Loading

### How Lazy Loading Works

```typescript
// In app.routes.ts
{
  path: 'company',
  loadChildren: () => import('./company/company.module')
    .then(m => m.CompanyModule)
}

// The CompanyModule is only loaded when user navigates to /company
// This improves initial load time
```

---

## Complete Navigation Flow Example

```typescript
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <h1>Navigation Example</h1>
      <button (click)="goToHome()">Home</button>
      <button (click)="goToLogin()">Login</button>
      <button (click)="goToDashboard()">Dashboard</button>
      <button (click)="goToSchedule()">Schedule</button>
    </div>
  `
})
export class ExampleComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToLogin() {
    this.router.navigate(['/account/login']);
  }

  goToDashboard() {
    // Navigate to company dashboard with ID
    const companyId = '1';
    this.router.navigate(['/company', companyId, 'dashboard']);
  }

  goToSchedule() {
    // Navigate to scheduling with service ID
    const serviceId = '1';
    this.router.navigate(['/scheduling', serviceId]);
  }

  goBack() {
    // Go back to previous page
    window.history.back();
  }
}
```

---

## Responsive Home Page

### Mobile-First Approach

The home page now includes responsive breakpoints:

- **Desktop (> 1200px)**: Full layout with side-by-side content
- **Tablet (992px - 1200px)**: Adjusted proportions
- **Mobile (768px - 992px)**: Stacked layout
- **Small Mobile (576px - 768px)**: Compact design
- **Extra Small (< 576px)**: Minimal spacing

### Testing Responsiveness

```bash
# Open DevTools (F12)
# Click device toolbar icon (Ctrl+Shift+M)
# Test different device presets:
# - iPhone SE (375px)
# - iPhone 12 Pro (390px)
# - iPad (768px)
# - iPad Pro (1024px)
# - Desktop (1920px)
```

---

## Best Practices

### 1. Use Relative Routes
```typescript
// Good
this.router.navigate(['../profile'], { relativeTo: this.route });

// Avoid
this.router.navigate(['/user/profile']);
```

### 2. Unsubscribe from Route Params
```typescript
import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        // Handle params
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 3. Use Route Data for Metadata
```typescript
// In routes
{
  path: 'dashboard',
  component: DashboardComponent,
  data: { title: 'Dashboard', breadcrumb: 'Dashboard' }
}

// In component
this.route.data.subscribe(data => {
  console.log(data.title); // 'Dashboard'
});
```

### 4. Preload Strategies
```typescript
// In app.config.ts
import { withPreloading, PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules))
  ]
};
```

---

## Troubleshooting

### Route Not Working
- Check if route path matches exactly
- Verify component is imported in module
- Check if lazy loading module is properly configured
- Verify RouterModule is imported

### Parameters Not Updating
- Use `params` Observable instead of `snapshot`
- Subscribe to route changes
- Unsubscribe in ngOnDestroy

### Lazy Loading Not Working
- Check if module path is correct
- Verify module exports the component
- Check browser console for errors
- Ensure loadChildren syntax is correct

---

## Summary

✅ All routes are properly configured
✅ Lazy loading is working for all modules
✅ Route guards protect authenticated routes
✅ Home page is fully responsive
✅ GSAP animations work on all screen sizes
✅ Navigation is smooth and intuitive

