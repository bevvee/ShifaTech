
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

@Component({
  selector: 'app-time-picker',
  imports: [],
  templateUrl: './time-picker.component.html',
  styles: ``
})
export class TimePickerComponent {

  @Input() id!: string;
  @Input() label: string = 'Time Select Input';
  @Input() placeholder: string = 'Select time';
  @Input() defaultTime?: string | Date;

  @Output() timeChange = new EventEmitter<string>();

  @ViewChild('timeInput', { static: false }) timeInput!: ElementRef<HTMLInputElement>;

  private flatpickrInstance: flatpickr.Instance | undefined;

  ngAfterViewInit() {
    this.flatpickrInstance = flatpickr(this.timeInput.nativeElement, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',   // time format HH:mm
		static: true,
      time_24hr: true,
      minuteIncrement: 1,
      defaultDate: this.defaultTime,
      onChange: (selectedDates, dateStr) => {
        this.timeChange.emit(dateStr); // emit "HH:mm"
      }
    });
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}
