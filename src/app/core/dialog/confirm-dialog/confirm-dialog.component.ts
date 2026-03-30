import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent implements OnInit {
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  title: string = '確認操作';
  message: string = '';
  confirmLabel: string = '確認';
  cancelLabel: string = '取消';

  ngOnInit(): void {
    if (this.config.data) {
      this.title = this.config.data.title || '確認操作';
      this.message = this.config.data.message || '';
      this.confirmLabel = this.config.data.confirmLabel || '確認';
      this.cancelLabel = this.config.data.cancelLabel || '取消';
    }
  }

  confirm(): void {
    this.ref.close(true);
  }

  cancel(): void {
    this.ref.close(false);
  }
}
