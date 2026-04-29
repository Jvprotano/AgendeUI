import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import Typed from 'typed.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RouterModule } from '@angular/router';
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('headerText', { static: false }) headerText?: ElementRef<HTMLDivElement>;
  @ViewChild('homeButtons', { static: false }) homeButtons?: ElementRef<HTMLDivElement>;
  @ViewChild('homeImg', { static: false }) homeImg?: ElementRef<HTMLImageElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('pt');
    translate.use('pt');
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.translate.get('HOME.DESCRIPTION').subscribe((text: string) => {
        const options = {
          strings: [text],
          typeSpeed: 30,
          backSpeed: 0,
          loop: false
        };

        const typed = new Typed('#typed', options);
        // GSAP animations: header text -> buttons -> image
        try {
          const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'power2.out' } });

          // elements might not be available immediately, check and fallback to selectors
          const headerEl = this.headerText?.nativeElement ?? document.querySelector('.header-text');
          const buttonsEl = this.homeButtons?.nativeElement ?? document.querySelector('.home-buttons');
          const imgEl = this.homeImg?.nativeElement ?? document.querySelector('.home-img');

          // initial states
          if (headerEl) gsap.set(headerEl, { autoAlpha: 0, x: -40 });
          if (buttonsEl) gsap.set(buttonsEl, { autoAlpha: 0, x: -20 });
          if (imgEl) gsap.set(imgEl, { autoAlpha: 0, x: 40, scale: 0.98 });

          // play sequence: header, buttons, image
          if (headerEl) tl.to(headerEl, { autoAlpha: 1, x: 0 });
          if (buttonsEl) tl.to(buttonsEl, { autoAlpha: 1, x: 0 }, '+=0.12');
          if (imgEl) tl.to(imgEl, { autoAlpha: 1, x: 0, scale: 1 }, '+=0.12');

          const demo = document.querySelector('.services-circle');
          if (demo) {
            const nodes = demo.querySelectorAll('.node');

            // prepare nodes off-center
            nodes.forEach((n: any) => {
              gsap.set(n, { xPercent: -50, yPercent: -50, scale: 0.9 });
            });

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: demo.closest('#demo') || demo,
                start: 'top 70%',
                end: 'bottom 30%',
                scrub: 0.6,
                markers: false,
              }
            });

            // expand center slightly
            tl.to(demo.querySelector('.center'), { scale: 1.05, duration: 0.6, ease: 'power2.out' }, 0);

            nodes.forEach((n: any, i: number) => {
              const angle = parseFloat(n.getAttribute('data-angle') || '0');
              const radius = 140; // px
              const rad = (angle - 90) * (Math.PI / 180);
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;

              tl.to(n, { x: x, y: y, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.6)' }, 0.05 * i);
            });

            // little pulse on nodes
            tl.to(nodes, { scale: 1.03, duration: 0.35, yoyo: true, repeat: 1, stagger: 0.04 }, '-=0.4');
          }

            // Animate 'functionalities' cards with a stagger when they scroll into view
            try {
              const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              const cards = document.querySelectorAll('.card-functionalities');

              if (cards && cards.length) {
                if (prefersReduced) {
                  // If user prefers reduced motion, ensure cards are visible without animation
                  cards.forEach((c: any) => gsap.set(c, { autoAlpha: 1, y: 0 }));
                } else {
                  gsap.from(cards, {
                    scrollTrigger: {
                      trigger: '.container.functionalities',
                      start: 'top 80%',
                      toggleActions: 'play none none reverse',
                      // markers: true // uncomment to debug
                    },
                    duration: 0.6,
                    y: 30,
                    autoAlpha: 0,
                    stagger: 0.14,
                    ease: 'power2.out'
                  });
                }
              }
            } catch (innerErr) {
              // ignore animation errors for functionalities
            }
        } catch (e) {
          // silent fail if gsap issues occur
          // console.warn('GSAP animation failed', e);
        }
      });
    }
  }
}
