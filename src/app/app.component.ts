import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './navegation/home/home.component';
import { MenuComponent } from './navegation/menu/menu.component';
import { FooterComponent } from './navegation/footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageUtils } from './utils/localstorage';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenuComponent, FooterComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Agende';

  constructor(
    private translate: TranslateService,
    private localStorage: LocalStorageUtils
  ) {
    // Initialize translation with saved language
    const savedLang = this.localStorage.getLanguage();
    translate.setFallbackLang(savedLang);
    translate.use(savedLang);
  }
}
