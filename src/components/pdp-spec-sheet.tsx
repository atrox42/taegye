import { forceInkStyle, forceMutedStyle } from "@/lib/force-white";
import {
  PDP_SAMPLE_SPEC,
  parseMeasuredDimensions,
  productColorName,
  productSpecValue,
  type NewProduct,
} from "@/lib/site";

function specModel(product: NewProduct) {
  const measured = productSpecValue(product, "dimensions");
  const parsed = measured ? parseMeasuredDimensions(measured) : null;
  const rows: { label: string; value: string; sample: boolean }[] = [
    {
      label: "Dimensions",
      value: parsed ? measured : PDP_SAMPLE_SPEC.dimensions,
      sample: !parsed,
    },
    { label: "Color", value: productColorName(product), sample: false },
    { label: "Made in", value: PDP_SAMPLE_SPEC.madeIn, sample: true },
  ];
  return { rows };
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
