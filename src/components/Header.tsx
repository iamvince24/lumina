/**
 * Header 組件
 * 包含使用者資訊和登出按鈕
 *
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */

'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// ⚠️ 暫時使用假資料 Hook，待後端 API 完成後替換為真實 API
import { useMockSignOut } from '@/__mocks__/hooks';
// import { api } from '@/utils/api';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  // ⚠️ 暫時使用假資料 mutation，待後端 API 完成後替換為真實 API
  const signOutMutation = useMockSignOut();

  // ⚠️ 待後端 API 完成後，替換為真實 API
  // const signOutMutation = api.auth.signOut.useMutation();

  /**
   * 處理登出
   */
  const handleLogout = async () => {
    try {
      // ⚠️ 暫時使用假資料 API，待後端 API 完成後替換為真實 API
      await signOutMutation.mutate();

      // 清除前端狀態
      logout();

      // 重導向到登入頁面
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // 即使 API 失敗，也清除前端狀態
      logout();
      router.push('/login');
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900">Lumina</h1>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>我的帳戶</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                localStorage.removeItem('onboarding_completed');
                window.location.reload();
              }}
            >
              重新開始引導
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
