/**
 * 中間裝飾點點組件
 * 用於頁面佈局中的視覺分隔裝飾
 */

export const DecoratorDots = () => {
  // Pattern: Circle, Pill, Pill, Circle, Pill, Pill, Circle
  // Spacing: Large gap between groups, small gap between pills
  const items = [
    { type: 'circle', mb: 'mb-16' },
    { type: 'pill', mb: 'mb-3' },
    { type: 'pill', mb: 'mb-16' },
    { type: 'circle', mb: 'mb-16' },
    { type: 'pill', mb: 'mb-3' },
    { type: 'pill', mb: 'mb-16' },
    { type: 'circle', mb: 'mb-0' },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center py-10 select-none opacity-60 h-full"
      style={{ transform: 'translateY(-4%)' }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={`
            bg-stone-300/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)]
            ${item.type === 'circle' ? 'w-3 h-3 rounded-full' : 'w-3 h-6 rounded-full'}
            ${item.mb}
          `}
        />
      ))}
    </div>
  );
};
