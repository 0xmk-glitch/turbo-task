import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface DropdownOption {
  value: any;
  label: string;
  icon?: string;
  iconClass?: string;
  disabled?: boolean;
  description?: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatIconModule, MatTooltipModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements ControlValueAccessor, OnInit {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() hint?: string;
  @Input() hintAlign: 'start' | 'end' = 'start';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() disabled = false;
  @Input() required = false;
  @Input() multiple = false;
  @Input() options: DropdownOption[] = [];
  @Input() selectClass = '';
  @Input() tooltip?: string;
  @Input() tooltipPosition: 'above' | 'below' | 'left' | 'right' = 'above';
  @Input() errorMessage?: string;
  @Input() formControl?: FormControl;

  @Output() selectionChange = new EventEmitter<any>();
  @Output() openedChange = new EventEmitter<boolean>();

  value: any = null;
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    if (this.formControl) {
      this.value = this.formControl.value;
    }
  }

  onSelectionChange(event: any) {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
    this.selectionChange.emit(event);
  }

  onOpenedChange(opened: boolean) {
    this.openedChange.emit(opened);
  }

  getFormFieldClasses(): string {
    const classes = ['app-dropdown'];
    
    if (this.disabled) {
      classes.push('app-dropdown--disabled');
    }
    
    if (this.errorMessage) {
      classes.push('app-dropdown--error');
    }
    
    return classes.join(' ');
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
