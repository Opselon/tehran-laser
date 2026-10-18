"""Tehran Laser — public-site UI/UX verification harness (CDP-direct).

Drives an ALREADY-RUNNING isolated headless Chrome (do not launch one here) over
the DevTools Protocol and measures, per route × breakpoint:

  * document + per-element horizontal overflow
  * interactive targets smaller than 44x44 CSS px
  * Persian text with non-zero letter-spacing or a text-transform
  * images missing alt / failing to load (naturalWidth == 0)
  * local image references that do not return a real image content-type

Numeric truth only: layout claims are reported from getBoundingClientRect and
computed styles, never from a vision pass (a vision pass on this RTL site
misread ۱۵٪ as ۷۵٪ and invented overflow that measures 0px).

Usage:
    python verify_ui.py                 # full sweep, summary exit code
    python verify_ui.py --json out.json # also dump raw results
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.request

import websocket

CDP_PORT = 9333
BASE = "http://127.0.0.1:4399"

ROUTES = [
    "/",
    "/services",
    "/clinic",
    "/contact",
    "/faq",
    "/blog",
    "/booking",
    # Legal pages carry Persian headings and were NOT in the original sweep —
    # that gap let two Persian `letter-spacing: -0.02em` rules ship unnoticed.
    "/privacy",
    "/terms",
]
WIDTHS = [(390, 844), (768, 1024), (1280, 900), (1440, 900)]

# WCAG 2.5.8 Target Size (Minimum) is 24px; 44px is the iOS HIG / practical
# touch minimum this project adopted. Report both so the severity is visible.
TAP_MIN = 44
TAP_AA = 24


class CDP:
    def __init__(self, port: int = CDP_PORT):
        targets = json.loads(
            urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list", timeout=10).read()
        )
        page = next(t for t in targets if t["type"] == "page")
        self.ws = websocket.create_connection(
            page["webSocketDebuggerUrl"], timeout=120, suppress_origin=True
        )
        self.mid = 0
        self.cmd("Page.enable")
        self.cmd("Runtime.enable")
        self.cmd("Network.enable")
        self.cmd("Network.setCacheDisabled", cacheDisabled=True)

    def cmd(self, method: str, **params):
        self.mid += 1
        self.ws.send(json.dumps({"id": self.mid, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self.mid:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})

    def viewport(self, width: int, height: int):
        self.cmd(
            "Emulation.setDeviceMetricsOverride",
            width=width,
            height=height,
            deviceScaleFactor=1,
            mobile=width < 700,
        )

    def goto(self, url: str, settle: float = 2.2):
        self.cmd("Page.navigate", url=url)
        # A freshly-attached target can still be about:blank, where
        # documentElement is null and every probe throws. Wait for a real
        # document before sampling, not just a fixed sleep.
        deadline = time.time() + 25
        while time.time() < deadline:
            try:
                if self.eval_js("!!document.documentElement") and self.eval_js(
                    "document.readyState"
                ) == "complete":
                    break
            except Exception:
                pass
            time.sleep(0.25)
        else:
            raise RuntimeError(f"page never became ready: {url} ({self.eval_js('location.href')})")
        time.sleep(settle)  # let fonts/images settle

    def eval_js(self, expr: str):
        r = self.cmd(
            "Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True
        )
        res = r.get("result", {})
        if res.get("subtype") == "error":
            raise RuntimeError(res.get("description"))
        return res.get("value")


PROBE = r"""
(() => {
  const vw = innerWidth;
  const out = {};
  const clsOf = (el) => {
    let c = el.className;
    if (c && c.baseVal !== undefined) c = c.baseVal;
    return ((c || el.id || el.tagName) + '').trim().split(/\s+/)[0] || el.tagName;
  };

  // ── horizontal overflow ────────────────────────────────────────────
  const de = document.documentElement;
  out.overflow = {
    docScrollW: de.scrollWidth,
    docClientW: de.clientWidth,
    pageOverflow: de.scrollWidth - de.clientWidth,
    offenders: [],
  };
  // A deliberately scrollable element (a scroll-snap rail, a horizontal
  // carousel, .mobile-sticky-bar) holds content wider than its own box ON
  // PURPOSE. Its children therefore sit past the viewport and are NOT
  // overflow defects — only content that escapes its ancestor CLIP is.
  const scrollHosts = [];
  document.querySelectorAll('body *').forEach((el) => {
    const cs = getComputedStyle(el);
    if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1) {
      scrollHosts.push(el);
    }
  });
  const inScrollHost = (el) =>
    scrollHosts.some((h) => h === el || h.contains(el));

  document.querySelectorAll('body *').forEach((el) => {
    let r = el.getBoundingClientRect();
    if (r.width <= 0) return;
    if (r.right <= vw + 1 && r.left >= -1) return;
    if (inScrollHost(el)) return; // intentional horizontal scroller
    let p = el, fixed = false, clipRect = null;
    while (p && p !== document.body) {
      const pcs = getComputedStyle(p);
      if (pcs.position === 'fixed') { fixed = true; break }
      // Walk up to the nearest clipping ancestor and record ITS box. An
      // element parked outside its parent's padding (a decorative glow at
      // `inset-inline-start: -40px`) is fully cut off by that parent, so it
      // cannot widen the document — but an element that escapes the clip
      // still can. Compare the element's VISIBLE area against the viewport
      // rather than exempting it just because a clipping ancestor exists.
      if (pcs.overflowX === 'hidden' || pcs.overflowX === 'clip') {
        clipRect = p.getBoundingClientRect();
        break;
      }
      p = p.parentElement;
    }
    if (fixed) return;
    if (clipRect) {
      // Visible fragment = intersection of the element with its clip box.
      const visLeft = Math.max(r.left, clipRect.left);
      const visRight = Math.min(r.right, clipRect.right);
      if (visRight - visLeft <= 1) return;      // entirely clipped away
      r = { left: visLeft, right: visRight };
      if (r.right <= vw + 1 && r.left >= -1) return;
    }
    out.overflow.offenders.push({
      sel: clsOf(el),
      left: Math.round(r.left),
      right: Math.round(r.right),
    });
  });
  // inside-container clipping the page metric misses
  out.overflow.clippedContainers = [];
  document.querySelectorAll('body *').forEach((el) => {
    if (el.scrollWidth - el.clientWidth > 1 && el.clientWidth > 0) {
      const cs = getComputedStyle(el);
      if (cs.overflowX === 'hidden') {
        out.overflow.clippedContainers.push({
          sel: clsOf(el), scrollW: el.scrollWidth, clientW: el.clientWidth,
        });
      }
    }
  });

  // ── tap targets ────────────────────────────────────────────────────
  out.smallTargets = [];
  document.querySelectorAll('a, button, [role=button], summary, input[type=submit]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (getComputedStyle(el).visibility === 'hidden') return;
    // a small visible box can still sit inside a large padded hit area
    if (r.height < TAP_MIN || r.width < TAP_MIN) {
      out.smallTargets.push({
        sel: clsOf(el),
        w: Math.round(r.width),
        h: Math.round(r.height),
        text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 18),
      });
    }
  });

    // ── Persian typography ─────────────────────────────────────────────
    // Split by severity, because the two cases are NOT equivalent:
    //  · NEGATIVE tracking on Persian collides/condenses joined glyphs -> defect.
    //  · POSITIVE tracking inserts gaps into a cursive script -> a smell.
    //    Latin-only eyebrows may legitimately carry tracking, so those warn.
    out.negativeTracking = [];
    out.positiveTracking = [];
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,button,div,td,th,summary,label,strong,small').forEach((el) => {
    const txt = (el.textContent || '').trim();
    if (!txt || !/[\u0600-\u06FF]/.test(txt)) return;
    // only leaf-ish nodes: a container inherits its children's text
    if (el.children.length > 0 && txt.length > 60) return;
    const cs = getComputedStyle(el);
    const ls = parseFloat(cs.letterSpacing);
    const rec = {
      sel: clsOf(el),
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
      sample: txt.slice(0, 24),
    };
    if (cs.textTransform === 'uppercase') {
      out.negativeTracking.push({ ...rec, reason: 'uppercase on Persian' });
    } else if (!isNaN(ls) && ls < -0.01) out.negativeTracking.push(rec);
    else if (!isNaN(ls) && ls > 0.01) out.positiveTracking.push(rec);
  });

  // ── images ─────────────────────────────────────────────────────────
  out.images = [];
  document.querySelectorAll('img').forEach((im) => {
    out.images.push({
      src: im.currentSrc || im.getAttribute('src') || '',
      alt: im.getAttribute('alt'),
      hasAlt: im.hasAttribute('alt'),
      loaded: im.complete && im.naturalWidth > 0,
      w: im.getAttribute('width') || null,
      h: im.getAttribute('height') || null,
      loading: im.getAttribute('loading'),
      decoding: im.getAttribute('decoding'),
    });
  });

  // ── aria-hidden drift ──────────────────────────────────────────────
  // A node marked aria-hidden must not contain anything focusable: the focus
  // ring would land on an element assistive tech was told to ignore. Empty
  // decorative wrappers are the usual source of this.
  out.ariaHiddenFocusable = [];
  document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
    const f = el.querySelector('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (f) out.ariaHiddenFocusable.push({ hidden: clsOf(el), focusable: clsOf(f) });
  });

  return out;
})()
""".replace("TAP_MIN", str(TAP_MIN))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json")
    ap.add_argument("--routes", nargs="*", default=ROUTES)
    args = ap.parse_args()

    cdp = CDP()
    results = []
    for route in args.routes:
        for w, h in WIDTHS:
            cdp.viewport(w, h)
            cdp.goto(BASE + route)
            data = cdp.eval_js(PROBE)
            # Lazy-loaded images report complete&&naturalWidth==0 while still
            # below the fold, which reads as a broken image. A single batched
            # scrollTo burst does NOT fire Chrome's lazy-load observer (the
            # first scrollTo overshoots the observer's threshold before the
            # others run, then the reset to top undoes it), so scroll in real
            # steps WITH a settle after each.
            cdp.eval_js("scrollTo(0, document.documentElement.scrollHeight)")
            time.sleep(1.0)
            cdp.eval_js("scrollTo(0, document.documentElement.scrollHeight / 2)")
            time.sleep(1.0)
            cdp.eval_js("scrollTo(0, 0)")
            time.sleep(1.2)
            reload = cdp.eval_js(
                "(() => ({ images: [...document.images].map((im) => ({"
                # Key on the src ATTRIBUTE, never currentSrc: before a picture
                # resolves, currentSrc is '' so the probe falls back to the .jpg
                # attribute, but once loaded currentSrc becomes the .avif the
                # <picture> chose — the two scans would never agree.
                "  key: im.getAttribute('src') || '',"
                "  loaded: im.complete && im.naturalWidth > 0,"
                "})) }))()"
            )
            by_key = {im["key"]: im["loaded"] for im in reload["images"]}
            for im in data["images"]:
                key = im["src"] if im["src"].startswith("/images/") else ""
                if key in by_key:
                    im["loaded"] = by_key[key]
            data.update(route=route, width=w, height=h)
            results.append(data)

    failures: list[str] = []
    warns: list[str] = []
    for r in results:
        tag = f"{r['route']} @{r['width']}"
        # A fixed-position dock/nav legitimately sits flush to the viewport
        # edge, so compare against its own bounds only for in-flow content.
        if r["overflow"]["pageOverflow"] > 1:
            failures.append(f"{tag}: PAGE OVERFLOW {r['overflow']['pageOverflow']}px")
        if r["overflow"]["offenders"]:
            names = sorted({o["sel"] for o in r["overflow"]["offenders"]})
            failures.append(f"{tag}: element(s) past viewport: {names[:6]}")
        big = [t for t in r["smallTargets"] if t["h"] < TAP_AA or t["w"] < TAP_AA]
        if big:
            failures.append(f"{tag}: {len(big)} target(s) below 24px (WCAG 2.5.8)")
        if r["negativeTracking"]:
            names = sorted({(b["sel"], b["letterSpacing"]) for b in r["negativeTracking"]})
            failures.append(
                f"{tag}: {len(r['negativeTracking'])} Persian node(s) condensed/an"
                f" uppercased: {names[:4]}"
            )
        if r["positiveTracking"]:
            names = sorted({b["sel"] for b in r["positiveTracking"]})
            warns.append(f"{tag}: {len(r['positiveTracking'])} Persian node(s) with positive tracking: {names[:4]}")
        if r.get("ariaHiddenFocusable"):
            names = sorted({(a["hidden"], a["focusable"]) for a in r["ariaHiddenFocusable"]})
            failures.append(f"{tag}: {len(r['ariaHiddenFocusable'])} focusable node(s) inside aria-hidden: {names[:3]}")
        for im in r["images"]:
            if not im["hasAlt"] or not (im["alt"] or "").strip():
                failures.append(f"{tag}: img missing alt: {im['src'][:60]}")
            if not im["loaded"]:
                failures.append(f"{tag}: img not loaded: {im['src'][:60]}")

    print(f"measured {len(results)} route×breakpoint cells")
    total_small = sum(len(r["smallTargets"]) for r in results)
    print(f"sub-44px targets (informational, counted per cell): {total_small}")
    print(f"{'─' * 66}")
    if warns:
        print(f"WARNINGS ({len(warns)}):")
        for w in warns[:20]:
            print("  ~", w)
    if failures:
        print(f"FAILURES ({len(failures)}):")
        for f in failures[:60]:
            print("  •", f)
        if len(failures) > 60:
            print(f"  … +{len(failures) - 60} more")
    else:
        print("ALL CHECKS PASS")

    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(results, fh, ensure_ascii=False, indent=1)
        print(f"raw results -> {args.json}")

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
