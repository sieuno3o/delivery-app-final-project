import {
  fulfillmentOrderStatuses,
  orderStatusLabels,
  type OrderStatus,
} from "@/lib/order-status";

type StatusHistoryItem = {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: Date;
};

function formatStatusTime(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

export function OrderStatusTimeline({
  currentStatus,
  history,
}: {
  currentStatus: OrderStatus;
  history: StatusHistoryItem[];
}) {
  const currentIndex = fulfillmentOrderStatuses.indexOf(
    currentStatus as (typeof fulfillmentOrderStatuses)[number],
  );
  const steps =
    currentStatus === "cancelled"
      ? history.map((record) => ({
          status: record.status,
          record,
          isReached: true,
          isCurrent: record.status === "cancelled",
          connectorReached: true,
        }))
      : fulfillmentOrderStatuses.map((status, index) => ({
          status,
          record: history.find((record) => record.status === status),
          isReached: index <= currentIndex,
          isCurrent: status === currentStatus,
          connectorReached: index < currentIndex,
        }));

  return (
    <section
      aria-labelledby="order-status-title"
      className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 sm:p-8"
    >
      <p className="text-xs font-bold tracking-[0.1em] text-[var(--accent)]">
        ORDER STATUS
      </p>
      <h2
        className="mt-2 text-2xl font-black tracking-[-0.04em]"
        id="order-status-title"
      >
        주문 진행 상황
      </h2>

      <ol className="mt-7 grid gap-0 sm:grid-cols-4">
        {steps.map((step, index) => (
          <li
            aria-current={step.isCurrent ? "step" : undefined}
            className="relative flex gap-4 pb-7 last:pb-0 sm:block sm:pb-0"
            key={`${step.status}-${index}`}
          >
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`absolute left-[0.6875rem] top-6 h-[calc(100%-1.5rem)] w-0.5 sm:left-6 sm:top-3 sm:h-0.5 sm:w-[calc(100%-1.5rem)] ${
                  step.connectorReached
                    ? "bg-[var(--accent)]"
                    : "bg-black/10"
                }`}
              />
            ) : null}
            <span
              aria-hidden="true"
              className={`relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white sm:mt-0 ${
                step.isCurrent
                  ? "bg-[var(--accent)] text-white"
                  : step.isReached
                    ? "bg-[var(--ink)] text-white"
                    : "bg-black/10 text-transparent"
              }`}
            >
              <span className="text-[10px] font-black">
                {step.isReached ? "✓" : "·"}
              </span>
            </span>
            <div className="min-w-0 sm:mt-4 sm:pr-4">
              <p
                className={`text-sm font-black ${
                  step.isReached ? "text-black" : "text-black/30"
                }`}
              >
                {orderStatusLabels[step.status]}
              </p>
              {step.record ? (
                <>
                  <time
                    className="mt-1 block text-xs font-semibold text-black/40"
                    dateTime={step.record.createdAt.toISOString()}
                  >
                    {formatStatusTime(step.record.createdAt)}
                  </time>
                  {step.record.note ? (
                    <p className="mt-1 text-xs leading-5 text-black/45">
                      {step.record.note}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-1 text-xs text-black/25">진행 예정</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
