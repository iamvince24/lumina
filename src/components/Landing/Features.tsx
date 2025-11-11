/**
 * Features Section
 */

import { Zap, GitBranch, Calendar, Eye } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: '低摩擦輸出',
    description: '心智圖式編輯，打開就能開始寫，想到什麼就寫什麼。',
  },
  {
    icon: GitBranch,
    title: '自動累積',
    description: '系統自動將每日輸出累積到 Topic，形成知識演化軌跡。',
  },
  {
    icon: Calendar,
    title: '時間軸回顧',
    description: '月曆視圖讓你輕鬆回顧過去的學習記錄。',
  },
  {
    icon: Eye,
    title: '多視圖切換',
    description: '支援放射狀、大綱、邏輯圖三種視圖，適應不同思考模式。',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            為什麼選擇 Lumina
          </h2>
          <p className="text-lg text-gray-600">
            專為主動學習者設計的輸出導向工具
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
