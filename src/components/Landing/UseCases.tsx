/**
 * Use Cases Section
 */

const useCases = [
  {
    title: '學習新技術',
    description: '每天記錄學習的新概念，系統自動累積成完整的知識體系。',
    example: '學習 React → 記錄 Hooks、Context、Performance 等概念',
  },
  {
    title: '準備面試',
    description: '透過時間軸回顧過去的學習記錄，快速複習重點概念。',
    example: '面試前一週 → 回顧過去 3 個月的學習軌跡',
  },
  {
    title: '每日反思',
    description: '記錄工作中的學習和思考，形成個人知識庫。',
    example: '每天睡前 → 記錄今天學到的東西和遇到的問題',
  },
];

export function UseCases() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            適合的使用場景
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-600 mb-4">{useCase.description}</p>
              <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
                💡 {useCase.example}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
