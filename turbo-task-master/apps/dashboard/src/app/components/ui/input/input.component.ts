import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatTooltipModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor, OnInit {
  @Input() type: InputType = 'text';
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() hint?: string;
  @Input() hintAlign: 'start' | 'end' = 'start';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() maxLength?: number;
  @Input() minLength?: number;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() prefixIconClass = '';
  @Input() suffixIconClass = '';
  @Input() inputClass = '';
  @Input() tooltip?: string;
  @Input() tooltipPosition: 'above' | 'below' | 'left' | 'right' = 'above';
  @Input() errorMessage?: string;
  @Input() formControl?: FormControl;

  @Output() valueChange = new EventEmitter<string>();
  @Output() focusEvent = new EventEmitter<FocusEvent>();
  @Output() blurEvent = new EventEmitter<FocusEvent>();

  value = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit() {
    if (this.formControl) {
      this.value = this.formControl.value || '';
    }
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onFocus(event?: FocusEvent) {
    this.focusEvent.emit(event);
  }

  onBlur(event?: FocusEvent) {
    this.onTouched();
    this.blurEvent.emit(event);
  }

  getFormFieldClasses(): string {
    const classes = ['app-input'];
    
    if (this.disabled) {
      classes.push('app-input--disabled');
    }
    
    if (this.readonly) {
      classes.push('app-input--readonly');
    }
    
    if (this.errorMessage) {
      classes.push('app-input--error');
    }
    
    return classes.join(' ');
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
