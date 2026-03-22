import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-share-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './share-info.component.html',
  styleUrl: './share-info.component.css'
})
export class ShareInfoComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() previous: EventEmitter<any> = new EventEmitter();

  /**
   *
   */

  ngOnInit(): void {
  }



  onPrevious() {
    this.previous.emit();
  }
}
