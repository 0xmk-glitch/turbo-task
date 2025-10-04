import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export type ButtonType = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonComponent),
      multi: true
    }
  ]
})
export class ButtonComponent implements ControlValueAccessor {
  @Input() type: ButtonType = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() label?: string;
  @Input() icon?: string;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() tooltip?: string;
  @Input() tooltipPosition: 'above' | 'below' | 'left' | 'right' = 'above';
  @Input() iconClass = '';
  @Input() labelClass = '';

  @Output() clicked = new EventEmitter<void>();

  private onChange = (value: any) => {};
  private onTouched = () => {};

  onClick() {
    if (!this.disabled && !this.loading) {
      this.onChange(true);
      this.onTouched();
      this.clicked.emit();
    }
  }

  getColor(): string {
    switch (this.type) {
      case 'primary':
        return 'primary';
      case 'danger':
        return 'warn';
      default:
        return '';
    }
  }

  getButtonClasses(): string {
    const classes = ['app-button'];
    
    if (this.size !== 'medium') {
      classes.push(`app-button--${this.size}`);
    }
    
    if (this.fullWidth) {
      classes.push('app-button--full-width');
    }
    
    if (this.loading) {
      classes.push('app-button--loading');
    }
    
    return classes.join(' ');
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {}
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
