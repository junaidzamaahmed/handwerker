const VARS = await figma.variables.getLocalVariablesAsync();
const V = {}; for (const v of VARS) V[v.name] = v;
const TS = {}; for (const s of await figma.getLocalTextStylesAsync()) TS[s.name] = s;
const ES = {}; for (const s of await figma.getLocalEffectStylesAsync()) ES[s.name] = s;
for (const f of [{family:'Archivo',style:'Bold'},{family:'Archivo',style:'SemiBold'},
  {family:'Inter',style:'Regular'},{family:'Inter',style:'Medium'},{family:'Inter',style:'Semi Bold'}])
  await figma.loadFontAsync(f);
const MODE = '2:4';
function resolve(v, mode) {
  let val = v.valuesByMode[mode] !== undefined ? v.valuesByMode[mode] : Object.values(v.valuesByMode)[0];
  let g = 0;
  while (val && val.type === 'VARIABLE_ALIAS' && g++ < 12) {
    const nv = VARS.find(x => x.id === val.id); if (!nv) break;
    val = nv.valuesByMode[mode] !== undefined ? nv.valuesByMode[mode] : Object.values(nv.valuesByMode)[0];
  }
  return val;
}
function P(name) {
  const v = V[name]; if (!v) throw new Error('no var ' + name);
  const c = resolve(v, MODE);
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', v);
}
function NUM(name) { const v = V[name]; return resolve(v, Object.keys(v.valuesByMode)[0]); }
function bind(node, field, name) { node.setBoundVariable(field, V[name]); return node; }
function pad(node, t, r, b, l, names) {
  node.paddingTop = t; node.paddingRight = r; node.paddingBottom = b; node.paddingLeft = l;
  if (names) { const [a,c,d,e] = names;
    if (a) bind(node,'paddingTop',a); if (c) bind(node,'paddingRight',c);
    if (d) bind(node,'paddingBottom',d); if (e) bind(node,'paddingLeft',e); }
  return node;
}
function col(props) { const f = figma.createAutoLayout('VERTICAL', props || {}); f.fills = []; return f; }
function row(props) { const f = figma.createAutoLayout('HORIZONTAL', props || {}); f.fills = []; return f; }
async function txt(style, chars, fill, width) {
  const t = figma.createText();
  await t.setTextStyleIdAsync(TS[style].id);
  t.characters = chars;
  if (fill) t.fills = [P(fill)];
  if (width) { t.textAutoResize = 'HEIGHT'; t.resize(width, t.height); }
  return t;
}
async function shadow(node, name) { await node.setEffectStyleIdAsync(ES[name].id); return node; }
function icon(id, size, fill) {
  const src = figma.getNodeById(id);
  const i = src.createInstance();
  i.resize(size, size);
  if (fill) for (const v of i.findAll(n => n.type === 'VECTOR')) v.fills = [P(fill)];
  return i;
}
