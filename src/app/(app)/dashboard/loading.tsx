import { Skeleton } from "@/components/ui/skeleton";

/** Card header placeholder: icon chip + title line. */
function TitleRow() {
  return (
    <div className="card-title" style={{ marginBottom: 14 }}>
      <Skeleton w={30} h={30} r={9} />
      <Skeleton w={140} h={14} />
    </div>
  );
}

/** List-item placeholder: icon chip, two stacked lines, trailing value. */
function ListRow() {
  return (
    <div className="li">
      <Skeleton w={38} h={38} r={11} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skeleton w="55%" h={12} />
        <Skeleton w="32%" h={9} style={{ marginTop: 8 }} />
      </div>
      <Skeleton w={40} h={16} r={6} />
    </div>
  );
}

/** Skeleton mirror of the dashboard while its data streams in. */
export default function DashboardLoading() {
  return (
    <div className="stack" aria-busy="true" role="status" aria-label="Loading dashboard">
      {/* Stat cards */}
      <div className="cols4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="card card-pad" key={i}>
            <Skeleton w={26} h={26} r={8} />
            <Skeleton w="60%" h={28} r={8} style={{ marginTop: 14 }} />
            <Skeleton w="40%" h={12} style={{ marginTop: 12 }} />
          </div>
        ))}
      </div>

      {/* Revenue-by-hour chart + payment mix */}
      <div className="split">
        <div className="card card-pad">
          <TitleRow />
          <Skeleton w={120} h={24} r={8} style={{ marginBottom: 18 }} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130 }}>
            {[40, 58, 72, 90, 100, 86, 60, 38].map((p, i) => (
              <Skeleton key={i} h={`${p}%`} r="6px 6px 3px 3px" style={{ flex: 1, maxWidth: 30 }} />
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <TitleRow />
          <div className="row" style={{ gap: 18, alignItems: "center" }}>
            <Skeleton w={132} h={132} r="50%" />
            <div style={{ flex: 1, display: "grid", gap: 14 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} w="80%" h={12} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Low-stock alerts + top sellers */}
      <div className="cols2">
        {Array.from({ length: 2 }).map((_, c) => (
          <div className="card card-pad" key={c}>
            <TitleRow />
            <div className="list">
              {Array.from({ length: 4 }).map((_, i) => (
                <ListRow key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card card-pad">
        <TitleRow />
        <div className="list">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
