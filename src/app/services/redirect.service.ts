import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private returnRoute: string | null = null;

  constructor(private router: Router) {}

  setReturnRoute(route: string): void {
    this.returnRoute = route;
  }

  getReturnRoute(): string | null {
    return this.returnRoute;
  }

  clearReturnRoute(): void {
    this.returnRoute = null;
  }

  redirectToReturnRoute(): void {
    if (this.returnRoute) {
      const route = this.returnRoute;
      this.returnRoute = null;
      this.router.navigateByUrl(route);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
