import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Import all UI components
import { ButtonComponent } from './button/button.component';
import { InputComponent } from './input/input.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { TextareaComponent } from './textarea/textarea.component';

const UI_COMPONENTS = [
  ButtonComponent,
  InputComponent,
  DropdownComponent,
  TextareaComponent
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    ...UI_COMPONENTS
  ],
  exports: [
    ...UI_COMPONENTS
  ]
})
export class UiModule { }
