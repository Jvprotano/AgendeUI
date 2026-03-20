import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { RouterModule } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgbTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() companyId = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.broadcast('hide-header', true);
  }

  ngOnDestroy(): void {
    this.eventService.broadcast('hide-header', false);
  }
}
