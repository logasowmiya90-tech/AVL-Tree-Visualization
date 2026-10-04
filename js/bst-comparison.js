/**
 * Normal BST vs AVL Tree Comparison Engine
 * AI2203 - Data Structures and Algorithms Laboratory
 * 
 * Visually and mathematically demonstrates how sorted or pathological inputs
 * degenerate a standard BST into an O(N) linear chain, whereas an AVL Tree
 * maintains O(log N) logarithmic balance.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BSTComparison = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Simple Unbalanced BST Node
  class BSTNode {
    constructor(key) {
      this.id = 'bst_' + Math.random().toString(36).substr(2, 9);
      this.key = Number(key);
      this.left = null;
      this.right = null;
      this.height = 1;
    }
  }

  function bstInsert(root, key) {
    if (!root) return new BSTNode(key);
    if (key < root.key) {
      root.left = bstInsert(root.left, key);
    } else if (key > root.key) {
      root.right = bstInsert(root.right, key);
    }
    const hL = root.left ? root.left.height : 0;
    const hR = root.right ? root.right.height : 0;
    root.height = 1 + Math.max(hL, hR);
    return root;
  }

  function bstSearch(root, target, path = []) {
    if (!root) return { found: false, comparisons: path.length, path };
    path.push(root.key);
    if (root.key === target) {
      return { found: true, comparisons: path.length, path };
    }
    if (target < root.key) {
      return bstSearch(root.left, target, path);
    } else {
      return bstSearch(root.right, target, path);
    }
  }

  function computeTreeStats(root) {
    if (!root) return { count: 0, height: 0, maxDepth: 0 };
    let count = 0;

    function getStats(node, depth = 1) {
      if (!node) return { height: 0, maxDepth: 0 };
      count++;
      const left = getStats(node.left, depth + 1);
      const right = getStats(node.right, depth + 1);
      return {
        height: 1 + Math.max(left.height, right.height),
        maxDepth: Math.max(depth, left.maxDepth, right.maxDepth)
      };
    }

    const { height, maxDepth } = getStats(root);
    return { count, height, maxDepth };
  }

  // Mini SVG renderer for BST comparison view
  function renderMiniTree(svg, root, highlightedPath = []) {
    if (!svg) return;
    svg.innerHTML = `
      <defs>
        <filter id="miniShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.15" />
        </filter>
      </defs>
      <g id="miniViewport">
        <g id="miniLinks"></g>
        <g id="miniNodes"></g>
      </g>
    `;

    const linksGroup = svg.querySelector('#miniLinks');
    const nodesGroup = svg.querySelector('#miniNodes');

    if (!root) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '200');
      text.setAttribute('y', '150');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'empty-tree-text');
      text.textContent = 'Tree is empty';
      nodesGroup.appendChild(text);
      svg.setAttribute('viewBox', '0 0 400 300');
      return;
    }

    const nodeWidth = 46;
    const nodeHeight = 36;
    const levelHeight = 55;
    const minSpacing = 16;
    const positions = new Map();

    let inorderIdx = 0;
    function layout(node, depth = 0) {
      if (!node) return;
      layout(node.left, depth + 1);
      const x = inorderIdx * (nodeWidth + minSpacing);
      const y = depth * levelHeight + 35;
      positions.set(node.id, { x, y, key: node.key });
      inorderIdx++;
      layout(node.right, depth + 1);
    }
    layout(root, 0);

    // Compute bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positions.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const pad = 35;
    const vw = Math.max(300, maxX - minX + nodeWidth + pad * 2);
    const vh = Math.max(200, maxY - minY + nodeHeight + pad * 2);
    svg.setAttribute('viewBox', `${minX - pad} ${minY - pad} ${vw} ${vh}`);

    // Draw links
    function drawLinks(node) {
      if (!node) return;
      const parentPos = positions.get(node.id);

      [node.left, node.right].forEach(child => {
        if (!child) return;
        const childPos = positions.get(child.id);
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const sx = parentPos.x + nodeWidth / 2;
        const sy = parentPos.y + nodeHeight;
        const ex = childPos.x + nodeWidth / 2;
        const ey = childPos.y;
        p.setAttribute('d', `M ${sx} ${sy} L ${ex} ${ey}`);
        p.setAttribute('class', 'tree-link-mini');
        linksGroup.appendChild(p);
        drawLinks(child);
      });
    }
    drawLinks(root);

    // Draw nodes
    positions.forEach((pos, id) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const isPath = highlightedPath.includes(pos.key);
      g.setAttribute('class', `mini-node ${isPath ? 'mini-node-search-hit' : ''}`);
      g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', nodeWidth);
      rect.setAttribute('height', nodeHeight);
      rect.setAttribute('rx', '8');
      rect.setAttribute('filter', 'url(#miniShadow)');
      g.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', nodeWidth / 2);
      text.setAttribute('y', nodeHeight / 2 + 5);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = pos.key;
      g.appendChild(text);

      nodesGroup.appendChild(g);
    });
  }

  return {
    BSTNode,
    bstInsert,
    bstSearch,
    computeTreeStats,
    renderMiniTree
  };
});
