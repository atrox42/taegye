"use client";

import { useLayoutEffect, useState } from "react";

import { CanvasWhitePlate } from "@/components/canvas-white-plate";
import { forceInkStyle } from "@/lib/force-white";

export const COOKIE_KEY = "taegye-cookies";

type CookieChoice = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

function querySkip() {
  return new URLSearchParams(window.location.search).get("promo") === "skip";
}

function readChoice(): CookieChoice | null {
  try {
    const raw = window.localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieChoice>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return null;
  }
}

function storeChoice(choice: CookieChoice) {
  try {
    window.localStorage.setItem(COOKIE_KEY, JSON.stringify(choice));
  } catch {
    /* ignore */
  }
  document.documentElement.dataset.cookies = "off";
}

export function SiteCookies() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useLayoutEffect(() => {
    const saved = readChoice();
    const show = !querySkip() && !saved;
    document.documentElement.dataset.cookies = show ? "on" : "off";
    setOpen(show);
  }, []);

  if (!open) return null;

  const acceptAll = () => {
    storeChoice({ necessary: true, analytics: true, marketing: true });
    setOpen(false);
  };

  const savePreferences = () => {
    storeChoice({ necessary: true, analytics, marketing });
    setOpen(false);
  };

  return (
    <aside className="site-cookies" aria-label="Cookie consent">
      <CanvasWhitePlate />
      <div className="site-cookies-body">
        <p className="site-cookies-copy" style={forceInkStyle}>
          We use cookies to remember preferences and, if you allow, to understand how the site is used.
        </p>
        {panel ? (
          <div className="site-cookies-panel">
            <label className="site-cookies-row">
              <input type="checkbox" checked disabled />
              <span style={forceInkStyle}>Necessary</span>
              <span className="site-cookies-note">Always on</span>
            </label>
            <label className="site-cookies-row">
              <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
              <span style={forceInkStyle}>Analytics</span>
            </label>
            <label className="site-cookies-row">
              <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
              <span style={forceInkStyle}>Marketing</span>
            </label>
            <button type="button" className="site-cookies-save" onClick={savePreferences}>
              Save
            </button>
          </div>
        ) : null}
        <div className="site-cookies-actions">
          <button type="button" className="site-cookies-accept" onClick={acceptAll}>
            Accept All
          </button>
          <button type="button" className="site-cookies-manage" onClick={() => setPanel((value) => !value)}>
            Manage Preferences
          </button>
        </div>
      </div>
    </aside>
  );
}
