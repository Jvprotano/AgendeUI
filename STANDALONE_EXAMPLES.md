# Standalone Components - Practical Examples

## Example 1: Simple Standalone Component

```typescript
// my-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [disabled]="disabled"
      (click)="onClick()"
      class="btn btn-primary">
      {{ label }}
    </button>
  `,
  styles: [`
    button {
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    }
  `]
})
export class MyButtonComponent {
  @Input() label = 'Click me';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }
}
```

---

## Example 2: Component with Forms

```typescript
// login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SHARED_IMPORTS } from '../shared/shared';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SHARED_IMPORTS, ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label>Email:</label>
        <input 
          type="email" 
          formControlName="email"
          class="form-control">
      </div>
      <div class="form-group">
        <label>Password:</label>
        <input 
          type="password" 
          formControlName="password"
          class="form-control">
      </div>
      <button type="submit" [disabled]="!loginForm.valid">
        Login
      </button>
    </form>
  `
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      this.router.navigate(['/user']);
    }
  }
}
```

---

## Example 3: Component with HTTP Service

```typescript
// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SHARED_IMPORTS } from '../shared/shared';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [SHARED_IMPORTS],
  template: `
    <div class="container">
      <h2>Users</h2>
      <div *ngIf="loading" class="spinner">Loading...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
      <ul *ngIf="users.length > 0" class="list-group">
        <li *ngFor="let user of users" class="list-group-item">
          {{ user.name }} - {{ user.email }}
        </li>
      </ul>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.http.get<any[]>('/api/users').subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }
}
```

---

## Example 4: Nested Standalone Components

```typescript
// parent.component.ts
import { Component } from '@angular/core';
import { ChildComponent } from './child/child.component';
import { SHARED_IMPORTS } from '../shared/shared';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [SHARED_IMPORTS, ChildComponent],
  template: `
    <div class="container">
      <h1>Parent Component</h1>
      <app-child 
        [title]="'Child 1'"
        (action)="onChildAction($event)">
      </app-child>
      <app-child 
        [title]="'Child 2'"
        (action)="onChildAction($event)">
      </app-child>
    </div>
  `
})
export class ParentComponent {
  onChildAction(event: any) {
    console.log('Child action:', event);
  }
}

// child.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared';

@Component({
  selector: 'app-child',
  standalone: true,
  imports: [SHARED_IMPORTS],
  template: `
    <div class="card">
      <h3>{{ title }}</h3>
      <button (click)="doAction()">Do Action</button>
    </div>
  `
})
export class ChildComponent {
  @Input() title = 'Child';
  @Output() action = new EventEmitter<string>();

  doAction() {
    this.action.emit('Action from child');
  }
}
```

---

## Example 5: Route Configuration

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'account',
    loadChildren: () => import('./account/account.route')
      .then(m => m.accountRoutes)
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent }
];

// account.route.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const accountRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
```

---

## Example 6: Using Shared Imports

```typescript
// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../shared/shared';
import { MyCustomPipe } from '../pipes/my-custom.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SHARED_IMPORTS,  // ← All common imports in one line
    MyCustomPipe     // ← Add custom pipes as needed
  ],
  template: `
    <div class="container">
      <h1>{{ title | translate }}</h1>
      
      <div *ngIf="isLoading" class="spinner">
        Loading...
      </div>
      
      <form [formGroup]="filterForm">
        <input 
          type="text" 
          formControlName="search"
          placeholder="Search...">
      </form>
      
      <ul>
        <li *ngFor="let item of items">
          {{ item.name | myCustom }}
        </li>
      </ul>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  title = 'DASHBOARD.TITLE';
  isLoading = false;
  items: any[] = [];
  filterForm = this.fb.group({
    search: ['']
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Component initialization
  }
}
```

---

## Example 7: Service Injection

```typescript
// data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // ← Available globally
})
export class DataService {
  constructor(private http: HttpClient) {}

  getData(): Observable<any[]> {
    return this.http.get<any[]>('/api/data');
  }
}

// component-using-service.ts
import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { SHARED_IMPORTS } from '../shared/shared';

@Component({
  selector: 'app-data-display',
  standalone: true,
  imports: [SHARED_IMPORTS],
  template: `
    <div>
      <h2>Data</h2>
      <ul>
        <li *ngFor="let item of data">{{ item.name }}</li>
      </ul>
    </div>
  `
})
export class DataDisplayComponent implements OnInit {
  data: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getData().subscribe(result => {
      this.data = result;
    });
  }
}
```

---

## Example 8: Component with Lifecycle Hooks

```typescript
// timer.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SHARED_IMPORTS } from '../shared/shared';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [SHARED_IMPORTS],
  template: `
    <div class="timer">
      <h3>Timer: {{ seconds }}s</h3>
      <button (click)="start()">Start</button>
      <button (click)="stop()">Stop</button>
    </div>
  `
})
export class TimerComponent implements OnInit, OnDestroy {
  seconds = 0;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    console.log('Timer component initialized');
  }

  start() {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.seconds++;
      });
  }

  stop() {
    this.destroy$.next();
  }

  ngOnDestroy() {
    console.log('Timer component destroyed');
    this.destroy$.complete();
  }
}
```

---

## Key Takeaways

✅ **Standalone = No NgModule**
✅ **Import what you need**
✅ **Use SHARED_IMPORTS for common dependencies**
✅ **Lazy load routes**
✅ **Provide services at appropriate level**
✅ **Clean up subscriptions in ngOnDestroy**
✅ **Use inject() for modern DI**

---

## Common Patterns

### Pattern 1: Smart/Dumb Components
```typescript
// Smart (container) component
@Component({
  imports: [DumbComponent, SHARED_IMPORTS],
  template: `<app-dumb [data]="data" (action)="onAction($event)"></app-dumb>`
})
export class SmartComponent { }

// Dumb (presentational) component
@Component({
  imports: [SHARED_IMPORTS],
  template: `<div>{{ data }}</div>`
})
export class DumbComponent { }
```

### Pattern 2: Shared Services
```typescript
// Provide at root level
@Injectable({ providedIn: 'root' })
export class SharedService { }

// Use in any component
export class MyComponent {
  constructor(private shared: SharedService) { }
}
```

### Pattern 3: Feature Modules as Routes
```typescript
// Instead of modules, use route files
export const featureRoutes: Routes = [
  { path: 'list', component: ListComponent },
  { path: 'detail/:id', component: DetailComponent }
];
```

---

## Best Practices Summary

1. ✅ Always use `standalone: true`
2. ✅ Import only what you need
3. ✅ Use `SHARED_IMPORTS` for common dependencies
4. ✅ Provide services at root level when possible
5. ✅ Clean up subscriptions in `ngOnDestroy`
6. ✅ Use lazy loading for feature routes
7. ✅ Keep components focused and small
8. ✅ Use `inject()` for modern dependency injection

