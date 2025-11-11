/**
 * 編輯器的 404 頁面
 * 當日期格式無效時顯示
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditorNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">無效的日期</h2>
        <p className="text-gray-600 mb-6">
          您輸入的日期格式不正確。請確認 URL 是否正確。
        </p>

        <Link href="/today">
          <Button>回到今天</Button>
        </Link>
      </div>
    </div>
  );
}
