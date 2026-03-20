import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-finantial',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './finantial.component.html',
  styleUrl: './finantial.component.css',
})
export class FinantialComponent implements OnInit {
  companyId = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
  }
}
