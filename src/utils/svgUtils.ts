const SVG_NS = 'http://www.w3.org/2000/svg';

const ALLOWED_TAGS = new Set(['svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse']);

const ALLOWED_ATTRS: Record<string, string[]> = {
  svg: ['viewBox'],
  g: ['transform'],
  path: ['d', 'transform'],
  circle: ['cx', 'cy', 'r', 'transform'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'transform'],
  line: ['x1', 'y1', 'x2', 'y2', 'transform'],
  polyline: ['points', 'transform'],
  polygon: ['points', 'transform'],
  ellipse: ['cx', 'cy', 'rx', 'ry', 'transform']
};

const sanitizeViewBox = (value?: string | null) => {
  if (!value) return '0 0 128 128';
  const trimmed = value.trim();
  const match = /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/.test(trimmed);
  return match ? trimmed : '0 0 128 128';
};

const cloneAndSanitize = (node: Element, parent: SVGElement, counter: { value: number }) => {
  const tag = node.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tag)) return;

  const cleanNode = document.createElementNS(SVG_NS, tag);
  const allowedAttrs = ALLOWED_ATTRS[tag] || [];

  allowedAttrs.forEach((attr) => {
    const rawValue = node.getAttribute(attr);
    if (!rawValue) return;
    if (attr === 'transform' && rawValue.length > 200) return;
    cleanNode.setAttribute(attr, rawValue);
  });

  parent.appendChild(cleanNode);
  counter.value += 1;

  node.childNodes.forEach((child) => {
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    cloneAndSanitize(child as Element, cleanNode as SVGElement, counter);
  });
};

export const sanitizeIllustrationSvg = (input?: string | null) => {
  if (!input) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return '';

    const cleanSvg = document.createElementNS(SVG_NS, 'svg');
    cleanSvg.setAttribute('viewBox', sanitizeViewBox(svg.getAttribute('viewBox')));
    cleanSvg.setAttribute('fill', 'none');
    cleanSvg.setAttribute('stroke', 'currentColor');
    cleanSvg.setAttribute('stroke-width', '2.5');
    cleanSvg.setAttribute('stroke-linecap', 'round');
    cleanSvg.setAttribute('stroke-linejoin', 'round');

    const counter = { value: 0 };
    svg.childNodes.forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      cloneAndSanitize(child as Element, cleanSvg, counter);
    });

    if (counter.value === 0) return '';

    const output = cleanSvg.outerHTML;
    if (output.length > 12000) return '';
    return output;
  } catch (error) {
    return '';
  }
};
