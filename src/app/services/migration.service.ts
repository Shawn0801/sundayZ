import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { FirestoreJournalService } from './firestore-journal.service';
import { AuthService } from './auth.service';
import { JournalEntry } from '../interfaces/JournalEntry';

/**
 * 資料遷移服務
 * 用於將 localStorage 的日誌資料遷移到 Firestore
 */
@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private firestoreJournal = inject(FirestoreJournalService);
  private authService = inject(AuthService);

  private readonly STORAGE_KEY = 'journal_entries';
  private readonly MIGRATION_FLAG_KEY = 'migration_completed';

  /**
   * 檢查是否已完成遷移
   * @returns boolean
   */
  isMigrationCompleted(): boolean {
    return localStorage.getItem(this.MIGRATION_FLAG_KEY) === 'true';
  }

  /**
   * 標記遷移已完成
   */
  private markMigrationCompleted(): void {
    localStorage.setItem(this.MIGRATION_FLAG_KEY, 'true');
  }

  /**
   * 從 localStorage 讀取日誌資料
   * @returns JournalEntry[]
   */
  private loadFromLocalStorage(): JournalEntry[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);

      if (data) {
        const entries: JournalEntry[] = JSON.parse(data);
        // 將日期字串轉換回 Date 物件
        return entries.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          phi_end_date: entry.phi_end_date ? new Date(entry.phi_end_date) : undefined
        }));
      }

      return [];
    } catch (error) {
      console.error('讀取 localStorage 失敗:', error);
      return [];
    }
  }

  /**
   * 執行資料遷移
   * 將 localStorage 的日誌資料批次匯入 Firestore
   *
   * @returns Observable<MigrationResult>
   *
   * 使用範例：
   * ```typescript
   * this.migrationService.migrate().subscribe({
   *   next: (result) => {
   *     console.log(`遷移完成：成功 ${result.success} 筆，失敗 ${result.failed} 筆`);
   *   },
   *   error: (error) => {
   *     console.error('遷移失敗:', error);
   *   }
   * });
   * ```
   */
  migrate(): Observable<MigrationResult> {
    // 檢查是否已遷移
    if (this.isMigrationCompleted()) {
      console.log('資料已完成遷移，跳過');
      return from([{ success: 0, failed: 0, message: '已完成遷移' }]);
    }

    // 檢查使用者是否登入
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('使用者未登入，無法執行遷移');
      return from([{ success: 0, failed: 0, message: '使用者未登入' }]);
    }

    // 從 localStorage 讀取資料
    const localEntries = this.loadFromLocalStorage();

    if (localEntries.length === 0) {
      console.log('localStorage 無資料需要遷移');
      this.markMigrationCompleted();
      return from([{ success: 0, failed: 0, message: '無資料需要遷移' }]);
    }

    console.log(`開始遷移 ${localEntries.length} 筆日誌資料...`);

    // 更新所有資料的 userId 為當前使用者
    const entriesWithUserId = localEntries.map(entry => ({
      ...entry,
      userId: currentUser.uid
    }));

    // 批次寫入 Firestore
    return this.firestoreJournal.batchAddJournalEntries(entriesWithUserId).pipe(
      map(docIds => {
        const result: MigrationResult = {
          success: docIds.length,
          failed: localEntries.length - docIds.length,
          message: `成功遷移 ${docIds.length} 筆，失敗 ${localEntries.length - docIds.length} 筆`
        };

        // 標記遷移完成
        this.markMigrationCompleted();

        console.log('遷移完成:', result);
        return result;
      })
    );
  }

  /**
   * 重置遷移標記（用於測試）
   * ⚠️ 危險操作：會重新執行遷移，可能造成資料重複
   */
  resetMigrationFlag(): void {
    localStorage.removeItem(this.MIGRATION_FLAG_KEY);
    console.warn('已重置遷移標記，下次啟動時會重新遷移');
  }

  /**
   * 清除 localStorage 的日誌資料（遷移完成後可選）
   * ⚠️ 危險操作：會永久刪除 localStorage 資料
   */
  clearLocalStorage(): void {
    if (confirm('確定要清除 localStorage 的日誌資料嗎？此操作無法復原。')) {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('已清除 localStorage 的日誌資料');
    }
  }

  /**
   * 取得遷移資訊
   * @returns MigrationInfo
   */
  getMigrationInfo(): MigrationInfo {
    const isCompleted = this.isMigrationCompleted();
    const localEntries = this.loadFromLocalStorage();
    const currentUser = this.authService.getCurrentUser();

    return {
      isCompleted,
      localEntriesCount: localEntries.length,
      canMigrate: !!currentUser && localEntries.length > 0,
      userId: currentUser?.uid || null
    };
  }
}

/**
 * 遷移結果
 */
export interface MigrationResult {
  success: number;      // 成功遷移的數量
  failed: number;       // 失敗的數量
  message: string;      // 訊息
}

/**
 * 遷移資訊
 */
export interface MigrationInfo {
  isCompleted: boolean;           // 是否已完成遷移
  localEntriesCount: number;      // localStorage 中的資料數量
  canMigrate: boolean;            // 是否可以執行遷移
  userId: string | null;          // 當前使用者 ID
}
