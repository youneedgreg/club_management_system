import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton mirror of the income page while takings stream in. */
export default function IncomeLoading() {
  return (
    <div className="stack" aria-busy="true" role="status" aria-label="Loading income">
      <div className="between">
        <Skeleton w={180} h={26} r={999} />
        <Skeleton w={240} h={30} r={10} />
      </div>

      <div className="cols4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="card card-pad" key={i}>
            <Skeleton w={26} h={26} r={8} />
            <Skeleton w="55%" h={26} r={8} style={{ marginTop: 14 }} />
            <Skeleton w="40%" h={11} style={{ marginTop: 12 }} />
          </div>
        ))}
      </div>

      <div className="split">
        <div className="card card-pad">
          <Skeleton w={140} h={16} style={{ marginBottom: 18 }} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 150 }}>
            {[40, 58, 72, 90, 100, 86, 60, 38].map((p, i) => (
              <Skeleton key={i} h={`${p}%`} r="6px 6px 3px 3px" style={{ flex: 1, maxWidth: 30 }} />
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <Skeleton w={140} h={16} style={{ marginBottom: 18 }} />
          <div className="row" style={{ gap: 16 }}>
            <Skeleton w={116} h={116} r="50%" />
            <div style={{ flex: 1, display: "grid", gap: 14 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} w="80%" h={12} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <Skeleton w={140} h={16} style={{ marginBottom: 16 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="row"
            style={{
              gap: 12,
              padding: "12px 0",
              borderTop: i ? "1px solid var(--line)" : undefined,
            }}
          >
            <Skeleton w={48} h={12} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Skeleton w="45%" h={12} />
              <Skeleton w="25%" h={9} style={{ marginTop: 7 }} />
            </div>
            <Skeleton w={60} h={16} r={6} />
          </div>
        ))}
      </div>
    </div>
  );
}
