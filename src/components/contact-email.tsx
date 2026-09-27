"use client";

import { useCallback, useRef, useState } from "react";

import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle } from "@/lib/force-white";
import { CONTACT_EMAIL } from "@/lib/site";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  }
}

export function ContactEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  const onCopy = useCallback(async () => {
    const ok = await copyText(CONTACT_EMAIL);
    if (!ok) return;
    window.clearTimeout(timer.current);
    setCopied(true);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  }, []);

  return (
    <p className="contact-email-row">
      <button
        type="button"
        className="contact-email site-type site-type-copy"
        style={forceInkStyle}
        onClick={onCopy}
        aria-label={`Copy ${CONTACT_EMAIL}`}
      >
        {CONTACT_EMAIL}
      </button>
      {copied ? (
        <span className="contact-copied site-type" role="status" style={forceInkStyle}>
          <WhiteSurfaceFill />
          Copied
        </span>
      ) : null}
    </p>
  );
}
