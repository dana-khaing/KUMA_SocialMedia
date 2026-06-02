const copy = {
  title: "Database is waking up",
  body:
    "KUMA is currently in beta and is available only during selected demo and testing windows. The database may be waking up, so please try again shortly or return during the scheduled demo/testing time.",
};

export function BetaDatabaseFallback({ variant = "full" }) {
  const isCompact = variant === "compact";

  return (
    <section
      className={
        isCompact
          ? "w-full rounded-2xl border border-orange-100 bg-white px-4 py-5 text-sm shadow-md"
          : "flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-12"
      }
    >
      <div
        className={
          isCompact
            ? "flex flex-col gap-3"
            : "w-full max-w-2xl rounded-3xl border border-orange-100 bg-white/95 px-6 py-8 text-center shadow-xl shadow-orange-100/70 sm:px-10 sm:py-12"
        }
      >
        <div
          className={
            isCompact
              ? "flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4E01]/10 text-lg font-bold text-[#FF4E01]"
              : "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FF4E01]/10 text-2xl font-bold text-[#FF4E01]"
          }
          aria-hidden="true"
        >
          K
        </div>
        <div className={isCompact ? "space-y-2" : "space-y-4"}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FF4E01]">
            KUMA beta
          </p>
          <h1
            className={
              isCompact
                ? "text-lg font-bold text-slate-950"
                : "text-3xl font-bold text-slate-950 sm:text-4xl"
            }
          >
            {copy.title}
          </h1>
          <p
            className={
              isCompact
                ? "leading-6 text-slate-600"
                : "mx-auto max-w-xl text-base leading-7 text-slate-600 sm:text-lg"
            }
          >
            {copy.body}
          </p>
        </div>
      </div>
    </section>
  );
}

export default BetaDatabaseFallback;
