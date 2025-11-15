/**
 * Mock 設定頁面資料
 */

/**
 * 使用者設定
 */
export interface UserSettings {
  // 個人資料
  profile: {
    name: string;
    email: string;
    avatar?: string;
  };

  // 偏好設定
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'zh-TW' | 'en';
    dateFormat: 'yyyy/MM/dd' | 'MM/dd/yyyy' | 'dd/MM/yyyy';
    timeFormat: '12h' | '24h';
  };

  // 編輯器設定
  editor: {
    autoSave: boolean;
    autoSaveInterval: number; // 秒
    defaultView: 'radial' | 'outliner' | 'logicChart';
    showMinimap: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };

  // 快捷鍵設定
  shortcuts: {
    enabled: boolean;
    customShortcuts: Record<string, string>;
  };

  // 隱私設定
  privacy: {
    analyticsEnabled: boolean;
    crashReportEnabled: boolean;
  };

  // 通知設定
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };

  // 資料管理
  data: {
    storageUsed: number; // MB
    storageLimit: number; // MB
    lastBackup?: Date;
    autoBackup: boolean;
  };
}

/**
 * Mock 使用者設定資料
 */
export const MOCK_USER_SETTINGS: UserSettings = {
  profile: {
    name: '測試使用者',
    email: 'test@example.com',
    avatar: undefined,
  },

  preferences: {
    theme: 'system',
    language: 'zh-TW',
    dateFormat: 'yyyy/MM/dd',
    timeFormat: '24h',
  },

  editor: {
    autoSave: true,
    autoSaveInterval: 30,
    defaultView: 'radial',
    showMinimap: true,
    fontSize: 'medium',
  },

  shortcuts: {
    enabled: true,
    customShortcuts: {},
  },

  privacy: {
    analyticsEnabled: true,
    crashReportEnabled: true,
  },

  notifications: {
    email: true,
    push: false,
    desktop: true,
  },

  data: {
    storageUsed: 45.2,
    storageLimit: 1024,
    lastBackup: new Date('2024-11-10T10:30:00'),
    autoBackup: true,
  },
};
