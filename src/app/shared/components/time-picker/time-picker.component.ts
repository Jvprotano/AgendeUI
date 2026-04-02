import {
  Component,
  Input,
  forwardRef,
  ElementRef,
  ViewChild,
  HostListener,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

interface TimeSlot {
  value: string;
  hour: number;
  minute: number;
  label: string;
  period: string;
}

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
  ],
})
export class TimePickerComponent implements ControlValueAccessor, OnDestroy {
  @Input() label = 'Horário';
  @Input() placeholder = 'Selecione';

  @ViewChild('dropdown') dropdownRef!: ElementRef<HTMLDivElement>;
  @ViewChild('trigger') triggerRef!: ElementRef<HTMLButtonElement>;

  isOpen = false;
  value: string = '';
  disabled = false;
  timeSlots: TimeSlot[] = [];
  filteredSlots: TimeSlot[] = [];
  searchQuery = '';
  highlightedIndex = -1;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {
    this.generateTimeSlots();
    this.filteredSlots = [...this.timeSlots];
  }

  ngOnDestroy(): void {}

  writeValue(value: string): void {
    this.value = value || '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        this.close();
        this.triggerRef?.nativeElement.focus();
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.moveHighlight(1);
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.moveHighlight(-1);
        event.preventDefault();
        break;
      case 'Enter':
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredSlots.length) {
          this.selectTime(this.filteredSlots[this.highlightedIndex]);
        }
        event.preventDefault();
        break;
    }
  }

  toggle(): void {
    if (this.disabled) return;
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.disabled) return;
    this.isOpen = true;
    this.searchQuery = '';
    this.filteredSlots = [...this.timeSlots];
    this.highlightedIndex = this.getSelectedIndex();
    this.cdr.markForCheck();

    setTimeout(() => this.scrollToSelected(), 0);
  }

  close(): void {
    this.isOpen = false;
    this.onTouched();
    this.cdr.markForCheck();
  }

  selectTime(slot: TimeSlot): void {
    this.value = slot.value;
    this.onChange(slot.value);
    this.close();
    this.triggerRef?.nativeElement.focus();
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;

    if (!query.trim()) {
      this.filteredSlots = [...this.timeSlots];
    } else {
      const q = query.replace(/[^0-9:]/g, '');
      this.filteredSlots = this.timeSlots.filter(slot =>
        slot.value.includes(q) || slot.label.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.highlightedIndex = this.filteredSlots.length > 0 ? 0 : -1;
    this.cdr.markForCheck();
  }

  isSelected(slot: TimeSlot): boolean {
    return this.value === slot.value;
  }

  isHighlighted(index: number): boolean {
    return this.highlightedIndex === index;
  }

  getDisplayValue(): string {
    if (!this.value) return '';
    const slot = this.timeSlots.find(s => s.value === this.value);
    return slot ? slot.value : this.value;
  }

  getHourLabel(hour: number): string {
    return `${hour.toString().padStart(2, '0')}h`;
  }

  isNewHourGroup(index: number): boolean {
    if (index === 0) return true;
    return this.filteredSlots[index].hour !== this.filteredSlots[index - 1].hour;
  }

  trackByValue(_index: number, slot: TimeSlot): string {
    return slot.value;
  }

  private generateTimeSlots(): void {
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeSlots.push({
          value,
          hour,
          minute,
          label: value,
          period: hour < 12 ? 'AM' : 'PM',
        });
      }
    }
  }

  private getSelectedIndex(): number {
    if (!this.value) return -1;
    return this.filteredSlots.findIndex(s => s.value === this.value);
  }

  private moveHighlight(direction: number): void {
    const len = this.filteredSlots.length;
    if (len === 0) return;

    if (this.highlightedIndex < 0) {
      this.highlightedIndex = direction > 0 ? 0 : len - 1;
    } else {
      this.highlightedIndex = (this.highlightedIndex + direction + len) % len;
    }
    this.scrollToHighlighted();
    this.cdr.markForCheck();
  }

  private scrollToSelected(): void {
    const idx = this.getSelectedIndex();
    if (idx < 0) return;
    this.scrollToIndex(idx);
  }

  private scrollToHighlighted(): void {
    this.scrollToIndex(this.highlightedIndex);
  }

  private scrollToIndex(index: number): void {
    if (!this.dropdownRef) return;
    const list = this.dropdownRef.nativeElement.querySelector('.tp-list');
    if (!list) return;
    const item = list.children[index] as HTMLElement | undefined;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }
}
