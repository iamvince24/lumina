/**
 * 特定日期編輯器
 */
interface EditorPageProps {
  params: {
    date: string;
  };
}

export default function EditorPage({ params }: EditorPageProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">編輯器: {params.date}</h1>
      <p className="text-gray-600 mt-2">這裡將顯示該日期的心智圖</p>
    </div>
  );
}
