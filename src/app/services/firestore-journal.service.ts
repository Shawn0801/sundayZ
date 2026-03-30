import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { JournalEntry } from '../interfaces/JournalEntry';

@Injectable({
  providedIn: 'root'
})
export class FirestoreJournalService {
  private firestore: Firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'journal_entries';

  /**
   * 取得 journal_entries Collection 參考
   */
  private getCollectionRef(): CollectionReference<DocumentData> {
    return collection(this.firestore, this.COLLECTION_NAME);
  }

  /**
   * 轉換 Firestore 文件資料為 JournalEntry
   * 處理 Timestamp → Date 轉換
   * 支援多種日期格式：Timestamp、Date、字串
   */
  private convertFirestoreToJournalEntry(data: DocumentData): JournalEntry {

    const timestamp = this.safeConvertToDate(data['timestamp'], 'timestamp');
    const phi_end_date = data['phi_end_date'] ? this.safeConvertToDate(data['phi_end_date'], 'phi_end_date') : undefined;

    console.log('🔄 轉換 Firestore 資料:', {
      id: data['id'],
      rawTimestamp: data['timestamp'],
      convertedTimestamp: timestamp,
      timestampType: typeof data['timestamp']
    });

    return {
      id: data['id'] as string,
      userId: data['userId'] as string,
      timestamp: timestamp,
      type: data['type'],
      targetCrop: data['targetCrop'] as string,
      itemName: data['itemName'] as string | undefined,
      quantity: data['quantity'] as number | undefined,
      unit: data['unit'] as string | undefined,
      phi_days: data['phi_days'] as number | undefined,
      phi_end_date: phi_end_date,
      notes: data['notes'] as string | undefined,
      imageUrl: data['imageUrl'] as string | undefined
    };
  }

  /**
   * 安全地將各種格式的日期轉換為 Date 物件
   * @param value 日期值（可能是 Timestamp、Date、字串或數字）
   * @param fieldName 欄位名稱（用於錯誤訊息）
   * @returns Date 物件
   */
  private safeConvertToDate(value: any, fieldName: string): Date {
    try {
      // 1. 如果是 Firestore Timestamp
      if (value && typeof value === 'object' && 'toDate' in value) {
        return value.toDate();
      }

      // 2. 如果已經是 Date 物件
      if (value instanceof Date) {
        return value;
      }

      // 3. 如果是字串或數字，嘗試轉換
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      // 4. 都失敗時，記錄錯誤並返回當前時間
      console.error(`❌ 無法轉換 ${fieldName}:`, value, typeof value);
      return new Date();
    } catch (error) {
      console.error(`❌ 轉換 ${fieldName} 時發生例外:`, error);
      return new Date();
    }
  }

  /**
   * 轉換 JournalEntry 為 Firestore 資料格式
   * 處理 Date → Timestamp 轉換
   */
  private convertJournalEntryToFirestore(entry: JournalEntry): DocumentData {
    const data: DocumentData = {
      id: entry.id,
      userId: entry.userId,
      timestamp: Timestamp.fromDate(entry.timestamp),
      type: entry.type,
      targetCrop: entry.targetCrop
    };

    // 選填欄位：只有值存在時才加入
    if (entry.itemName) data['itemName'] = entry.itemName;
    if (entry.quantity !== undefined) data['quantity'] = entry.quantity;
    if (entry.unit) data['unit'] = entry.unit;
    if (entry.phi_days !== undefined) data['phi_days'] = entry.phi_days;
    if (entry.phi_end_date) data['phi_end_date'] = Timestamp.fromDate(entry.phi_end_date);
    if (entry.notes) data['notes'] = entry.notes;
    if (entry.imageUrl) data['imageUrl'] = entry.imageUrl;

    return data;
  }

  /**
   * 新增日誌
   * @param entry 日誌條目（可不包含 id，使用 Firestore 自動生成）
   * @returns Observable<string> 文件 ID
   */
  addJournalEntry(entry: JournalEntry): Observable<string> {
    const firestoreData = this.convertJournalEntryToFirestore(entry);

    // 使用自訂 ID（entry.id）作為文件 ID
    const docRef = doc(this.firestore, this.COLLECTION_NAME, entry.id);

    return from(
      setDoc(docRef, firestoreData).then(() => entry.id)
    );
  }

