/*
 * Extract one or more pages' <style> blocks into a shared layer.
 *
 * For every top-level rule (and every rule inside @media/@supports) it:
 *  - optionally prefixes each selector with an ancestor (namespace)
 *  - dedupes byte-identical (media, selector, body) triples across pages
 *  - leaves :global(...) and @page alone
 *  - reports collisions: same selector in another page with a DIFFERENT body
 *
 *   node extract.cjs <outfile> <ancestor|-> <page1> <page2> ...
 */
const fs = require('fs');

function styleCss(file) {
  const t = fs.readFileSync(file, 'utf8');
  const blocks = t.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
  return blocks
    .map((b) => b.replace(/^<style[^>]*>/, '').replace(/<\/style>$/, ''))
    .join('\n');
}

// Split a CSS string into top-level blocks, keeping any leading comment with
// the block it documents.
function splitTop(css) {
  const out = [];
  let depth = 0;
  let start = 0;
  let i = 0;
  while (i < css.length) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') {
      const e = css.indexOf('*/', i + 2);
      i = e < 0 ? css.length : e + 2;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        out.push(css.slice(start, i + 1));
        start = i + 1;
      }
    }
    i++;
  }
  const tail = css.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

function stripLeadingComments(s) {
  return s.replace(/^\s*(\/\*[\s\S]*?\*\/\s*)+/, '');
}

function headOf(block) {
  const noComments = stripLeadingComments(block);
  const brace = noComments.indexOf('{');
  return noComments.slice(0, brace).replace(/\s+/g, ' ').trim();
}

function bodyOf(block) {
  const noComments = stripLeadingComments(block);
  const brace = noComments.indexOf('{');
  return noComments.slice(brace);
}

function leadingComments(block) {
  let out = '';
  let rest = block;
  for (;;) {
    const m = rest.match(/^\s*(\/\*[\s\S]*?\*\/)\s*/);
    if (!m) break;
    out += m[1] + '\n';
    rest = rest.slice(m[0].length);
  }
  return out;
}

function prefixSelectorList(sel, ancestor) {
  return sel
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (s.startsWith(':global(') || s.startsWith('@') || s.startsWith(':root')) return s;
      // A :global() wrapper anywhere means the author escaped scoping.
      if (s.includes(':global(')) return s;
      return `${ancestor} ${s}`;
    })
    .join(',\n  ');
}

// Flatten page CSS into [{media, sel, body, comments}]
function flatten(css, ancestor) {
  const rows = [];
  for (const block of splitTop(css)) {
    const head = headOf(block);
    if (!head) continue;
    const comments = leadingComments(block).trim();
    if (head.startsWith('@media') || head.startsWith('@supports')) {
      const inner = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'));
      for (const child of flatten(inner, ancestor)) {
        rows.push({ ...child, media: head + (child.media ? ' ' + child.media : ''), comments: '' });
      }
      continue;
    }
    if (head.startsWith('@')) {
      // @page, @font-face, @keyframes — keep verbatim
      rows.push({ media: null, sel: head, body: bodyOf(block), comments, raw: block.trim() });
      continue;
    }
    const sel = ancestor && ancestor !== '-' ? prefixSelectorList(head, ancestor) : head;
    rows.push({ media: null, sel, body: bodyOf(block), comments });
  }
  return rows;
}

function key(r) {
  return r.media + '||' + r.sel + '||' + r.body;
}

const [outFile, ancestor, ...pages] = process.argv.slice(2);
if (!pages.length) {
  console.error('usage: node extract.cjs <out> <ancestor|-> <page...>');
  process.exit(2);
}

const perPage = pages.map((p) => ({ page: p, rows: flatten(styleCss(p), ancestor) }));

// collision report: same media+sel, different body, across pages
const seen = new Map();
for (const { page, rows } of perPage) {
  for (const r of rows) {
    const k = r.media + '||' + r.sel;
    if (!seen.has(k)) seen.set(k, []);
    seen.get(k).push({ page, body: r.body });
  }
}
const collisions = [];
for (const [k, list] of seen) {
  const bodies = new Set(list.map((l) => l.body));
  if (bodies.size > 1) collisions.push({ k, list });
}

// Emit: dedupe identical rows, keep first-seen order
const emitted = new Set();
const lines = [];
let dupes = 0;
for (const { rows } of perPage) {
  for (const r of rows) {
    const k = key(r);
    if (emitted.has(k)) {
      dupes++;
      continue;
    }
    emitted.add(k);
    lines.push({ media: r.media, sel: r.sel, body: r.body, comments: r.comments, raw: r.raw });
  }
}

let out = '';
let curMedia = null;
const openMedia = () => {
  if (curMedia !== null) out = out.replace(/\n+$/, '\n') + '}\n\n';
};
for (const r of lines) {
  if (r.raw) {
    openMedia();
    curMedia = null;
    out += r.raw + '\n\n';
    continue;
  }
  if (r.media !== curMedia) {
    openMedia();
    curMedia = r.media;
    if (curMedia) out += curMedia + ' {\n';
  }
  const indent = curMedia ? '  ' : '';
  if (r.comments) {
    for (const line of r.comments.split('\n')) out += indent + line + '\n';
  }
  out += indent + r.sel.split('\n').join('\n' + indent) + ' ' + r.body + '\n';
  if (!curMedia) out += '\n';
}
if (curMedia) out = out.replace(/\n+$/, '\n') + '}\n';

fs.writeFileSync(outFile, out);
console.log(`wrote ${outFile}`);
console.log(`  rules in: ${perPage.reduce((a, p) => a + p.rows.length, 0)}`);
console.log(`  emitted:  ${lines.length}  (deduped ${dupes})`);
if (collisions.length) {
  console.log(`  COLLISIONS (${collisions.length}) — same selector, different body:`);
  for (const c of collisions) {
    console.log(`    ${c.k}`);
    for (const l of c.list) console.log(`       ${l.page}`);
  }
}
