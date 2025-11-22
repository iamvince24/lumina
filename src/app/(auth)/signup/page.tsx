/**
 * 註冊頁面
 * 路由: /signup
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useSignUp } from '@/hooks/useAuth';

export default function SignUpPage() {
  const router = useRouter();
  const { execute: signUp, loading, error: signUpError } = useSignUp();

  // 表單狀態
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  /**
   * 密碼強度驗證
   */
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return '密碼至少需要 8 個字元';
    }

    if (!/[A-Z]/.test(password)) {
      return '密碼需要包含至少一個大寫字母';
    }

    if (!/[a-z]/.test(password)) {
      return '密碼需要包含至少一個小寫字母';
    }

    if (!/[0-9]/.test(password)) {
      return '密碼需要包含至少一個數字';
    }

    return null;
  };

  /**
   * 處理表單提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 驗證
    if (!name || !email || !password || !confirmPassword) {
      setError('請填寫所有欄位');
      return;
    }

    if (!email.includes('@')) {
      setError('請輸入有效的 Email');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    // 執行註冊
    const success = await signUp(email, password, name);

    if (success) {
      // 重導向到今天的編輯頁面
      router.push('/today');
    } else {
      setError(signUpError || '註冊失敗，請稍後再試');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">註冊 Lumina</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 錯誤訊息 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 姓名欄位 */}
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                type="text"
                placeholder="你的名字"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

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
                placeholder="至少 8 個字元"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">需包含大小寫字母和數字</p>
            </div>

            {/* 確認密碼欄位 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認密碼</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="再次輸入密碼"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* 提交按鈕 */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  註冊中...
                </>
              ) : (
                '註冊'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            已經有帳號了？
            <Link href="/login" className="text-blue-600 hover:underline ml-1">
              立即登入
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
