export default function SkeletonCard() {
  return (
    <div className="sf-card overflow-hidden flex flex-col h-full">
      {/* Cover placeholder */}
      <div className="sf-skeleton aspect-square w-full" style={{ borderRadius: "1.25rem 1.25rem 0 0" }} />

      {/* Details placeholder */}
      <div className="p-4 space-y-3 flex-1">
        <div className="sf-skeleton h-4 w-2/3 rounded" />
        <div className="sf-skeleton h-3 w-full rounded" />
        <div className="sf-skeleton h-3 w-4/5 rounded" />

        <div
          className="flex justify-between items-center pt-3 mt-auto border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="sf-skeleton h-3 w-1/4 rounded" />
          <div className="sf-skeleton h-3 w-1/3 rounded" />
        </div>

        <div className="flex justify-between items-center">
          <div className="sf-skeleton h-8 w-8 rounded-lg" />
          <div className="flex gap-2">
            <div className="sf-skeleton h-8 w-8 rounded-lg" />
            <div className="sf-skeleton h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
