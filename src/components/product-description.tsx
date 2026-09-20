"use client";

export function ProductDescription({ children }: { children: React.ReactNode }) {
  return (
    <details className="pdp-acc pdp-desc">
      <summary className="pdp-acc-summary site-type">
        <span>Description</span>
        <span aria-hidden>+</span>
      </summary>
      <div className="pdp-desc-body">{children}</div>
    </details>
  );
}
