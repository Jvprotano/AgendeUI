import { Injectable } from '@angular/core';
import { isTokenExpired } from './token.utils';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageUtils {
  private inMemoryToken: string | null = null;
  private useSessionStorage = false;

  public saveUserLocalData(response: any, rememberMe: boolean) {
    this.saveUserToken(response.bearer, rememberMe);
  }

  public getUserToken(): string | null {
    // 1. Check in-memory first (always available during session)
    if (this.inMemoryToken && !isTokenExpired(this.inMemoryToken)) {
      return this.inMemoryToken;
    }

    // 2. Check sessionStorage (persists across page refresh, clears on tab close)
    if (typeof sessionStorage !== 'undefined') {
      const sessionToken = sessionStorage.getItem('access_token');
      if (sessionToken && !isTokenExpired(sessionToken)) {
        this.inMemoryToken = sessionToken;
        this.useSessionStorage = true;
        return sessionToken;
      }
      // Clear expired token from sessionStorage
      if (sessionToken) {
        sessionStorage.removeItem('access_token');
      }
    }

    // 3. Migrate: check old localStorage token (one-time migration)
    if (typeof localStorage !== 'undefined') {
      const oldToken = localStorage.getItem('access_token');
      if (oldToken && !isTokenExpired(oldToken)) {
        // Migrate to sessionStorage
        this.inMemoryToken = oldToken;
        this.useSessionStorage = true;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('access_token', oldToken);
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('access_user');
        return oldToken;
      }
      // Clean up expired/old tokens
      if (oldToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('access_user');
      }
    }

    this.inMemoryToken = null;
    return null;
  }

  public saveUserToken(token: string, rememberMe: boolean) {
    this.inMemoryToken = token;
    this.useSessionStorage = rememberMe;

    if (rememberMe && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('access_token', token);
    }
  }

  public getLanguage(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('bie.language') || 'pt';
    }
    return 'pt';
  }

  public saveLanguage(lang: string) {
    localStorage.setItem('bie.language', lang);
  }

  public clearUserLocalData() {
    this.inMemoryToken = null;
    this.useSessionStorage = false;

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('access_token');
    }

    // Clean up any legacy localStorage auth data (preserve bie.language)
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_user');
    }
  }
}
