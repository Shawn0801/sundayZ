import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

export interface SuccessDialogData {
  title?: string;
  message: string;
  actionHint?: string;
}

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-dialog.component.html',
  styleUrl: './success-dialog.component.scss'
})
export class SuccessDialogComponent {
  title: string;
  message: string;
  actionHint?: string;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig<SuccessDialogData>
  ) {
    this.title = config.data?.title || '操作成功';
    this.message = config.data?.message || '您的操作已成功完成。';
    this.actionHint = config.data?.actionHint;
  }

  close(): void {
    this.ref.close();
  }
}
