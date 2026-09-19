export function StoreLabel({
  casing = "lower",
}: {
  casing?: "lower" | "title";
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{casing === "title" ? "Store" : "store"}</span>
      <span aria-hidden className="leading-none">
        →
      </span>
    </span>
  );
}
