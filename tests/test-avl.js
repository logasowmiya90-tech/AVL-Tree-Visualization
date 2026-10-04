const { AVLTreeSimulator } = require('../js/avl-logic.js');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

function verifyAVLInvariants(node) {
  if (!node) return 0;
  const hL = verifyAVLInvariants(node.left);
  const hR = verifyAVLInvariants(node.right);
  const expectedHeight = 1 + Math.max(hL, hR);
  const expectedBF = hL - hR;

  assert(node.height === expectedHeight, `Node ${node.key} height match: got ${node.height}, expected ${expectedHeight}`);
  assert(node.balanceFactor === expectedBF, `Node ${node.key} BF match: got ${node.balanceFactor}, expected ${expectedBF}`);
  assert(Math.abs(expectedBF) <= 1, `Node ${node.key} balanced: |BF| <= 1 (was ${expectedBF})`);

  return expectedHeight;
}

console.log('--- TEST 1: LL Rotation (30, 20, 10) ---');
const simLL = new AVLTreeSimulator();
const stepsLL = simLL.insertSequence([30, 20, 10]);
const hasLL = stepsLL.some(s => s.rotationType === 'LL');
assert(hasLL, 'LL rotation was correctly detected and recorded');
assert(simLL.root.key === 20, `Root is 20 (got ${simLL.root.key})`);
assert(simLL.root.left.key === 10, `Root left is 10 (got ${simLL.root.left.key})`);
assert(simLL.root.right.key === 30, `Root right is 30 (got ${simLL.root.right.key})`);
verifyAVLInvariants(simLL.root);

console.log('\n--- TEST 2: RR Rotation (10, 20, 30) ---');
const simRR = new AVLTreeSimulator();
const stepsRR = simRR.insertSequence([10, 20, 30]);
const hasRR = stepsRR.some(s => s.rotationType === 'RR');
assert(hasRR, 'RR rotation was correctly detected and recorded');
assert(simRR.root.key === 20, `Root is 20 (got ${simRR.root.key})`);
assert(simRR.root.left.key === 10, `Root left is 10 (got ${simRR.root.left.key})`);
assert(simRR.root.right.key === 30, `Root right is 30 (got ${simRR.root.right.key})`);
verifyAVLInvariants(simRR.root);

console.log('\n--- TEST 3: LR Rotation (30, 10, 20) ---');
const simLR = new AVLTreeSimulator();
const stepsLR = simLR.insertSequence([30, 10, 20]);
const hasLR = stepsLR.some(s => s.rotationType === 'LR');
assert(hasLR, 'LR rotation was correctly detected and recorded');
assert(simLR.root.key === 20, `Root is 20 (got ${simLR.root.key})`);
assert(simLR.root.left.key === 10, `Root left is 10 (got ${simLR.root.left.key})`);
assert(simLR.root.right.key === 30, `Root right is 30 (got ${simLR.root.right.key})`);
verifyAVLInvariants(simLR.root);

console.log('\n--- TEST 4: RL Rotation (10, 30, 20) ---');
const simRL = new AVLTreeSimulator();
const stepsRL = simRL.insertSequence([10, 30, 20]);
const hasRL = stepsRL.some(s => s.rotationType === 'RL');
assert(hasRL, 'RL rotation was correctly detected and recorded');
assert(simRL.root.key === 20, `Root is 20 (got ${simRL.root.key})`);
assert(simRL.root.left.key === 10, `Root left is 10 (got ${simRL.root.left.key})`);
assert(simRL.root.right.key === 30, `Root right is 30 (got ${simRL.root.right.key})`);
verifyAVLInvariants(simRL.root);

console.log('\n--- TEST 5: Prompt Example Sequence (30, 20, 10, 25, 28) ---');
const simEx = new AVLTreeSimulator();
const stepsEx = simEx.insertSequence([30, 20, 10, 25, 28]);
verifyAVLInvariants(simEx.root);
console.log(`Generated ${stepsEx.length} detailed micro-steps for sequence [30, 20, 10, 25, 28].`);

console.log('\n--- TEST 6: Multiple Complex Rotations ---');
const simMulti = new AVLTreeSimulator();
const multiSeq = [50, 25, 75, 10, 30, 60, 90, 5, 15, 27, 35, 28];
const stepsMulti = simMulti.insertSequence(multiSeq);
verifyAVLInvariants(simMulti.root);
console.log(`Generated ${stepsMulti.length} detailed micro-steps for multi-sequence.`);

console.log('\n🎉 ALL AVL LOGIC TESTS PASSED WITH 100% ACCURACY!');
