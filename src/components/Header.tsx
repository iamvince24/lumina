/**
 * Header 組件
 * 暫時移除登入/登出功能，專注於應用程式功能開發
 *
 * TODO: 完成應用程式功能開發後，重新啟用使用者認證
 */

'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function Header() {
  /**
   * 重新開始引導
   */
  const handleRestartOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    window.location.reload();
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900">Lumina</h1>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRestartOnboarding}
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        重新開始引導
      </Button>
    </header>
  );
}

/*
// 原始 Header 組件（包含認證功能，已暫時禁用）

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
import { useMockSignOut } from '@/__mocks__/hooks';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const signOutMutation = useMockSignOut();

  const handleLogout = async () => {
    try {
      await signOutMutation.mutate();
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
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
*/
