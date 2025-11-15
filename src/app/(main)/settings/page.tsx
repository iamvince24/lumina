/**
 * 設定頁面
 * 路由: /settings
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Palette,
  FileText,
  Keyboard,
  Lock,
  Bell,
  Database,
  Save,
} from 'lucide-react';
// ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
import {
  useMockGetUserSettings,
  useMockUpdateUserSettings,
} from '@/__mocks__/hooks';

export default function SettingsPage() {
  const { data: settings, isLoading } = useMockGetUserSettings();
  const updateSettings = useMockUpdateUserSettings({
    onSuccess: () => {
      toast.success('設定已儲存');
    },
    onError: (error) => {
      toast.error('儲存失敗: ' + error.message);
    },
  });

  const [localSettings, setLocalSettings] = useState<any>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = () => {
    if (localSettings) {
      updateSettings.mutate(localSettings);
    }
  };

  const updateField = (section: string, field: string, value: any) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (isLoading || !localSettings) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-600 mt-2">
          管理你的個人資料、偏好設定和應用程式配置
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            個人資料
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            外觀
          </TabsTrigger>
          <TabsTrigger value="editor">
            <FileText className="w-4 h-4 mr-2" />
            編輯器
          </TabsTrigger>
          <TabsTrigger value="shortcuts">
            <Keyboard className="w-4 h-4 mr-2" />
            快捷鍵
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Lock className="w-4 h-4 mr-2" />
            隱私
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            通知
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="w-4 h-4 mr-2" />
            資料
          </TabsTrigger>
        </TabsList>

        {/* 個人資料 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>個人資料</CardTitle>
              <CardDescription>更新你的個人資訊</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名稱</Label>
                <Input
                  id="name"
                  value={localSettings.profile.name}
                  onChange={(e) =>
                    updateField('profile', 'name', e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={localSettings.profile.email}
                  onChange={(e) =>
                    updateField('profile', 'email', e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 外觀設定 */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>外觀設定</CardTitle>
              <CardDescription>自訂應用程式的外觀</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>主題</Label>
                <Select
                  value={localSettings.preferences.theme}
                  onValueChange={(value) =>
                    updateField('preferences', 'theme', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">淺色</SelectItem>
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="system">跟隨系統</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>語言</Label>
                <Select
                  value={localSettings.preferences.language}
                  onValueChange={(value) =>
                    updateField('preferences', 'language', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-TW">繁體中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>日期格式</Label>
                <Select
                  value={localSettings.preferences.dateFormat}
                  onValueChange={(value) =>
                    updateField('preferences', 'dateFormat', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yyyy/MM/dd">YYYY/MM/DD</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>時間格式</Label>
                <Select
                  value={localSettings.preferences.timeFormat}
                  onValueChange={(value) =>
                    updateField('preferences', 'timeFormat', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 小時制</SelectItem>
                    <SelectItem value="12h">12 小時制</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 編輯器設定 */}
        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>編輯器設定</CardTitle>
              <CardDescription>自訂編輯器行為</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自動儲存</Label>
                  <p className="text-sm text-gray-500">
                    自動儲存你的變更
                  </p>
                </div>
                <Switch
                  checked={localSettings.editor.autoSave}
                  onCheckedChange={(checked) =>
                    updateField('editor', 'autoSave', checked)
                  }
                />
              </div>

              {localSettings.editor.autoSave && (
                <div className="space-y-2 ml-4">
                  <Label>自動儲存間隔（秒）</Label>
                  <Input
                    type="number"
                    value={localSettings.editor.autoSaveInterval}
                    onChange={(e) =>
                      updateField(
                        'editor',
                        'autoSaveInterval',
                        parseInt(e.target.value)
                      )
                    }
                    min={10}
                    max={300}
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>預設視圖</Label>
                <Select
                  value={localSettings.editor.defaultView}
                  onValueChange={(value) =>
                    updateField('editor', 'defaultView', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radial">放射狀</SelectItem>
                    <SelectItem value="outliner">大綱模式</SelectItem>
                    <SelectItem value="logicChart">邏輯圖</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>顯示小地圖</Label>
                  <p className="text-sm text-gray-500">
                    在編輯器中顯示導航小地圖
                  </p>
                </div>
                <Switch
                  checked={localSettings.editor.showMinimap}
                  onCheckedChange={(checked) =>
                    updateField('editor', 'showMinimap', checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>字體大小</Label>
                <Select
                  value={localSettings.editor.fontSize}
                  onValueChange={(value) =>
                    updateField('editor', 'fontSize', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">小</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="large">大</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 快捷鍵設定 */}
        <TabsContent value="shortcuts">
          <Card>
            <CardHeader>
              <CardTitle>快捷鍵設定</CardTitle>
              <CardDescription>自訂鍵盤快捷鍵</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>啟用快捷鍵</Label>
                  <p className="text-sm text-gray-500">
                    啟用鍵盤快捷鍵功能
                  </p>
                </div>
                <Switch
                  checked={localSettings.shortcuts.enabled}
                  onCheckedChange={(checked) =>
                    updateField('shortcuts', 'enabled', checked)
                  }
                />
              </div>

              {localSettings.shortcuts.enabled && (
                <div className="space-y-4 ml-4">
                  <div className="text-sm text-gray-500">
                    快捷鍵自訂功能即將推出...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 隱私設定 */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>隱私設定</CardTitle>
              <CardDescription>管理你的隱私偏好</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>分析資料收集</Label>
                  <p className="text-sm text-gray-500">
                    幫助我們改善應用程式
                  </p>
                </div>
                <Switch
                  checked={localSettings.privacy.analyticsEnabled}
                  onCheckedChange={(checked) =>
                    updateField('privacy', 'analyticsEnabled', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>錯誤回報</Label>
                  <p className="text-sm text-gray-500">
                    自動傳送錯誤報告
                  </p>
                </div>
                <Switch
                  checked={localSettings.privacy.crashReportEnabled}
                  onCheckedChange={(checked) =>
                    updateField('privacy', 'crashReportEnabled', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知設定 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>管理通知偏好</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email 通知</Label>
                  <p className="text-sm text-gray-500">
                    接收 Email 通知
                  </p>
                </div>
                <Switch
                  checked={localSettings.notifications.email}
                  onCheckedChange={(checked) =>
                    updateField('notifications', 'email', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>推送通知</Label>
                  <p className="text-sm text-gray-500">
                    接收推送通知
                  </p>
                </div>
                <Switch
                  checked={localSettings.notifications.push}
                  onCheckedChange={(checked) =>
                    updateField('notifications', 'push', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>桌面通知</Label>
                  <p className="text-sm text-gray-500">
                    顯示桌面通知
                  </p>
                </div>
                <Switch
                  checked={localSettings.notifications.desktop}
                  onCheckedChange={(checked) =>
                    updateField('notifications', 'desktop', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 資料管理 */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>資料管理</CardTitle>
              <CardDescription>管理你的資料和儲存空間</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">儲存空間使用量</span>
                  <span className="font-medium">
                    {localSettings.data.storageUsed} MB / {localSettings.data.storageLimit} MB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(localSettings.data.storageUsed / localSettings.data.storageLimit) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自動備份</Label>
                  <p className="text-sm text-gray-500">
                    定期自動備份你的資料
                  </p>
                </div>
                <Switch
                  checked={localSettings.data.autoBackup}
                  onCheckedChange={(checked) =>
                    updateField('data', 'autoBackup', checked)
                  }
                />
              </div>

              {localSettings.data.lastBackup && (
                <div className="text-sm text-gray-500">
                  最後備份時間:{' '}
                  {new Date(localSettings.data.lastBackup).toLocaleString('zh-TW')}
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  立即備份
                </Button>
                <Button variant="outline" className="w-full">
                  匯出所有資料
                </Button>
                <Button variant="destructive" className="w-full">
                  清除快取
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 儲存按鈕 */}
      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={() => setLocalSettings(settings)}>
          取消
        </Button>
        <Button onClick={handleSave} disabled={updateSettings.isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isLoading ? '儲存中...' : '儲存設定'}
        </Button>
      </div>
    </div>
  );
}
