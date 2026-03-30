import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
  JournalTypeLabels,
  JournalTypeIcons,
  JournalTypeColors
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
  styleUrl: './journal-edit-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JournalEditDialogComponent implements OnInit {
  form!: FormGroup;
  mode: 'create' | 'edit' = 'create';

  // 下拉選項
  typeOptions: DropdownOption[] = [];
  cropOptions: DropdownOption[] = [
    { label: '青江菜', value: '青江菜' },
    { label: '高麗菜', value: '高麗菜' },
    { label: '小白菜', value: '小白菜' },
    { label: '菠菜', value: '菠菜' },
    { label: '萵苣', value: '萵苣' },
    { label: '空心菜', value: '空心菜' },
    { label: '芥菜', value: '芥菜' },
    { label: '油菜', value: '油菜' }
  ];
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
   * 刪除紀錄
   */
  delete(): void {
    if (this.mode === 'edit' && this.config.data?.entry) {
      if (confirm('確定要刪除這筆紀錄嗎？此動作無法復原。')) {
        this.ref.close({ delete: true, id: this.config.data.entry.id });
      }
    }
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

  /**
   * 選擇操作類型
   */
  selectType(type: JournalType): void {
    this.form.patchValue({ type });
    this.form.get('type')?.markAsTouched();
  }

  /**
   * 取得操作類型的 icon
   */
  getTypeIcon(type: JournalType): string {
    return JournalTypeIcons[type] || 'pi-circle';
  }

  /**
   * 取得操作類型按鈕的 class
   */
  getTypeButtonClass(type: JournalType): string {
    const selectedType = this.form.get('type')?.value;
    const isSelected = selectedType === type;

    // 基礎樣式
    let classes = '';

    // 根據類型設定顏色
    switch (type) {
      case JournalType.PESTICIDE:
        classes = isSelected
          ? 'bg-danger-100 border-danger-500 text-danger-700'
          : 'bg-beige-50 border-danger-200 text-danger-600 hover:bg-danger-50 hover:border-danger-300';
        break;
      case JournalType.FERTILIZER:
        classes = isSelected
          ? 'bg-primary-100 border-primary-500 text-primary-700'
          : 'bg-beige-50 border-primary-200 text-primary-600 hover:bg-primary-50 hover:border-primary-300';
        break;
      case JournalType.HARVEST:
        classes = isSelected
          ? 'bg-accent-100 border-accent-500 text-accent-800'
          : 'bg-beige-50 border-accent-300 text-accent-700 hover:bg-accent-50 hover:border-accent-400';
        break;
      case JournalType.OBSERVATION:
        classes = isSelected
          ? 'bg-secondary-100 border-secondary-500 text-secondary-800'
          : 'bg-beige-50 border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400';
        break;
      case JournalType.WEEDING:
        classes = isSelected
          ? 'bg-success-100 border-success-500 text-success-800'
          : 'bg-beige-50 border-success-300 text-success-700 hover:bg-success-50 hover:border-success-400';
        break;
      case JournalType.TILLING:
        classes = isSelected
          ? 'bg-surface-200 border-surface-500 text-surface-800'
          : 'bg-beige-50 border-surface-300 text-surface-700 hover:bg-surface-50 hover:border-surface-400';
        break;
      default:
        classes = isSelected
          ? 'bg-surface-200 border-surface-500 text-surface-800'
          : 'bg-beige-50 border-surface-300 text-surface-700 hover:bg-surface-100 hover:border-surface-400';
    }

    return classes;
  }
}
