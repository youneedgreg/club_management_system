import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton mirror of the expenses page while the log streams in. */
export default function ExpensesLoading() {
  return (
    <div className="stack" aria-busy="true" role="status" aria-label="Loading expenses">
      <div className="cols4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="card card-pad" key={i}>
            <Skeleton w={26} h={26} r={8} />
            <Skeleton w="55%" h={26} r={8} style={{ marginTop: 14 }} />
            <Skeleton w="40%" h={11} style={{ marginTop: 12 }} />
          </div>
        ))}
      </div>

      <div className="split-r">
        <div className="card card-pad">
          <Skeleton w={140} h={16} style={{ marginBottom: 18 }} />
          <div className="row" style={{ gap: 18 }}>
            <Skeleton w={130} h={130} r="50%" />
            <div style={{ flex: 1, display: "grid", gap: 14 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} w="80%" h={12} />
              ))}
            </div>
          </div>
        </div>
        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 16 }}>
            <Skeleton w={160} h={16} />
            <Skeleton w={180} h={30} r={10} />
          </div>
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
              <Skeleton w={38} h={38} r={11} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Skeleton w="45%" h={12} />
                <Skeleton w="28%" h={9} style={{ marginTop: 7 }} />
              </div>
              <Skeleton w={70} h={16} r={6} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
