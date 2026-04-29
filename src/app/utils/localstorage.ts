import { Injectable } from '@angular/core';
import { isTokenExpired } from './token.utils';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageUtils {
  private inMemoryToken: string | null = null;

  public saveUserLocalData(response: any, rememberMe: boolean) {
    const token = this.extractToken(response);
    if (token) {
      this.saveUserToken(token, rememberMe);
    }
  }

  public getUserToken(): string | null {
    if (this.inMemoryToken && !isTokenExpired(this.inMemoryToken)) {
      return this.inMemoryToken;
    }

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

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_user');
    }

    this.inMemoryToken = null;
    return null;
  }

  public saveUserToken(token: string, rememberMe: boolean) {
    this.inMemoryToken = token;

    if (typeof sessionStorage !== 'undefined') {
      if (rememberMe) {
        sessionStorage.setItem('access_token', token);
      } else {
        sessionStorage.removeItem('access_token');
      }
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_user');
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

  private extractToken(response: any): string | null {
    const token =
      response?.bearer ??
      response?.token ??
      response?.accessToken ??
      response?.access_token ??
      response?.jwt;

    return typeof token === 'string' && token.trim() ? token : null;
  }
}
