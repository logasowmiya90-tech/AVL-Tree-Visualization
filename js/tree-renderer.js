/**
 * Tree Renderer for AVL Visualizer
 * AI2203 - Data Structures and Algorithms Laboratory
 * 
 * Renders SVG nodes with smooth animated transitions, 
 * badges for Key, BF, Height, state highlights, and rotation indicators.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TreeRenderer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  class SVGTreeRenderer {
    constructor(svgElement, options = {}) {
      this.svg = typeof svgElement === 'string' ? document.querySelector(svgElement) : svgElement;
      this.options = Object.assign({
        nodeWidth: 80,
        nodeHeight: 58,
        levelHeight: 90,
        minHorizontalSpacing: 35,
        paddingTop: 50,
        paddingBottom: 60,
        paddingHorizontal: 60
      }, options);

      this.currentPositions = new Map(); // id -> { x, y }
      this.viewBox = { x: 0, y: 0, width: 900, height: 500 };
      this.zoomLevel = 1;
      this.isPanning = false;
      this.startPan = { x: 0, y: 0 };

      this.initSVG();
    }

    initSVG() {
      if (!this.svg) return;
      this.svg.innerHTML = `
        <defs>
          <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.12" />
          </filter>
          <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#3b82f6" flood-opacity="0.6" />
          </filter>
          <filter id="insertedGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#10b981" flood-opacity="0.6" />
          </filter>
          <filter id="imbalanceGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#ef4444" flood-opacity="0.8" />
          </filter>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
          </marker>
        </defs>
        <g id="viewport">
          <g id="linksGroup"></g>
          <g id="indicatorsGroup"></g>
          <g id="nodesGroup"></g>
        </g>
      `;

      this.viewport = this.svg.querySelector('#viewport');
      this.linksGroup = this.svg.querySelector('#linksGroup');
      this.indicatorsGroup = this.svg.querySelector('#indicatorsGroup');
      this.nodesGroup = this.svg.querySelector('#nodesGroup');

      this.setupPanAndZoom();
    }

    setupPanAndZoom() {
      if (!this.svg) return;

      // Mouse drag panning
      this.svg.addEventListener('mousedown', (e) => {
        if (e.target.closest('.tree-node-interactive')) return;
        this.isPanning = true;
        this.startPan = { x: e.clientX, y: e.clientY };
        this.svg.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isPanning) return;
        const dx = (e.clientX - this.startPan.x) * (this.viewBox.width / this.svg.clientWidth);
        const dy = (e.clientY - this.startPan.y) * (this.viewBox.height / this.svg.clientHeight);
        this.viewBox.x -= dx;
        this.viewBox.y -= dy;
        this.startPan = { x: e.clientX, y: e.clientY };
        this.updateViewBox();
      });

      window.addEventListener('mouseup', () => {
        if (this.isPanning) {
          this.isPanning = false;
          this.svg.style.cursor = 'grab';
        }
      });

      // Wheel zooming
      this.svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
        this.zoom(zoomFactor, e.clientX, e.clientY);
      }, { passive: false });

      this.svg.style.cursor = 'grab';
    }

    zoom(factor, clientX = null, clientY = null) {
      const rect = this.svg.getBoundingClientRect();
      const mouseX = clientX !== null ? clientX - rect.left : rect.width / 2;
      const mouseY = clientY !== null ? clientY - rect.top : rect.height / 2;

      const svgX = this.viewBox.x + (mouseX / rect.width) * this.viewBox.width;
      const svgY = this.viewBox.y + (mouseY / rect.height) * this.viewBox.height;

      const newWidth = this.viewBox.width * factor;
      const newHeight = this.viewBox.height * factor;

      // Restrict zoom limits
      if (newWidth < 200 || newWidth > 3500) return;

      this.viewBox.x = svgX - (mouseX / rect.width) * newWidth;
      this.viewBox.y = svgY - (mouseY / rect.height) * newHeight;
      this.viewBox.width = newWidth;
      this.viewBox.height = newHeight;
      this.zoomLevel *= (1 / factor);

      this.updateViewBox();
    }

    zoomIn() {
      this.zoom(0.85);
    }

    zoomOut() {
      this.zoom(1.18);
    }

    resetView() {
      this.fitToTree();
    }

    updateViewBox() {
      if (!this.svg) return;
      this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
    }

    /**
     * Compute clean, aesthetic binary tree coordinates
     */
    computeLayout(root) {
      if (!root) return { positions: new Map(), bounds: { minX: 0, maxX: 400, minY: 0, maxY: 300 } };

      const positions = new Map();
      const { nodeWidth, minHorizontalSpacing, levelHeight, paddingTop } = this.options;
      const minDistance = nodeWidth + minHorizontalSpacing;

      let inorderIndex = 0;

      // Inorder assignment produces strictly ordered, collision-free x-coordinates
      function assignPositions(node, depth = 0) {
        if (!node) return;

        assignPositions(node.left, depth + 1);

        const x = inorderIndex * minDistance;
        const y = depth * levelHeight + paddingTop;
        positions.set(node.id, { x, y, key: node.key, node });
        inorderIndex++;

        assignPositions(node.right, depth + 1);
      }

      assignPositions(root, 0);

      // Compute bounds
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      positions.forEach(pos => {
        if (pos.x < minX) minX = pos.x;
        if (pos.x > maxX) maxX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.y > maxY) maxY = pos.y;
      });

      return {
        positions,
        bounds: {
          minX: minX === Infinity ? 0 : minX,
          maxX: maxX === -Infinity ? 500 : maxX,
          minY: minY === Infinity ? 0 : minY,
          maxY: maxY === -Infinity ? 300 : maxY
        }
      };
    }

    fitToTree(bounds) {
      if (!bounds) {
        bounds = this.lastBounds || { minX: 0, maxX: 600, minY: 0, maxY: 400 };
      }
      this.lastBounds = bounds;

      const padding = 70;
      const treeWidth = Math.max(300, bounds.maxX - bounds.minX + this.options.nodeWidth + padding * 2);
      const treeHeight = Math.max(260, bounds.maxY - bounds.minY + this.options.nodeHeight + padding * 2);

      this.viewBox = {
        x: bounds.minX - padding,
        y: bounds.minY - padding + 20,
        width: treeWidth,
        height: treeHeight
      };
      this.updateViewBox();
    }

    /**
     * Render the step snapshot
     */
    renderStep(step) {
      if (!this.svg) return;

      const tree = step.treeSnapshot;
      this.linksGroup.innerHTML = '';
      this.indicatorsGroup.innerHTML = '';
      this.nodesGroup.innerHTML = '';

      if (!tree) {
        // Show empty tree placeholder
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '450');
        text.setAttribute('y', '220');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'empty-tree-text');
        text.textContent = 'AVL Tree is Empty. Enter numbers and click "Insert / Visualize" or choose a Preset.';
        this.nodesGroup.appendChild(text);
        this.viewBox = { x: 0, y: 0, width: 900, height: 450 };
        this.updateViewBox();
        return;
      }

      const { positions, bounds } = this.computeLayout(tree);
      this.fitToTree(bounds);

      // 1. Render Links (edges)
      this.renderLinks(tree, positions);

      // 2. Render Rotation Arcs/Directional Arrows if rotation is in progress
      if (step.phase === 'ANIMATE_ROTATION' || step.phase === 'IMBALANCE_DETECTED') {
        this.renderRotationVisualCue(step, positions);
      }

      // 3. Render Nodes
      this.renderNodes(tree, positions, step);
    }

    renderLinks(node, positions) {
      if (!node) return;

      const parentPos = positions.get(node.id);

      if (node.left) {
        const childPos = positions.get(node.left.id);
        this.drawEdge(parentPos, childPos, 'L');
        this.renderLinks(node.left, positions);
      }

      if (node.right) {
        const childPos = positions.get(node.right.id);
        this.drawEdge(parentPos, childPos, 'R');
        this.renderLinks(node.right, positions);
      }
    }

    drawEdge(from, to, direction) {
      const startX = from.x + this.options.nodeWidth / 2;
      const startY = from.y + this.options.nodeHeight;
      const endX = to.x + this.options.nodeWidth / 2;
      const endY = to.y;

      const deltaY = endY - startY;
      const cp1X = startX;
      const cp1Y = startY + deltaY * 0.45;
      const cp2X = endX;
      const cp2Y = endY - deltaY * 0.45;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`);
      path.setAttribute('class', 'tree-link');
      this.linksGroup.appendChild(path);

      // Direction label badge (L or R)
      const midX = (startX + endX) / 2 + (direction === 'L' ? -12 : 12);
      const midY = (startY + endY) / 2;
      const dirText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      dirText.setAttribute('x', midX);
      dirText.setAttribute('y', midY);
      dirText.setAttribute('class', 'edge-dir-label');
      dirText.textContent = direction;
      this.linksGroup.appendChild(dirText);
    }

    renderNodes(node, positions, step) {
      if (!node) return;

      const pos = positions.get(node.id);
      const { nodeWidth, nodeHeight } = this.options;

      // Determine highlight classes
      let cardClass = 'tree-node-card';
      let filter = 'url(#nodeShadow)';
      let isImbalanced = Math.abs(node.balanceFactor) >= 2;
      let isChecking = step.activeNodeId === node.id || step.activeNodeKey === node.key;
      let isInserted = step.insertedNodeId === node.id || step.insertedNodeKey === node.key;
      let isRotationPivot = step.rotationNodes && step.rotationNodes.includes(node.id);

      if (isImbalanced) {
        cardClass += ' node-imbalanced';
        filter = 'url(#imbalanceGlow)';
      } else if (isRotationPivot) {
        cardClass += ' node-rotating';
        filter = 'url(#activeGlow)';
      } else if (isChecking) {
        cardClass += ' node-checking';
        filter = 'url(#activeGlow)';
      } else if (isInserted && (step.phase === 'PLACE_NODE' || step.phase === 'START_INSERT')) {
        cardClass += ' node-inserted';
        filter = 'url(#insertedGlow)';
      } else {
        cardClass += ' node-balanced';
      }

      // Group container for the node
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `tree-node-interactive ${cardClass}`);
      g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
      g.setAttribute('data-id', node.id);
      g.setAttribute('data-key', node.key);

      // Rounded Card Background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', nodeWidth);
      rect.setAttribute('height', nodeHeight);
      rect.setAttribute('rx', '12');
      rect.setAttribute('class', 'node-bg');
      rect.setAttribute('filter', filter);
      g.appendChild(rect);

      // Top corner badge: Height
      const heightBadgeBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      heightBadgeBg.setAttribute('x', '6');
      heightBadgeBg.setAttribute('y', '6');
      heightBadgeBg.setAttribute('width', '24');
      heightBadgeBg.setAttribute('height', '14');
      heightBadgeBg.setAttribute('rx', '4');
      heightBadgeBg.setAttribute('class', 'badge-height-bg');
      g.appendChild(heightBadgeBg);

      const heightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      heightText.setAttribute('x', '18');
      heightText.setAttribute('y', '17');
      heightText.setAttribute('text-anchor', 'middle');
      heightText.setAttribute('class', 'badge-height-text');
      heightText.textContent = `h:${node.height}`;
      g.appendChild(heightText);

      // Primary Key Number (Centered)
      const keyText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      keyText.setAttribute('x', nodeWidth / 2);
      keyText.setAttribute('y', '27');
      keyText.setAttribute('text-anchor', 'middle');
      keyText.setAttribute('class', 'node-key-text');
      keyText.textContent = node.key;
      g.appendChild(keyText);

      // Bottom pill badge: Balance Factor (BF)
      const bfVal = node.balanceFactor;
      const bfSign = bfVal > 0 ? `+${bfVal}` : `${bfVal}`;
      const bfClass = Math.abs(bfVal) >= 2 ? 'bf-imbalanced' : (bfVal === 0 ? 'bf-zero' : 'bf-light');

      const bfBadgeBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bfBadgeBg.setAttribute('x', (nodeWidth - 56) / 2);
      bfBadgeBg.setAttribute('y', nodeHeight - 20);
      bfBadgeBg.setAttribute('width', '56');
      bfBadgeBg.setAttribute('height', '15');
      bfBadgeBg.setAttribute('rx', '7');
      bfBadgeBg.setAttribute('class', `badge-bf-bg ${bfClass}`);
      g.appendChild(bfBadgeBg);

      const bfText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      bfText.setAttribute('x', nodeWidth / 2);
      bfText.setAttribute('y', nodeHeight - 8.5);
      bfText.setAttribute('text-anchor', 'middle');
      bfText.setAttribute('class', `badge-bf-text ${bfClass}`);
      bfText.textContent = `BF: ${bfSign}`;
      g.appendChild(bfText);

      // Status indicator icon or pulse dot
      if (isImbalanced) {
        const warnIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        warnIcon.setAttribute('x', nodeWidth - 10);
        warnIcon.setAttribute('y', '15');
        warnIcon.setAttribute('class', 'warn-icon-text');
        warnIcon.textContent = '⚠️';
        g.appendChild(warnIcon);
      }

      this.nodesGroup.appendChild(g);

      // Recursively render children
      if (node.left) this.renderNodes(node.left, positions, step);
      if (node.right) this.renderNodes(node.right, positions, step);
    }

    renderRotationVisualCue(step, positions) {
      if (!step.rotationPivotKey && !step.imbalancedNodeKey) return;
      const pivotKey = step.rotationPivotKey || step.imbalancedNodeKey;
      let pivotPos = null;

      positions.forEach(p => {
        if (p.key === pivotKey) pivotPos = p;
      });

      if (!pivotPos) return;

      const cx = pivotPos.x + this.options.nodeWidth / 2;
      const cy = pivotPos.y + this.options.nodeHeight / 2;
      const radius = 55;
      const dir = step.rotationDirection; // 'LEFT' or 'RIGHT'

      // Draw curved circular arrow around node
      const arcPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = '';

      if (dir === 'RIGHT') {
        // Clockwise arc from top-left to bottom-right
        d = `M ${cx - 40} ${cy - 20} A ${radius} ${radius} 0 0 1 ${cx + 45} ${cy + 10}`;
      } else {
        // Counter-clockwise arc from top-right to bottom-left
        d = `M ${cx + 40} ${cy - 20} A ${radius} ${radius} 0 0 0 ${cx - 45} ${cy + 10}`;
      }

      arcPath.setAttribute('d', d);
      arcPath.setAttribute('class', 'rotation-arc-cue');
      arcPath.setAttribute('marker-end', 'url(#arrow)');
      this.indicatorsGroup.appendChild(arcPath);

      // Text label for rotation
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', cx);
      label.setAttribute('y', pivotPos.y - 14);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'rotation-cue-label');
      label.textContent = `${dir} ROTATION ↻`;
      this.indicatorsGroup.appendChild(label);
    }
  }

  return SVGTreeRenderer;
});
