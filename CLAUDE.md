# SchedulerFront — CLAUDE.md

## Project Overview

Angular 17 SPA for **Agende** — an appointment/scheduling platform. The app lets business owners manage companies and schedules, and lets customers book appointments via a public scheduling portal.

**Status**: First version in development. Plans include a full refactor of styles and functionality after v1 is complete.

## Tech Stack

- **Framework**: Angular 17 (standalone components)
- **UI**: Angular Material + Bootstrap 5 + Bootstrap Icons
- **Calendar**: FullCalendar
- **Forms**: Reactive Forms (`FormBuilder`, `FormGroup`, `FormArray`)
- **HTTP**: `HttpClient` with typed wrappers in `BaseService`
- **i18n**: `ngx-translate` — Portuguese (`pt`), Spanish (`es`), English (`en`)
- **Auth**: Bearer token stored in `localStorage` (prefix `bie.`)
- **Animations**: GSAP + ScrollTrigger (home page only)
- **Modals**: `@ng-bootstrap/ng-bootstrap` (`NgbModal`)
- **Toasts**: `ngx-toastr`
- **Masks**: `ngx-mask`

## Architecture

### Module Structure
```
src/app/
├── account/        # Login, register, auth guard
├── company/        # Company dashboard, schedule (FullCalendar), financials
│   ├── models/     # Company, BusinessHours, DaySchedule, OpeningHours
│   └── services/   # CompanyService, LocationService (ViaCEP)
├── user/           # User companies list, profile, company creation wizard
│   ├── companies/  # CompaniesComponent + CreateComponent (3-step wizard)
│   └── services/   # UserService
├── scheduling/     # Public booking portal, success page
├── navegation/     # Menu, home, footer, not-found, access-denied
├── shared/         # SharedModule, ApiResponse interfaces, ErrorHandlingService
├── services/       # BaseService, EventService (pub/sub), RedirectService
└── utils/          # LocalStorageUtils, StringUtils, PasswordMatcher, GenericValidator
```

### Key Patterns

**Services extend `BaseService`** — all HTTP calls go through `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()`. These unwrap `ApiResponse<T>` via `extractData()` and pipe through `ErrorHandlingService`.

**API Response shape**:
```typescript
interface ApiResponse<T> { data: T; success: boolean; message?: string; }
```

**State management**: No NgRx. Uses `BehaviorSubject` (login status), `EventService` pub/sub (cross-component events), and component-level state.

**Route guards**: `authGuard` (functional) prevents logged-in users from accessing `/account/login` and `/account/register`.

**LocalStorage keys** (prefix `bie.`): token, user, language.

### Routing
```
/home                          → HomeComponent
/scheduling/:id                → SchedulingComponent (public)
/scheduling/success            → SuccessComponent
/account/login                 → LoginComponent [authGuard]
/account/register              → RegisterComponent [authGuard]
/user/companies                → CompaniesComponent
/user/profile                  → ProfileComponent
/company/:id/schedule          → ScheduleComponent (FullCalendar)
/company/:id/finantial         → FinantialComponent
/company/:id/dashboard         → DashboardComponent
```

## API

**Base URL**: `https://localhost:7243/api/v1/` (both dev and prod currently point to localhost — update `environment.ts` and `environment.development.ts` for deployment).

The API wraps all responses in `ApiResponse<T>`. The backend uses .NET / ASP.NET Core. Brazilian CEP lookup uses the external ViaCEP API.

## Development Commands

```bash
npm start          # ng serve (dev server at http://localhost:4200)
npm run build      # ng build
npm test           # ng test (Karma/Jasmine)
```

## Key Files to Know

| File | Purpose |
|------|---------|
| [src/app/services/base.service.ts](src/app/services/base.service.ts) | All HTTP communication — extend this for new services |
| [src/app/shared/interfaces/api-response.interface.ts](src/app/shared/interfaces/api-response.interface.ts) | `ApiResponse<T>`, `PaginatedResponse<T>`, `ErrorResponse` |
| [src/app/shared/services/error-handling.service.ts](src/app/shared/services/error-handling.service.ts) | Centralized HTTP error handling + toastr notifications |
| [src/app/utils/localstorage.ts](src/app/utils/localstorage.ts) | All localStorage access — use this, never access localStorage directly |
| [src/app/utils/generic-form-validation.ts](src/app/utils/generic-form-validation.ts) | Maps form control errors to display messages |
| [src/assets/i18n/](src/assets/i18n/) | Translation files (`pt.json`, `es.json`, `en.json`) |
| [src/environments/](src/environments/) | API URL config — one file per environment |

## Company Creation Wizard

`CreateComponent` is a 3-step modal wizard (step 3 is commented out):
1. **Basic Info** (`app-basic-info`): name, CNPJ, image, scheduling URL with availability check
2. **Business Sector** (`app-business-sector`): operating hours per day with interval validation

The parent `CompaniesComponent` controls wizard visibility with `clickedEdit`. `CreateComponent` emits `(closed)` when the NgbModal is dismissed, which the parent uses to clean up state.

**Business hours logic** lives in `business-sector.component.ts` — uses a `FormArray` of days, each with a nested `FormArray` of time intervals. Validates no overlapping/invalid intervals before submission.

## Common Gotchas

- **`getAll()` may return null from the API** when the user has no companies. Always guard with `Array.isArray()` or `?? []` before assigning to arrays used in `*ngFor`.
- **`initFormValidation()` must be called before `openModal()`** in `CreateComponent.ngOnInit()`. Opening the modal before the `FormGroup` is ready causes template binding errors.
- **`schedule` field is added lazily** to `createForm` by `BusinessSectorComponent.ngOnInit()` when step 1 is reached. Do not depend on it being present at step 0.
- **`onSubmit()` in `CreateComponent`** accesses `request.schedule` directly — this will throw if the user submits without reaching step 1. Consider adding a guard.
- **Environment files**: Both `environment.ts` and `environment.development.ts` point to `localhost:7243`. The commented Azure URLs are for production deployment.
- **Typo in route**: `'/companies/@id/schedule'` in `create.component.ts` onSubmit should be `'/company'` — fix when implementing post-creation navigation.
- **`finantial`** is a typo in the route/folder — should be `financial`. Do not correct it in isolation as it would require a backend API change.

## i18n

Add new translation keys to all three files (`pt.json`, `es.json`, `en.json`) simultaneously. The default language is Portuguese. Use `TranslateService.get()` for programmatic translation (returns Observable) or `| translate` pipe in templates.

## Style

No strict style guide enforced yet. The codebase mixes Bootstrap utilities and custom SCSS. Material Design components are used for forms in the company creation wizard. A style refactor is planned for v2.
