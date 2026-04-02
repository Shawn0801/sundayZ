export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * GCP Vertex AI 配置
 * 用於 agriRisk 農業風險預測模型
 */
export interface VertexAIConfig {
  projectId: string;
  location: string;
  endpointId: string;
}

export interface Environment {
  production: boolean;
  firebase: FirebaseConfig;
  vertexAI?: VertexAIConfig;
  geminiApiKey?: string;
  geminiModel?: string;
}
