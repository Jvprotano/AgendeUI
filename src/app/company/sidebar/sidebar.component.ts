import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { RouterModule } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CreateComponent } from '../../user/companies/create/create.component';
import { Company } from '../models/company';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgbTooltipModule, CreateComponent, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {

  companyToEdit: Company | null = null;
  clickedEdit: boolean = false;

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.eventService.broadcast('hide-header', true);
  }

  ngOnDestroy(): void {
    this.eventService.broadcast('hide-header', false);
  }

  openEditCompany() {
    this.clickedEdit = true;
  }

  onEditClosed() {
    this.clickedEdit = false;
    this.companyToEdit = null;
  }

}
