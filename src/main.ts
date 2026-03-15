import { bootstrapApplication } from '@angular/platform-browser';
import { getAppConfig } from './app/app.config';
import { App } from './app/app';
import { Environment } from './app/models/environment.interface';

// 在應用啟動前載入 Firebase 配置
async function initializeApp() {
  try {
    console.log('開始載入 Firebase 配置...');

    const response = await fetch('https://get-firebase-settings-342016522608.europe-west1.run.app', {
      method: 'GET',
      headers: {
        'X-Custom-Auth': 'nicesunday-secure-2026'
      }
    });

    console.log('API 回應狀態:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 錯誤回應:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const environment: Environment = await response.json();
    console.log('Firebase 配置載入完成');

    // 使用載入的配置建立 appConfig
    const appConfig = getAppConfig(environment);

    // 配置載入完成後啟動應用
    await bootstrapApplication(App, appConfig);
  } catch (error) {
    console.error('載入 Firebase 配置失敗:', error);
    throw error;
  }
}

initializeApp().catch((err) => console.error(err));
