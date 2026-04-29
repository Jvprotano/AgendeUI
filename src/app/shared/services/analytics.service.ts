import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

type GtagCommand = 'js' | 'config' | 'event';
type Gtag = (command: GtagCommand, target: string | Date, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly measurementId = 'G-LH9VHCTMYY';
  private readonly scriptId = 'google-analytics-tag';
  private initialized = false;
  private lastTrackedUrl = '';
  private lastPageLocation = '';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
  ) {}

  start(): void {
    if (!isPlatformBrowser(this.platformId) || this.initialized || !this.shouldTrack()) {
      return;
    }

    this.initialized = true;
    this.installGoogleTag();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.trackPageView(event.urlAfterRedirects));
  }

  private installGoogleTag(): void {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));

    if (!this.document.getElementById(this.scriptId)) {
      const script = this.document.createElement('script');
      script.id = this.scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      this.document.head.appendChild(script);
    }

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: false,
      debug_mode: this.isDebugMode(),
    });
  }

  private trackPageView(url: string): void {
    const normalizedUrl = url || this.router.url;

    if (!window.gtag || normalizedUrl === this.lastTrackedUrl) {
      return;
    }

    this.lastTrackedUrl = normalizedUrl;
    const pageUrl = new URL(normalizedUrl, this.document.location.origin);
    const pageLocation = pageUrl.href;
    const eventParams: Record<string, unknown> = {
      page_title: this.document.title,
      page_location: pageLocation,
      page_path: `${pageUrl.pathname}${pageUrl.search}${pageUrl.hash}`,
      debug_mode: this.isDebugMode(),
    };

    if (this.lastPageLocation || this.document.referrer) {
      eventParams['page_referrer'] = this.lastPageLocation || this.document.referrer;
    }

    window.gtag('event', 'page_view', eventParams);
    this.lastPageLocation = pageLocation;
  }

  private shouldTrack(): boolean {
    const hostname = this.document.location.hostname;
    return this.isDebugMode() || (hostname !== 'localhost' && hostname !== '127.0.0.1');
  }

  private isDebugMode(): boolean {
    return new URLSearchParams(this.document.location.search).get('analytics_debug') === '1';
  }
}
