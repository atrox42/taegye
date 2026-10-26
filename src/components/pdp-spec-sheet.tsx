import { forceInkStyle, forceMutedStyle } from "@/lib/force-white";
import {
  PDP_SAMPLE_SPEC,
  parseMeasuredDimensions,
  productColorName,
  productSpecValue,
  type NewProduct,
} from "@/lib/site";

type DiagramSize = { w: number; d: number; h: number };

function specModel(product: NewProduct) {
  const measured = productSpecValue(product, "dimensions");
  const parsed = measured ? parseMeasuredDimensions(measured) : null;
  const size: DiagramSize = parsed ?? PDP_SAMPLE_SPEC.diagram;
  const dimensionsSample = !parsed;
  const rows: { label: string; value: string; sample: boolean }[] = [
    {
      label: "Dimensions",
      value: parsed ? measured : PDP_SAMPLE_SPEC.dimensions,
      sample: dimensionsSample,
    },
    { label: "Color", value: productColorName(product), sample: false },
    { label: "Made in", value: PDP_SAMPLE_SPEC.madeIn, sample: true },
  ];
  return { rows, size, dimensionsSample };
}

function DiagramView({
  title,
  across,
  up,
  sample,
}: {
  title: string;
  across: number;
  up: number;
  sample: boolean;
}) {
  const max = Math.max(across, up, 1);
  const rw = Math.max(28, (across / max) * 70);
  const rh = Math.max(28, (up / max) * 70);
  const x = 46;
  const y = 14;
  const ink = sample ? "#999999" : "#111111";

  return (
    <figure className="pdp-diagram-view">
      <svg viewBox="0 0 160 132" role="img" aria-label={`${title}, ${across} by ${up} millimetres`}>
        <rect x={x} y={y} width={rw} height={rh} fill="none" stroke="#111111" strokeWidth="1" />
        <line x1={x - 12} y1={y} x2={x - 12} y2={y + rh} stroke="#111111" strokeWidth="1" />
        <line x1={x - 16} y1={y} x2={x - 8} y2={y} stroke="#111111" strokeWidth="1" />
        <line x1={x - 16} y1={y + rh} x2={x - 8} y2={y + rh} stroke="#111111" strokeWidth="1" />
        <text x={x - 20} y={y + rh / 2} textAnchor="end" dominantBaseline="middle" fill={ink} fontSize="10">
          {up}
        </text>
        <line x1={x} y1={y + rh + 12} x2={x + rw} y2={y + rh + 12} stroke="#111111" strokeWidth="1" />
        <line x1={x} y1={y + rh + 8} x2={x} y2={y + rh + 16} stroke="#111111" strokeWidth="1" />
        <line x1={x + rw} y1={y + rh + 8} x2={x + rw} y2={y + rh + 16} stroke="#111111" strokeWidth="1" />
        <text x={x + rw / 2} y={y + rh + 28} textAnchor="middle" fill={ink} fontSize="10">
          {across}
        </text>
      </svg>
      <figcaption className="pdp-diagram-caption" style={forceInkStyle}>
        {title}
      </figcaption>
    </figure>
  );
}

export function PdpSpecTable({ product }: { product: NewProduct }) {
  const { rows } = specModel(product);
  return (
    <table className="pdp-specsheet-table">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} data-pdp-spec-row={row.label}>
            <th scope="row" style={forceInkStyle}>
              {row.label}
            </th>
            <td className={row.sample ? "is-sample" : undefined} style={row.sample ? forceMutedStyle : forceInkStyle}>
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PdpDiagramSlide({ product }: { product: NewProduct }) {
  const { size, dimensionsSample } = specModel(product);
  return (
    <div className="pdp-hero pdp-hero-diagram" style={{ backgroundColor: "transparent", backgroundImage: "none" }}>
      <div className="pdp-stage pdp-diagram-stage relative aspect-square overflow-hidden" data-pdp-photo="true">
        <div className="pdp-diagram pdp-diagram-slide" data-pdp-diagram={dimensionsSample ? "sample" : "measured"}>
          <DiagramView title="Front" across={size.w} up={size.h} sample={dimensionsSample} />
          <DiagramView title="Side" across={size.d} up={size.h} sample={dimensionsSample} />
        </div>
      </div>
    </div>
  );
}
