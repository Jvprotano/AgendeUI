# Security Audit Report — Agende Authentication System

**Date:** 2026-03-20
**Scope:** Frontend authentication flow (Angular 17 SPA)
**Auditor:** Automated review

---

## Findings

### CRITICAL

#### 1. JWT Stored in localStorage — XSS Token Theft Risk

- **File:** `src/app/utils/localstorage.ts:24`
- **Current state:** Token stored via `localStorage.setItem('access_token', token)`. Any XSS vector (including third-party scripts) can read it.
- **Fix applied:** Implemented in-memory + sessionStorage hybrid. `rememberMe=true` persists to `sessionStorage` (survives refresh, clears on tab close). `rememberMe=false` stores in-memory only (lost on any full page reload). `localStorage` is no longer used for the token.
- **Remaining recommendation:** The gold standard is HttpOnly cookies set by the API (`Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict`). This requires a backend change to the login endpoint.

#### 2. No Token Expiration Check

- **Files:** `src/app/account/services/auth.guard.ts`, `src/app/services/error.handle.service.ts`
- **Current state:** Guards check `localStorage.getUserToken()` — truthy means "logged in". An expired JWT passes the guard, makes API calls, gets 401, and the user is kicked abruptly.
- **Fix applied:** Created `src/app/utils/token.utils.ts` with `decodeToken()`, `isTokenExpired()`, `getTokenExpirationDate()`, `getTimeUntilExpiration()`. Guards and interceptor now check expiration before allowing access or attaching the token.

#### 3. No Token Refresh / Graceful Expiration

- **Current state:** When the JWT expires, the user gets a 401, localStorage is cleared, and they're redirected to login with no warning and no return-to-page behavior.
- **Fix applied:** Proactive expiration warning — when < 5 minutes remain, a toast warns the user. On actual expiration, `RedirectService` saves the current URL so the user returns after re-login.
- **Remaining recommendation:** The API should implement a `POST /api/v1/token/refresh` endpoint that accepts the current JWT and returns a new one. The frontend should call this proactively before expiration.

#### 4. Dual Error Handling Swallows Auth Errors

- **Files:** `src/app/services/error.handle.service.ts` (interceptor), `src/app/shared/services/error-handling.service.ts` (service-level)
- **Current state:** On 401, the interceptor clears the token, redirects to login, then `throw error.error`. The service-level `catchError` in `BaseService` catches it again — `ErrorHandlingService.handleError()` shows a toast AND navigates to `/login` AND calls `window.location.reload()`. The user sees duplicate error messages and a jarring full reload.
- **Fix applied:** 401 handling is now exclusive to the interceptor. The interceptor returns `EMPTY` (completes silently) on 401 instead of re-throwing. `ErrorHandlingService` no longer handles 401. Single clear "session expired" message shown.

### HIGH

#### 5. `rememberMe` Flag Does Nothing

- **File:** `src/app/account/services/account.service.ts:38-44`
- **Current state:** `rememberMe` is sent to the API but the frontend always stores the token in `localStorage` regardless.
- **Fix applied:** `rememberMe=true` → `sessionStorage` (persists on refresh, clears on tab close). `rememberMe=false` → in-memory only (clears on any page reload or tab close). `AccountService` passes `rememberMe` to `LocalStorageUtils` which selects the storage strategy.

#### 6. RedirectService Broken Fallback

- **File:** `src/app/services/redirect.service.ts:25`
- **Current state:** Falls back to `/gpt-agenda` — a route that doesn't exist (returns 404/not-found).
- **Fix applied:** Changed fallback to `/home`.

#### 7. Guards Don't Validate Token

- **File:** `src/app/account/services/auth.guard.ts`
- **Current state:** Already uses functional `CanActivateFn` pattern (good). But only checks token existence, not validity/expiration.
- **Fix applied:** Guards now decode the JWT and check `exp` claim. Expired token → clear + redirect to login. `protectedGuard` saves the intended URL via `RedirectService`.

#### 8. User Data Stored Separately in localStorage

- **File:** `src/app/utils/localstorage.ts:28`
- **Current state:** `userName` stored as `access_user` in localStorage. Only the username is stored; any other user info requires an API call.
- **Fix applied:** User data is now extracted from JWT claims on demand via `AccountService.getUser()`. `access_user` is no longer written or read. `TokenPayload` interface models the expected JWT claims.

### MEDIUM

#### 9. No Login Rate Limiting (Client-Side)

- **File:** `src/app/account/login/login.component.ts`
- **Current state:** No limit on login attempts. A script can spam the login endpoint.
- **Fix applied:** After 3 consecutive failed login attempts, the login button is disabled for 30 seconds with a visible countdown.

#### 10. Password Visibility Toggle

- **File:** `src/app/account/login/login.component.html`
- **Current state:** Already implemented with `showPassword` toggle and eye icon. Register form also has it.
- **Fix applied:** None needed — already present.

#### 11. Logout Not Thorough

- **File:** `src/app/account/services/account.service.ts:47-49`
- **Current state:** Only clears `access_token` and `access_user`. In-memory BehaviorSubject is set to `false`, but no other cleanup occurs.
- **Fix applied:** Logout now clears ALL `bie.*` keys (except `bie.language`), clears in-memory token, resets the auth BehaviorSubject, and clears the return route.
- **Remaining recommendation:** The API should provide a `POST /api/v1/logout` endpoint that invalidates the JWT server-side (add to a token blocklist or revocation list).

#### 12. Interceptor Registration Pattern

- **File:** `src/app/app.config.ts:31-33`
- **Current state:** Uses legacy `HTTP_INTERCEPTORS` multi-provider with `HttpClientModule`.
- **Fix applied:** Migrated to `provideHttpClient(withInterceptors([authInterceptor]))` using a functional `HttpInterceptorFn`.

---

## Backend Recommendations (Out of Scope)

1. **HttpOnly cookies for JWT** — Set `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict` on login response instead of returning the token in the JSON body.
2. **Token refresh endpoint** — `POST /api/v1/token/refresh` that accepts a valid JWT and returns a new one with extended expiration.
3. **Server-side logout** — `POST /api/v1/logout` that adds the token to a revocation list.
4. **Rate limiting** — Server-side rate limiting on `/api/v1/login` (e.g., 5 attempts per minute per IP).
5. **CORS hardening** — Ensure `Access-Control-Allow-Origin` is set to the specific frontend domain, not `*`.
6. **Content Security Policy** — Add CSP headers to prevent inline script execution and reduce XSS attack surface.
