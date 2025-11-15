import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "心智圖編輯器 | Lumina",
  description: "專注開發的心智圖編輯器",
}

export default function MindMapEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full bg-background">
      {children}
    </div>
  )
}