  /**
   * 取得特定使用者的所有日誌（一次性查詢）
   * @param userId 使用者 ID
   * @returns Observable<JournalEntry[]>
   */
  getUserJournalEntries(userId: string): Observable<JournalEntry[]> {
    const q = query(
      this.getCollectionRef(),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => this.convertFirestoreToJournalEntry(doc.data()));
      })
    );
  }

  /**
   * 即時監聽特定使用者的所有日誌（自動更新）
   * @param userId 使用者 ID
   * @returns Observable<JournalEntry[]> 即時資料流
   */
  watchUserJournalEntries(userId: string): Observable<JournalEntry[]> {
    console.log('📡 建立 Firestore 即時監聽:', {
      collection: this.COLLECTION_NAME,
      userId: userId
    });

    // 使用 onSnapshot 直接監聽，避免 SDK instance 不匹配問題
    return new Observable<JournalEntry[]>(observer => {
      try {
        const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
        const q = query(
          collectionRef,
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );

        console.log('🔧 Query 建立成功，開始監聽...');

        // 使用 onSnapshot 進行即時監聽
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            console.log('📦 收到 Firestore 更新:', snapshot.docs.length, '筆');

            const entries: JournalEntry[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return this.convertFirestoreToJournalEntry(data);
            });

            observer.next(entries);
          },
          (error) => {
            console.error('❌ Firestore 監聽錯誤:', error);
            observer.error(error);
          }
        );

        // 返回清理函數
        return () => {
          console.log('🔌 取消 Firestore 監聽');
          unsubscribe();
        };
      } catch (error) {
        console.error('❌ 建立 Firestore 監聽失敗:', error);
        observer.error(error);
        // 返回空的清理函數
        return () => {};
      }
    });
  }

  /**
   * 取得特定日期範圍的日誌
   * @param userId 使用者 ID
   * @param startDate 開始日期
   * @param endDate 結束日期
   * @returns Observable<JournalEntry[]>
   */
  getJournalsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Observable<JournalEntry[]> {
    const q = query(
      this.getCollectionRef(),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => this.convertFirestoreToJournalEntry(doc.data()));
      })
    );
  }

  /**
   * 取得單一日誌
   * @param entryId 日誌 ID
   * @returns Observable<JournalEntry | null>
   */
  getJournalEntry(entryId: string): Observable<JournalEntry | null> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, entryId);

    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return this.convertFirestoreToJournalEntry(docSnap.data());
        }
        return null;
      })
    );
  }

  /**
   * 更新日誌
   * @param entry 日誌條目（必須包含 id）
   * @returns Observable<void>
   */
  updateJournalEntry(entry: JournalEntry): Observable<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, entry.id);
    const firestoreData = this.convertJournalEntryToFirestore(entry);

    return from(updateDoc(docRef, firestoreData));
  }

  /**
   * 刪除日誌
   * @param entryId 日誌 ID
   * @returns Observable<void>
   */
  deleteJournalEntry(entryId: string): Observable<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, entryId);
    return from(deleteDoc(docRef));
  }

  /**
   * 取得最近的 PHI 警示（安全採收期倒數中的噴藥紀錄）
   * @param userId 使用者 ID
   * @returns Observable<JournalEntry | null>
   */
  getActivePesticideEntry(userId: string): Observable<JournalEntry | null> {
    const now = Timestamp.now();

    const q = query(
      this.getCollectionRef(),
      where('userId', '==', userId),
      where('type', '==', 'Pesticide'),
      where('phi_end_date', '>', now),
      orderBy('phi_end_date', 'asc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        return this.convertFirestoreToJournalEntry(snapshot.docs[0].data());
      })
    );
  }

  /**
   * 批次新增日誌（用於資料遷移）
   * @param entries 日誌條目陣列
   * @returns Observable<string[]> 文件 ID 陣列
   */
  batchAddJournalEntries(entries: JournalEntry[]): Observable<string[]> {
    const promises = entries.map(entry => {
      const firestoreData = this.convertJournalEntryToFirestore(entry);
      const docRef = doc(this.firestore, this.COLLECTION_NAME, entry.id);
      return setDoc(docRef, firestoreData).then(() => entry.id);
    });

    return from(Promise.all(promises));
  }
}
