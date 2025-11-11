/**
 * Hero Section
 */

'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 sm:py-32">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-8">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              輸出導向學習工具
            </span>
          </div>

          {/* 標題 */}
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            用輸出驗證
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
              你的理解
            </span>
          </h1>

          {/* 副標題 */}
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Lumina 是一個心智圖式的學習工具，透過每日輸出機制，
            幫助你主動驗證知識理解，自動累積學習軌跡，視覺化知識演化過程。
          </p>

          {/* CTA 按鈕 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                開始使用
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/today">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                查看示範
              </Button>
            </Link>
          </div>

          {/* 截圖預覽 */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-linear-to-t from-blue-50 to-transparent h-32 bottom-0 -z-10" />
            <div className="w-full h-64 bg-linear-to-br from-blue-100 to-purple-100 rounded-lg shadow-2xl flex items-center justify-center">
              <p className="text-gray-500">編輯器預覽</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
