import { STORE_URL } from "@/lib/site";

export function StoreLink({
  className,
  children = "Store",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{ color: "#111111" }}
    >
      {children}
    </a>
  );
}

export function StoreMention({ text, className }: { text: string; className?: string }) {
  const nodes: React.ReactNode[] = [];
  const pattern = /\bStore\b/g;
  let last = 0;
  let match = pattern.exec(text);
  let index = 0;
  while (match) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <StoreLink key={index} className={className}>
        Store
      </StoreLink>,
    );
    last = match.index + match[0].length;
    index += 1;
    match = pattern.exec(text);
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
