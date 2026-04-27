import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './navegation/menu/menu.component';
import { FooterComponent } from './navegation/footer/footer.component';
import { AccountService } from './account/services/account.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenuComponent, FooterComponent],
  providers: [AccountService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Agende';
}
