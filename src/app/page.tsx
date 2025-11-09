/**
 * 首頁 - 重導向到今天的編輯頁面
 */
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/today');
}
