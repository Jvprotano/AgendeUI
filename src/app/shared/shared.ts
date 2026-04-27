/**
 * Shared imports and providers for standalone components
 * This replaces the SharedModule for Angular 17+ standalone architecture
 */

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyFormatPipe } from '../utils/currency-format.pipe';

/**
 * Common imports used across standalone components
 */
export const SHARED_IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  HttpClientModule,
  TranslateModule,
  CurrencyFormatPipe
];

/**
 * Export all shared imports for convenience
 */
export * from '@angular/common';
export * from '@angular/forms';
export * from '@angular/router';
export * from '@angular/platform-browser';
export * from '@angular/platform-browser/animations';
export * from '@ngx-translate/core';
export { CurrencyFormatPipe } from '../utils/currency-format.pipe';

