import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "邏輯圖編輯器 | Lumina",
  description: "專注開發的邏輯圖編輯器",
}

export default function LogicChartEditorLayout({
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
