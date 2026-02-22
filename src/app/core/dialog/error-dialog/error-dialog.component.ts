import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

export interface ErrorDialogData {
  title?: string;
  message: string;
  errorCode?: string;
}

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss'
})
export class ErrorDialogComponent {
  title: string;
  message: string;
  errorCode?: string;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig<ErrorDialogData>
  ) {
    this.title = config.data?.title || '發生錯誤';
    this.message = config.data?.message || '系統發生未預期的錯誤，請稍後再試。';
    this.errorCode = config.data?.errorCode;
  }

  close(): void {
    this.ref.close();
  }
}
