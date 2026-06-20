import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton mirror of the stock page while its catalogue streams in. */
export default function StockLoading() {
  return (
    <div className="stack" aria-busy="true" role="status" aria-label="Loading stock">
      <div className="cols4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="card card-pad" key={i}>
            <Skeleton w={26} h={26} r={8} />
            <Skeleton w="55%" h={26} r={8} style={{ marginTop: 14 }} />
            <Skeleton w="40%" h={11} style={{ marginTop: 12 }} />
          </div>
        ))}
      </div>

      <div className="card card-pad">
        <div className="between" style={{ marginBottom: 16 }}>
          <Skeleton w={140} h={16} />
          <Skeleton w={220} h={30} r={10} />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="row"
            style={{
              gap: 12,
              padding: "12px 0",
              borderTop: i ? "1px solid var(--line)" : undefined,
            }}
          >
            <Skeleton w={32} h={32} r={9} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Skeleton w="40%" h={12} />
              <Skeleton w="24%" h={9} style={{ marginTop: 7 }} />
            </div>
            <Skeleton w={120} h={10} className="hide-mobile" />
            <Skeleton w={56} h={20} r={999} />
          </div>
        ))}
      </div>
    </div>
  );
}
