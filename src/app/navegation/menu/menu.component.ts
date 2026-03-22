import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbCollapse, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MenuLoginComponent } from "../menu-login/menu-login.component";
import { Observable, Subscription, debounceTime, fromEvent } from 'rxjs';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { AccountService } from '../../account/services/account.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageUtils } from '../../utils/localstorage';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
    imports: [NgbCollapse, NgbDropdownModule, RouterModule, MenuLoginComponent, CommonModule, TranslateModule],
    providers: []
})
export class MenuComponent implements OnInit {

  public isCollapsed: boolean = true;
  mobile: boolean = false;
  resizeObservable$!: Observable<Event>;
  resizeSubscription$!: Subscription;
  hideHeader: boolean = false;
  isLoggedIn$: Observable<boolean>;
  currentLang: string;

  constructor(
    private eventService: EventService,
    private accountService: AccountService,
     private translate: TranslateService,
     private localStorage: LocalStorageUtils
  ) { 
    this.isLoggedIn$ = this.accountService.userIsLoggedObs;
     // Get saved language or default to 'pt'
     const savedLang = this.localStorage.getLanguage();
     this.translate.use(savedLang);
     // normalize language code to primary subtag (e.g. 'en' from 'en-US') so it matches flag filenames
     this.currentLang = savedLang.split('-')[0];
  }

  switchLanguage(lang: string) {
     this.translate.use(lang);
     this.localStorage.saveLanguage(lang);
    // ensure we use the primary subtag for the flag file (assets/flags/{lang}.svg)
    this.currentLang = (lang || '').split('-')[0] || 'pt';
  }

  ngOnInit(): void {
    this.checkScreenSize();
    
    this.eventService.subscribe('hide-header', value => this.hideHeader = value);

    if (typeof window !== 'undefined') {

      this.resizeObservable$ = fromEvent(window, 'resize');

      this.resizeSubscription$ = this.resizeObservable$.pipe(debounceTime(300)).subscribe((event) => {
        if (event?.isTrusted) {
          this.checkScreenSize(event.target);
        } else {
          this.checkScreenSize();
        }
      });
    }
  }

  checkScreenSize(event: any = null) {
    let width: any;
    if (event === null) {
      if (typeof window !== 'undefined') {
        width = window.innerWidth;
      }
    } else {
      if (typeof window !== 'undefined') {
        width = event.outerWidth;
      }
    };
    this.mobile = width > 480 ? false : true;
  }

  ngOnDestroy() {
    if (this.resizeSubscription$) {
      this.resizeSubscription$.unsubscribe();
    }
  }
}
