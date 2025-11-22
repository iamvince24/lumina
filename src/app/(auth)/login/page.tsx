/**
 * 登入頁面
 * 路由: /login
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useSignIn } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { execute: signIn, loading, error: signInError } = useSignIn();

  // 表單狀態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /**
   * 處理表單提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 驗證
    if (!email || !password) {
      setError('請填寫所有欄位');
      return;
    }

    if (!email.includes('@')) {
      setError('請輸入有效的 Email');
      return;
    }

    // 執行登入
    const success = await signIn(email, password);

    if (success) {
      // 取得重導向 URL（如果有）
      const redirectUrl = searchParams.get('redirect') || '/today';
      // 重導向
      router.push(redirectUrl);
    } else {
      setError(signInError || '登入失敗，請檢查帳號密碼');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">登入 Lumina</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 錯誤訊息 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email 欄位 */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* 密碼欄位 */}
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* 提交按鈕 */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登入中...
                </>
              ) : (
                '登入'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            還沒有帳號？
            <Link href="/signup" className="text-blue-600 hover:underline ml-1">
              立即註冊
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
