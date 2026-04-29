import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HomeComponent } from './navigation/home/home.component';
import { MenuComponent } from './navigation/menu/menu.component';
import { FooterComponent } from './navigation/footer/footer.component';
import { WhatsappSupportComponent } from './shared/components/whatsapp-support/whatsapp-support.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageUtils } from './utils/localstorage';
import { filter } from 'rxjs/operators';
import { AnalyticsService } from './shared/services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenuComponent, FooterComponent, TranslateModule, WhatsappSupportComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Agende';
  showChrome = true;
  showHomeSupport = false;

  constructor(
    private translate: TranslateService,
    private localStorage: LocalStorageUtils,
    private router: Router,
    analyticsService: AnalyticsService,
  ) {
    // Initialize translation with saved language
    const savedLang = this.localStorage.getLanguage();
    translate.setFallbackLang(savedLang);
    translate.use(savedLang);
    analyticsService.start();

    // Hide header/footer on scheduling pages (public customer-facing)
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        const currentPath = event.urlAfterRedirects.split('?')[0].split('#')[0];
        this.showChrome = !currentPath.startsWith('/scheduling/');
        this.showHomeSupport = currentPath === '/home';
      });
  }
}
