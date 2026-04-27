# Standalone Components Guide

## What are Standalone Components?

Standalone components are Angular components that manage their own dependencies without requiring an NgModule. They are the recommended approach in Angular 17+.

---

## Creating a Standalone Component

### Basic Example

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-component',
  standalone: true,  // ← This makes it standalone
  imports: [
    CommonModule,    // For *ngIf, *ngFor, etc.
    FormsModule      // For ngModel, etc.
  ],
  template: `
    <div>
      <h1>{{ title }}</h1>
      <input [(ngModel)]="name" />
      <p *ngIf="name">Hello {{ name }}!</p>
    </div>
  `,
  styles: [`
    h1 { color: var(--green-conci); }
  `]
})
export class MyComponent {
  title = 'My Standalone Component';
  name = '';
}
```

---

## Using Shared Imports

Instead of importing common modules in every component, use the shared imports:

```typescript
import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../shared/shared';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [SHARED_IMPORTS],  // ← All common imports in one line
  template: `...`
})
export class MyComponent {}
```

---

## Importing Other Components

### Importing Standalone Components

```typescript
import { Component } from '@angular/core';
import { MyOtherComponent } from './my-other/my-other.component';
import { SHARED_IMPORTS } from '../shared/shared';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [
    SHARED_IMPORTS,
    MyOtherComponent  // ← Import the component directly
  ],
  template: `
    <app-my-other></app-my-other>
  `
})
export class ParentComponent {}
```

### Importing Directives and Pipes

```typescript
import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { MyCustomPipe } from './pipes/my-custom.pipe';
import { MyCustomDirective } from './directives/my-custom.directive';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MyCustomPipe,
    MyCustomDirective
  ],
  template: `
    <div *ngIf="show" [appMyCustom]>
      {{ items | myCustom }}
    </div>
  `
})
export class ExampleComponent {
  show = true;
  items = [1, 2, 3];
}
```

---

## Providing Services

### Component-Level Providers

```typescript
import { Component } from '@angular/core';
import { MyService } from './services/my.service';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [],
  providers: [MyService],  // ← Service is provided at component level
  template: `...`
})
export class MyComponent {
  constructor(private myService: MyService) {}
}
```

### Application-Level Providers

In `app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    MyGlobalService,  // ← Available to all components
    // ... other providers
  ]
};
```

---

## Routing with Standalone Components

### Route Configuration

```typescript
// account.route.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const accountRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
```

### Lazy Loading Routes

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'account',
    loadChildren: () => import('./account/account.route')
      .then(m => m.accountRoutes)
  }
];
```

---

## Using Dependency Injection

### Constructor Injection

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [],
  template: `...`
})
export class MyComponent {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  navigateHome() {
    this.router.navigate(['/home']);
  }
}
```

### Inject Function (Modern Approach)

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [],
  template: `...`
})
export class MyComponent {
  private http = inject(HttpClient);

  loadData() {
    this.http.get('/api/data').subscribe(data => {
      console.log(data);
    });
  }
}
```

---

## Lifecycle Hooks

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [],
  template: `...`
})
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Component initialized
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Input and Output

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child',
  standalone: true,
  imports: [],
  template: `
    <button (click)="onButtonClick()">
      {{ message }}
    </button>
  `
})
export class ChildComponent {
  @Input() message = 'Click me';
  @Output() clicked = new EventEmitter<void>();

  onButtonClick() {
    this.clicked.emit();
  }
}
```

### Using the Component

```typescript
@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [ChildComponent],
  template: `
    <app-child 
      [message]="'Hello'" 
      (clicked)="onChildClicked()">
    </app-child>
  `
})
export class ParentComponent {
  onChildClicked() {
    console.log('Child clicked!');
  }
}
```

---

## Best Practices

### ✅ DO

- Import only what you need
- Use `SHARED_IMPORTS` for common dependencies
- Keep components focused and small
- Use `inject()` for modern dependency injection
- Provide services at the appropriate level

### ❌ DON'T

- Import entire modules when you only need one directive
- Create circular dependencies
- Provide services at component level if they should be global
- Mix standalone and module-based components

---

## Migration from Modules

### Before (Module-based)
```typescript
@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [MyComponent],
  exports: [MyComponent]
})
export class MyModule {}
```

### After (Standalone)
```typescript
@Component({
  selector: 'app-my',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `...`
})
export class MyComponent {}
```

---

## Common Imports Reference

```typescript
// Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Common directives
import { CommonModule } from '@angular/common';
import { NgIf, NgFor, NgSwitch } from '@angular/common';

// Routing
import { RouterModule, RouterOutlet, RouterLink } from '@angular/router';

// HTTP
import { HttpClientModule } from '@angular/common/http';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

// Translation
import { TranslateModule } from '@ngx-translate/core';

// Bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
```

---

## Summary

✅ Standalone components are simpler and cleaner
✅ No NgModule boilerplate needed
✅ Better tree-shaking and smaller bundles
✅ Easier to test and maintain
✅ Modern Angular best practice
✅ Future-proof architecture

Start using standalone components in all new components!

