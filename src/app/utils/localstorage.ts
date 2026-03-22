import { Injectable } from '@angular/core';
import { isTokenExpired } from './token.utils';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageUtils {
  private inMemoryToken: string | null = null;

  public saveUserLocalData(response: any, rememberMe: boolean) {
    this.saveUserToken(response.bearer, rememberMe);
  }

  public getUserToken(): string | null {
    // 1. Check in-memory first (fastest)
    if (this.inMemoryToken && !isTokenExpired(this.inMemoryToken)) {
      return this.inMemoryToken;
    }

    // 2. Check sessionStorage (survives page refresh, clears on tab close)
    if (typeof sessionStorage !== 'undefined') {
      const sessionToken = sessionStorage.getItem('access_token');
      if (sessionToken && !isTokenExpired(sessionToken)) {
        this.inMemoryToken = sessionToken;
        return sessionToken;
      }
      if (sessionToken) {
        sessionStorage.removeItem('access_token');
      }
    }

    // 3. Check localStorage ("Remember me" — survives browser close)
    if (typeof localStorage !== 'undefined') {
      const localToken = localStorage.getItem('access_token');
      if (localToken && !isTokenExpired(localToken)) {
        this.inMemoryToken = localToken;
        // Re-populate sessionStorage for faster access
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('access_token', localToken);
        }
        return localToken;
      }
      if (localToken) {
        localStorage.removeItem('access_token');
      }
    }

    this.inMemoryToken = null;
    return null;
  }

  public saveUserToken(token: string, rememberMe: boolean) {
    this.inMemoryToken = token;

    // Always store in sessionStorage (survives page refresh, clears on tab close)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('access_token', token);
    }

    // With "Remember me", also store in localStorage (survives browser close)
    if (rememberMe && typeof localStorage !== 'undefined') {
      localStorage.setItem('access_token', token);
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

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('access_token');
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_user');
    }
  }
}
