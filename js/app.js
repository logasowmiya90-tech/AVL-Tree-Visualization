/**
 * Application Controller & UI Wiring
 * AI2203 - Data Structures and Algorithms Laboratory
 * AVL Tree Visualization and Balancing System
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global simulator & visualizer instances
  const simulator = new AVL.AVLTreeSimulator();
  let renderer = null;
  let animator = null;

  // DOM Elements - Navigation
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // DOM Elements - Visualizer
  const seqInput = document.getElementById('sequenceInput');
  const btnVisualize = document.getElementById('btnVisualize');
  const btnInsertSingle = document.getElementById('btnInsertSingle');
  const btnDeleteSingle = document.getElementById('btnDeleteSingle');
  const btnReset = document.getElementById('btnReset');
  const btnRandom = document.getElementById('btnRandom');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // DOM Elements - Playback
  const btnPlayPause = document.getElementById('btnPlayPause');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnJumpEnd = document.getElementById('btnJumpEnd');
  const speedSlider = document.getElementById('speedSlider');
  const speedLabel = document.getElementById('speedLabel');
  const timelineSlider = document.getElementById('timelineSlider');
  const stepCounter = document.getElementById('stepCounter');

  // DOM Elements - Canvas Actions
  const treeSvg = document.getElementById('treeSvg');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnFitView = document.getElementById('btnFitView');
  const btnExportSnapshot = document.getElementById('btnExportSnapshot');
  const canvasStatusText = document.getElementById('canvasStatusText');

  // DOM Elements - Right Panel live inspection
  const stepPhaseBadge = document.getElementById('stepPhaseBadge');
  const stepTitle = document.getElementById('stepTitle');
  const stepDesc = document.getElementById('stepDesc');
  const bfFormulaCard = document.getElementById('bfFormulaCard');
  const formulaDisplay = document.getElementById('formulaDisplay');
  const rotationAlertCard = document.getElementById('rotationAlertCard');
  const rotationCaseTag = document.getElementById('rotationCaseTag');
  const rotationAlertText = document.getElementById('rotationAlertText');
  const historyList = document.getElementById('historyList');

  // Toast Notification
  const toastBanner = document.getElementById('toastBanner');
  const toastText = document.getElementById('toastText');

  function showToast(message, duration = 3500) {
    if (!toastBanner || !toastText) return;
    toastText.textContent = message;
    toastBanner.style.display = 'flex';
    if (showToast.timeout) clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
      toastBanner.style.display = 'none';
    }, duration);
  }

  // 1. Initialize Tree Renderer
  renderer = new TreeRenderer(treeSvg);

  // 2. Initialize Step Animator
  animator = new StepAnimator({
    speed: 900,
    onStepChange: (step, index, total) => {
      updateUIForStep(step, index, total);
    },
    onStateChange: (isPlaying) => {
      btnPlayPause.innerHTML = isPlaying ? '⏸ Pause' : '▶ Play';
      btnPlayPause.classList.toggle('btn-primary', !isPlaying);
      btnPlayPause.classList.toggle('btn-secondary', isPlaying);
    }
  });

  // Handle speed slider changes
  speedSlider.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    animator.setSpeed(val);
    const speedSec = (val / 1000).toFixed(1);
    speedLabel.textContent = `${speedSec}s/step`;
  });

  // Handle timeline slider scrubber
  timelineSlider.addEventListener('input', (e) => {
    const idx = Number(e.target.value);
    animator.goToStep(idx);
  });

  // Navigation Tabs switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      navTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');

      if (targetId === 'tab-benchmark') {
        runBSTComparisonDemo();
      }
    });
  });

  /**
   * Update Right-Panel and Canvas according to current step
   */
  function updateUIForStep(step, index, total) {
    if (!step) {
      stepPhaseBadge.textContent = 'READY';
      stepPhaseBadge.className = 'step-badge badge-insert';
      stepTitle.textContent = 'Tree Ready';
      stepDesc.textContent = 'Enter a sequence and click "Insert / Visualize" to see every AVL balance operation step by step.';
      stepCounter.textContent = 'Step 0 of 0';
      timelineSlider.max = 0;
      timelineSlider.value = 0;
      timelineSlider.disabled = true;
      rotationAlertCard.classList.remove('active');
      bfFormulaCard.className = 'bf-formula-card';
      formulaDisplay.textContent = 'BF = Height(Left) - Height(Right)';
      canvasStatusText.textContent = 'Status: Idle';
      renderer.renderStep({ treeSnapshot: null });
      return;
    }

    // Step counter & timeline
    stepCounter.textContent = `Step ${index + 1} of ${total}`;
    timelineSlider.disabled = false;
    timelineSlider.max = total - 1;
    timelineSlider.value = index;

    // Phase Badge
    stepPhaseBadge.textContent = step.phase.replace(/_/g, ' ');
    let badgeClass = 'badge-insert';
    if (step.phase.includes('COMPARE')) badgeClass = 'badge-compare';
    else if (step.phase.includes('CALCULATE') || step.phase.includes('CHECK')) badgeClass = 'badge-check';
    else if (step.phase.includes('IMBALANCE')) badgeClass = 'badge-imbalance';
    else if (step.phase.includes('ROTATION')) badgeClass = 'badge-rotation';
    else if (step.phase.includes('COMPLETE')) badgeClass = 'badge-complete';
    stepPhaseBadge.className = `step-badge ${badgeClass}`;

    // Step Title & Description
    stepTitle.textContent = step.title;
    stepDesc.textContent = step.description;

    // Canvas status tag
    canvasStatusText.textContent = `Status: ${step.statusBadge || step.phase}`;

    // Balance Factor formula card
    if (step.mathDetails) {
      const { nodeKey, leftHeight, rightHeight, computedHeight, balanceFactor, isBalanced, formula } = step.mathDetails;
      formulaDisplay.textContent = `${formula} | Height: ${computedHeight}`;
      bfFormulaCard.className = `bf-formula-card ${isBalanced ? 'status-balanced' : 'status-imbalanced'}`;
    } else {
      formulaDisplay.textContent = 'BF = Height(Left) - Height(Right)';
      bfFormulaCard.className = 'bf-formula-card';
    }

    // Rotation Alert Card
    if (step.rotationType) {
      rotationAlertCard.classList.add('active');
      rotationCaseTag.textContent = `${step.rotationType} Case`;
      const rotDir = step.rotationDirection ? `${step.rotationDirection} Rotation` : 'Double Rotation';
      rotationAlertText.textContent = `Pivot Node: ${step.rotationPivotKey || step.imbalancedNodeKey || ''} | Required: ${rotDir}`;
    } else {
      rotationAlertCard.classList.remove('active');
    }

    // Render tree in SVG
    renderer.renderStep(step);

    // Update active item in history list
    updateHistoryActiveItem(index);
  }

  /**
   * Rebuild the history list UI
   */
  function populateHistoryList(steps) {
    historyList.innerHTML = '';
    steps.forEach((step, idx) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.dataset.index = idx;
      li.innerHTML = `
        <span>${step.title}</span>
        <span class="history-step-num">#${idx + 1}</span>
      `;
      li.addEventListener('click', () => {
        animator.goToStep(idx);
      });
      historyList.appendChild(li);
    });
  }

  function updateHistoryActiveItem(activeIndex) {
    const items = historyList.querySelectorAll('.history-item');
    items.forEach((item, idx) => {
      if (idx === activeIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Parse user input sequence safely
   */
  function parseInputSequence(str) {
    if (!str || !str.trim()) {
      showToast('⚠️ Please enter integer numbers separated by commas.');
      return null;
    }

    const parts = str.split(/[,;\s]+/).filter(Boolean);
    const numbers = [];
    const seen = new Set();
    const duplicates = [];

    for (const p of parts) {
      const num = Number(p.trim());
      if (Number.isNaN(num) || !Number.isInteger(num)) {
        showToast(`⚠️ "${p}" is not a valid integer. Please enter integers only.`);
        return null;
      }
      if (seen.has(num)) {
        duplicates.push(num);
      } else {
        seen.add(num);
        numbers.push(num);
      }
    }

    if (numbers.length === 0) {
      showToast('⚠️ No valid integers found in input.');
      return null;
    }

    if (duplicates.length > 0) {
      showToast(`ℹ️ Duplicate values [${duplicates.join(', ')}] were skipped (AVL tree requires unique keys).`, 4000);
    }

    if (numbers.length > 25) {
      showToast('⚠️ Sequences with over 25 nodes may exceed canvas view. Recommend 3-15 for clear visualization.');
    }

    return numbers;
  }

  /**
   * Launch Sequence Visualization
   */
  function visualizeSequence(seq, autoPlay = true) {
    const steps = simulator.insertSequence(seq);
    populateHistoryList(steps);
    animator.loadSteps(steps, autoPlay);
    showToast(`Loaded ${seq.length} elements (${steps.length} detailed steps generated).`);
  }

  // Button Handlers - Visualizer
  btnVisualize.addEventListener('click', () => {
    const seq = parseInputSequence(seqInput.value);
    if (seq) {
      visualizeSequence(seq, true);
    }
  });

  btnInsertSingle.addEventListener('click', () => {
    const raw = prompt('Enter a single integer to insert into the AVL Tree:');
    if (raw === null || raw.trim() === '') return;
    const val = Number(raw.trim());
    if (Number.isNaN(val) || !Number.isInteger(val)) {
      showToast('⚠️ Invalid integer entered.');
      return;
    }

    const currStep = animator.getCurrentStep();
    let currentKeys = [];
    if (currStep && currStep.treeSnapshot) {
      function collect(node) {
        if (!node) return;
        collect(node.left);
        currentKeys.push(node.key);
        collect(node.right);
      }
      collect(currStep.treeSnapshot);
    }

    if (currentKeys.includes(val)) {
      showToast(`⚠️ Key ${val} is already in the tree! Duplicate values are rejected.`);
      return;
    }

    currentKeys.push(val);
    seqInput.value = currentKeys.join(', ');
    visualizeSequence(currentKeys, true);
  });

  btnDeleteSingle.addEventListener('click', () => {
    const raw = prompt('Enter an integer key to delete from the AVL Tree:');
    if (raw === null || raw.trim() === '') return;
    const val = Number(raw.trim());
    if (Number.isNaN(val) || !Number.isInteger(val)) {
      showToast('⚠️ Invalid integer entered.');
      return;
    }

    const currStep = animator.getCurrentStep();
    let currentKeys = [];
    if (currStep && currStep.treeSnapshot) {
      function collect(node) {
        if (!node) return;
        collect(node.left);
        currentKeys.push(node.key);
        collect(node.right);
      }
      collect(currStep.treeSnapshot);
    }

    if (!currentKeys.includes(val)) {
      showToast(`⚠️ Key ${val} is not found in the current AVL Tree.`);
      return;
    }

    const filtered = currentKeys.filter(k => k !== val);
    seqInput.value = filtered.join(', ');
    if (filtered.length === 0) {
      simulator.clear();
      animator.loadSteps([], false);
      showToast('Tree is now empty.');
    } else {
      visualizeSequence(filtered, true);
    }
  });

  btnReset.addEventListener('click', () => {
    simulator.clear();
    animator.loadSteps([], false);
    historyList.innerHTML = '';
    showToast('Simulation reset.');
  });

  btnRandom.addEventListener('click', () => {
    const count = 6;
    const set = new Set();
    while (set.size < count) {
      set.add(Math.floor(Math.random() * 90) + 10);
    }
    const arr = Array.from(set);
    seqInput.value = arr.join(', ');
    visualizeSequence(arr, true);
  });

  // Preset Buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const seqStr = btn.dataset.sequence;
      if (seqStr) {
        seqInput.value = seqStr;
        const seq = seqStr.split(',').map(s => Number(s.trim()));
        visualizeSequence(seq, true);
      }
    });
  });

  // Playback Control Buttons
  btnPlayPause.addEventListener('click', () => {
    if (animator.isPlaying) {
      animator.pause();
    } else {
      animator.play();
    }
  });

  btnPrev.addEventListener('click', () => animator.stepPrev());
  btnNext.addEventListener('click', () => animator.stepNext());
  btnJumpEnd.addEventListener('click', () => animator.jumpToEnd());

  // Viewport Zoom & Fit
  btnZoomIn.addEventListener('click', () => renderer.zoomIn());
  btnZoomOut.addEventListener('click', () => renderer.zoomOut());
  btnFitView.addEventListener('click', () => renderer.resetView());

  // Export Snapshot / Screenshot Feature
  btnExportSnapshot.addEventListener('click', () => {
    try {
      const svg = document.getElementById('treeSvg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svg.clientWidth * 2 || 1800;
        canvas.height = svg.clientHeight * 2 || 1000;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `AVL_Tree_Screenshot_Step_${animator.currentIndex + 1}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);

        showToast('📸 Snapshot exported! Saved high-res image for your lab report.');
      };
      image.src = blobURL;
    } catch (err) {
      console.error(err);
      showToast('⚠️ Could not export snapshot directly. You may use Print Screen / Snipping Tool.');
    }
  });

  // ==========================================================================
  // TAB 2: BST VS AVL COMPARISON LOGIC
  // ==========================================================================
  const bstSeqInput = document.getElementById('bstSeqInput');
  const btnRunComparison = document.getElementById('btnRunComparison');
  const bstSvg = document.getElementById('bstSvg');
  const avlSvgMini = document.getElementById('avlSvgMini');
  const bstHeightVal = document.getElementById('bstHeightVal');
  const bstDepthVal = document.getElementById('bstDepthVal');
  const avlHeightVal = document.getElementById('avlHeightVal');
  const avlDepthVal = document.getElementById('avlDepthVal');

  const searchTargetInput = document.getElementById('searchTargetInput');
  const btnCompareSearch = document.getElementById('btnCompareSearch');
  const bstSearchSteps = document.getElementById('bstSearchSteps');
  const avlSearchSteps = document.getElementById('avlSearchSteps');
  const searchVerdict = document.getElementById('searchVerdict');

  let currentBSTRoot = null;
  let currentAVLSim = null;

  function runBSTComparisonDemo() {
    const raw = bstSeqInput ? bstSeqInput.value : '10, 20, 30, 40, 50, 60, 70';
    const numbers = raw.split(/[,;\s]+/).map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
    if (numbers.length === 0) return;

    // 1. Build standard unbalanced BST
    let bstRoot = null;
    numbers.forEach(num => {
      bstRoot = BSTComparison.bstInsert(bstRoot, num);
    });
    currentBSTRoot = bstRoot;
    const bstStats = BSTComparison.computeTreeStats(bstRoot);

    // 2. Build AVL Tree
    const avlSim = new AVL.AVLTreeSimulator();
    avlSim.insertSequence(numbers);
    currentAVLSim = avlSim;
    const avlStats = BSTComparison.computeTreeStats(avlSim.root);

    // Update Stats Chips
    if (bstHeightVal) bstHeightVal.textContent = bstStats.height;
    if (bstDepthVal) bstDepthVal.textContent = bstStats.maxDepth;
    if (avlHeightVal) avlHeightVal.textContent = avlStats.height;
    if (avlDepthVal) avlDepthVal.textContent = avlStats.maxDepth;

    // Render Mini Trees
    BSTComparison.renderMiniTree(bstSvg, bstRoot);
    BSTComparison.renderMiniTree(avlSvgMini, avlSim.root);

    // Run search if target entered
    if (searchTargetInput && searchTargetInput.value) {
      performSearchComparison(Number(searchTargetInput.value));
    }
  }

  function performSearchComparison(target) {
    if (!currentBSTRoot || !currentAVLSim || Number.isNaN(target)) return;

    // Search in BST
    const bstRes = BSTComparison.bstSearch(currentBSTRoot, target);
    // Search in AVL
    const avlRes = BSTComparison.bstSearch(currentAVLSim.root, target);

    if (bstSearchSteps) bstSearchSteps.textContent = `${bstRes.comparisons} comparisons (Path: ${bstRes.path.join(' → ')})`;
    if (avlSearchSteps) avlSearchSteps.textContent = `${avlRes.comparisons} comparisons (Path: ${avlRes.path.join(' → ')})`;

    // Re-render highlighting path
    BSTComparison.renderMiniTree(bstSvg, currentBSTRoot, bstRes.path);
    BSTComparison.renderMiniTree(avlSvgMini, currentAVLSim.root, avlRes.path);

    if (searchVerdict) {
      if (avlRes.comparisons < bstRes.comparisons) {
        const ratio = ((1 - avlRes.comparisons / bstRes.comparisons) * 100).toFixed(0);
        searchVerdict.innerHTML = `<span style="color:#059669; font-weight:700;">AVL Tree was ${ratio}% faster!</span> Required only ${avlRes.comparisons} comparisons vs ${bstRes.comparisons} in the skewed BST.`;
      } else {
        searchVerdict.innerHTML = `Both required similar comparisons for this key, but AVL strictly guarantees O(log N) worst-case.`;
      }
    }
  }

  if (btnRunComparison) {
    btnRunComparison.addEventListener('click', runBSTComparisonDemo);
  }

  if (btnCompareSearch) {
    btnCompareSearch.addEventListener('click', () => {
      const val = Number(searchTargetInput.value.trim());
      if (Number.isNaN(val)) {
        showToast('⚠️ Please enter an integer key to search.');
        return;
      }
      performSearchComparison(val);
    });
  }

  // Pre-load default prompt example: 30, 20, 10, 25, 28
  seqInput.value = '30, 20, 10, 25, 28';
  visualizeSequence([30, 20, 10, 25, 28], false);
});
