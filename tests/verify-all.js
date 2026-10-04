/**
 * Automated Verification Script for AVL Visualization Engine
 * AI2203 - Data Structures and Algorithms Laboratory
 */

const { AVLTreeSimulator } = require('../js/avl-logic.js');

function testSequence(name, sequence, expectedCases = []) {
  console.log(`\n======================================================`);
  console.log(`TEST SUITE: ${name}`);
  console.log(`Input Sequence: [${sequence.join(', ')}]`);
  console.log(`======================================================`);

  const sim = new AVLTreeSimulator();
  const steps = sim.insertSequence(sequence);

  console.log(`Total granular micro-steps generated: ${steps.length}`);

  // Check key phases exist
  const phases = new Set(steps.map(s => s.phase));
  const expectedPhases = ['START_INSERT', 'PLACE_NODE', 'CALCULATE', 'ALL_COMPLETE'];
  for (const ep of expectedPhases) {
    if (!phases.has(ep)) {
      throw new Error(`Missing expected phase: ${ep}`);
    }
  }

  // Check rotation cases
  const detectedRotations = steps
    .filter(s => s.rotationType)
    .map(s => s.rotationType);
  const uniqueRotations = [...new Set(detectedRotations)];

  console.log(`Detected Rotations: ${uniqueRotations.join(', ') || 'None'}`);

  for (const expCase of expectedCases) {
    if (!uniqueRotations.includes(expCase)) {
      throw new Error(`Expected rotation case "${expCase}" was not detected!`);
    }
  }

  // Verify all nodes in the final tree satisfy AVL invariants
  function checkNode(node) {
    if (!node) return 0;
    const hL = checkNode(node.left);
    const hR = checkNode(node.right);
    const h = 1 + Math.max(hL, hR);
    const bf = hL - hR;

    if (node.height !== h) {
      throw new Error(`Height mismatch at node ${node.key}: got ${node.height}, computed ${h}`);
    }
    if (node.balanceFactor !== bf) {
      throw new Error(`BF mismatch at node ${node.key}: got ${node.balanceFactor}, computed ${bf}`);
    }
    if (Math.abs(bf) > 1) {
      throw new Error(`Node ${node.key} is IMBALANCED in final tree! BF = ${bf}`);
    }
    return h;
  }

  checkNode(sim.root);
  console.log(`Final Root Key: ${sim.root.key}, Height: ${sim.root.height}, BF: ${sim.root.balanceFactor}`);
  console.log(`✅ All AVL invariants verified successfully!`);
}

try {
  // 1. LL Case
  testSequence('Preset 1: LL Rotation', [30, 20, 10], ['LL']);

  // 2. RR Case
  testSequence('Preset 2: RR Rotation', [10, 20, 30], ['RR']);

  // 3. LR Case
  testSequence('Preset 3: LR Rotation', [30, 10, 20], ['LR']);

  // 4. RL Case
  testSequence('Preset 4: RL Rotation', [10, 30, 20], ['RL']);

  // 5. Prompt Example Sequence
  testSequence('Preset 5: Prompt Demo (30, 20, 10, 25, 28)', [30, 20, 10, 25, 28], ['LL']);

  // 6. Complex Multi-Rotation Sequence
  testSequence('Preset 6: Multiple Balance Operations', [50, 25, 10, 5, 20, 75, 80, 85, 30, 28]);

  // 7. Strictly Sorted Sequence (Worst-case BST input)
  testSequence('Ascending Sorted Sequence', [10, 20, 30, 40, 50, 60, 70], ['RR']);

  console.log(`\n🎉 ALL AUTOMATED TESTS COMPLETED WITH 100% SUCCESS!\n`);
} catch (err) {
  console.error(`❌ TEST FAILED:`, err);
  process.exit(1);
}
