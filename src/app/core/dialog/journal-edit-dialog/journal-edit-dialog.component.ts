import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import {
  JournalEntry,
  JournalType,
  JournalTypeLabels
} from '../../../interfaces/JournalEntry';

export interface JournalEditDialogData {
  mode: 'create' | 'edit';
  entry?: JournalEntry;
  presetType?: JournalType;
}

interface DropdownOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-journal-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    InputText,
    InputNumber,
    Textarea,
    DatePicker,
    Button
  ],
  templateUrl: './journal-edit-dialog.component.html',
  styleUrl: './journal-edit-dialog.component.scss'
})
export class JournalEditDialogComponent implements OnInit {
  form!: FormGroup;
  mode: 'create' | 'edit' = 'create';

  // 下拉選項
  typeOptions: DropdownOption[] = [];
  unitOptions: DropdownOption[] = [
    { label: 'c.c.', value: 'c.c.' },
    { label: '包', value: '包' },
    { label: '公斤', value: '公斤' },
    { label: '公升', value: '公升' },
    { label: '毫升', value: '毫升' }
  ];

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig<JournalEditDialogData>
  ) {
    this.mode = config.data?.mode || 'create';
    this.initTypeOptions();
  }

  ngOnInit(): void {
    this.initForm();

    // 如果是編輯模式，填充資料
    if (this.mode === 'edit' && this.config.data?.entry) {
      this.form.patchValue(this.config.data.entry);
    }

    // 如果有預設類型，填充類型
    if (this.config.data?.presetType) {
      this.form.patchValue({ type: this.config.data.presetType });
    }

    // 監聽類型變化，動態調整必填欄位
    this.form.get('type')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
    });
  }

  /**
   * 初始化表單
   */
  private initForm(): void {
    this.form = this.fb.group({
      type: ['', Validators.required],
      targetCrop: ['', Validators.required],
      itemName: [''],
      quantity: [null],
      unit: ['c.c.'],
      phi_days: [null],
      timestamp: [new Date(), Validators.required],
      notes: ['']
    });
  }

  /**
   * 初始化操作類型選項
   */
  private initTypeOptions(): void {
    this.typeOptions = [
      { label: JournalTypeLabels[JournalType.PESTICIDE], value: JournalType.PESTICIDE },
      { label: JournalTypeLabels[JournalType.FERTILIZER], value: JournalType.FERTILIZER },
      { label: JournalTypeLabels[JournalType.HARVEST], value: JournalType.HARVEST },
      { label: JournalTypeLabels[JournalType.WEEDING], value: JournalType.WEEDING },
      { label: JournalTypeLabels[JournalType.TILLING], value: JournalType.TILLING },
      { label: JournalTypeLabels[JournalType.OBSERVATION], value: JournalType.OBSERVATION }
    ];
  }

  /**
   * 根據操作類型動態調整驗證規則
   */
  private updateValidators(type: JournalType): void {
    const itemNameControl = this.form.get('itemName');
    const phiDaysControl = this.form.get('phi_days');

    // 重置驗證器
    itemNameControl?.clearValidators();
    phiDaysControl?.clearValidators();

    // 噴藥：資材名稱和 PHI 必填
    if (type === JournalType.PESTICIDE) {
      itemNameControl?.setValidators([Validators.required]);
      phiDaysControl?.setValidators([Validators.required, Validators.min(0)]);
    }
    // 施肥：資材名稱必填
    else if (type === JournalType.FERTILIZER) {
      itemNameControl?.setValidators([Validators.required]);
    }

    itemNameControl?.updateValueAndValidity();
    phiDaysControl?.updateValueAndValidity();
  }

  /**
   * 是否顯示資材名稱欄位
   */
  get showItemName(): boolean {
    const type = this.form.get('type')?.value;
    return type === JournalType.PESTICIDE || type === JournalType.FERTILIZER;
  }

  /**
   * 是否顯示劑量欄位
   */
  get showQuantity(): boolean {
    return this.showItemName;
  }

  /**
   * 是否顯示 PHI 欄位
   */
  get showPHI(): boolean {
    return this.form.get('type')?.value === JournalType.PESTICIDE;
  }

  /**
   * 計算安全採收日期
   */
  get safeHarvestDate(): Date | null {
    const phiDays = this.form.get('phi_days')?.value;
    const timestamp = this.form.get('timestamp')?.value;

    if (phiDays && timestamp) {
      const date = new Date(timestamp);
      date.setDate(date.getDate() + phiDays);
      return date;
    }

    return null;
  }

  /**
   * 取消
   */
  cancel(): void {
    this.ref.close();
  }

  /**
   * 儲存
   */
  save(): void {
    if (this.form.valid) {
      const formValue = this.form.value;

      // 建立 JournalEntry 物件
      const entry: Partial<JournalEntry> = {
        id: this.config.data?.entry?.id || `j${Date.now()}`,
        userId: 'user001', // TODO: 從登入系統取得
        type: formValue.type,
        targetCrop: formValue.targetCrop,
        itemName: formValue.itemName || undefined,
        quantity: formValue.quantity || undefined,
        unit: formValue.unit || undefined,
        phi_days: formValue.phi_days || undefined,
        timestamp: formValue.timestamp,
        notes: formValue.notes || undefined
      };

      // 如果是噴藥，計算 phi_end_date
      if (entry.type === JournalType.PESTICIDE && entry.phi_days) {
        entry.phi_end_date = this.safeHarvestDate || undefined;
      }

      this.ref.close(entry);
    } else {
      // 標記所有欄位為 touched 以顯示錯誤訊息
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * 取得欄位錯誤訊息
   */
  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required')) {
      return '此欄位為必填';
    }
    if (control?.hasError('min')) {
      return '數值不可小於 0';
    }
    return '';
  }
}
