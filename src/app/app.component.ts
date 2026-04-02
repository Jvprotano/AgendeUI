import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HomeComponent } from './navegation/home/home.component';
import { MenuComponent } from './navegation/menu/menu.component';
import { FooterComponent } from './navegation/footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageUtils } from './utils/localstorage';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenuComponent, FooterComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Agende';
  showChrome = true;

  constructor(
    private translate: TranslateService,
    private localStorage: LocalStorageUtils,
    private router: Router
  ) {
    // Initialize translation with saved language
    const savedLang = this.localStorage.getLanguage();
    translate.setFallbackLang(savedLang);
    translate.use(savedLang);

    // Hide header/footer on scheduling pages (public customer-facing)
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.showChrome = !event.urlAfterRedirects.startsWith('/scheduling/');
      });
  }
}
