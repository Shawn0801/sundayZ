/**
 * 清除日誌相關的 localStorage 資料
 *
 * 使用方法：
 * 1. 在瀏覽器中開啟應用
 * 2. 開啟 Console (F12)
 * 3. 複製此檔案內容並貼上執行
 *
 * 或者直接在 Console 執行：
 * localStorage.removeItem('journal_entries');
 * localStorage.removeItem('migration_completed');
 * console.log('✅ 已清除所有日誌相關資料');
 */

(function clearJournalData() {
  console.log('🧹 開始清除日誌相關資料...');

  // 1. 清除日誌資料
  const journalKey = 'journal_entries';
  const journalData = localStorage.getItem(journalKey);

  if (journalData) {
    const entries = JSON.parse(journalData);
    console.log(`📊 找到 ${entries.length} 筆日誌資料`);
    localStorage.removeItem(journalKey);
    console.log('✅ 已清除 journal_entries');
  } else {
    console.log('ℹ️  無日誌資料需要清除');
  }

  // 2. 清除遷移標記
  const migrationKey = 'migration_completed';
  const migrationFlag = localStorage.getItem(migrationKey);

  if (migrationFlag) {
    localStorage.removeItem(migrationKey);
    console.log('✅ 已清除 migration_completed');
  } else {
    console.log('ℹ️  無遷移標記需要清除');
  }

  // 3. 顯示剩餘的 localStorage 項目
  console.log('\n📦 剩餘的 localStorage 項目：');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`  - ${key}`);
  }

  console.log('\n✅ 清除完成！請重新整理頁面。');
})();
