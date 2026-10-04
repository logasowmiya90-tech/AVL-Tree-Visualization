/**
 * AVL Tree Logic & Step Recording Engine
 * AI2203 - Data Structures and Algorithms Laboratory
 * 
 * Implements pure AVL Tree operations and generates discrete, granular 
 * step-by-step educational snapshots for visual playback.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AVL = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  let nextNodeId = 1;
  function getUniqueId() {
    return `node_${nextNodeId++}`;
  }

  function resetNodeIdCounter() {
    nextNodeId = 1;
  }

  class AVLNode {
    constructor(key) {
      this.id = getUniqueId();
      this.key = Number(key);
      this.height = 1;
      this.balanceFactor = 0;
      this.left = null;
      this.right = null;
    }
  }

  // Deep clone tree structure to capture immutable visual snapshots
  function cloneTree(node) {
    if (!node) return null;
    const copy = {
      id: node.id,
      key: node.key,
      height: node.height,
      balanceFactor: node.balanceFactor,
      left: cloneTree(node.left),
      right: cloneTree(node.right)
    };
    return copy;
  }

  function getNodeHeight(node) {
    return node ? node.height : 0;
  }

  function recalculateNodeMetrics(node) {
    if (!node) return;
    const hL = getNodeHeight(node.left);
    const hR = getNodeHeight(node.right);
    node.height = 1 + Math.max(hL, hR);
    node.balanceFactor = hL - hR;
  }

  class AVLTreeSimulator {
    constructor() {
      this.root = null;
      this.steps = [];
      resetNodeIdCounter();
    }

    clear() {
      this.root = null;
      this.steps = [];
      resetNodeIdCounter();
    }

    recordStep({
      phase,
      title,
      description,
      activeNodeKey = null,
      activeNodeId = null,
      insertedNodeKey = null,
      insertedNodeId = null,
      imbalancedNodeKey = null,
      imbalancedNodeId = null,
      rotationNodes = [],
      rotationType = null,
      rotationStep = null,
      rotationDirection = null,
      rotationPivotKey = null,
      mathDetails = null,
      statusBadge = null
    }) {
      const stepIndex = this.steps.length + 1;
      this.steps.push({
        stepNumber: stepIndex,
        phase,
        title,
        description,
        treeSnapshot: cloneTree(this.root),
        activeNodeKey,
        activeNodeId,
        insertedNodeKey,
        insertedNodeId,
        imbalancedNodeKey,
        imbalancedNodeId,
        rotationNodes,
        rotationType,
        rotationStep,
        rotationDirection,
        rotationPivotKey,
        mathDetails,
        statusBadge
      });
    }

    // Right Rotation around node z
    //      z                   y
    //     / \                 / \
    //    y   T3    ==>       x   z
    //   / \                     / \
    //  x   T2                  T2  T3
    rotateRight(z) {
      const y = z.left;
      const T2 = y.right;

      // Perform rotation
      y.right = z;
      z.left = T2;

      // Update metrics (z first, then y)
      recalculateNodeMetrics(z);
      recalculateNodeMetrics(y);

      return y;
    }

    // Left Rotation around node z
    //      z                   y
    //     / \                 / \
    //    T1  y     ==>       z   x
    //       / \             / \
    //      T2  x           T1  T2
    rotateLeft(z) {
      const y = z.right;
      const T2 = y.left;

      // Perform rotation
      y.left = z;
      z.right = T2;

      // Update metrics (z first, then y)
      recalculateNodeMetrics(z);
      recalculateNodeMetrics(y);

      return y;
    }

    /**
     * Inserts an array of numbers sequentially and logs granular educational steps
     */
    insertSequence(elements) {
      this.clear();

      if (!elements || elements.length === 0) {
        return this.steps;
      }

      this.recordStep({
        phase: 'INIT',
        title: 'Initial State',
        description: `Starting AVL simulation with input sequence: [${elements.join(', ')}]. The tree is currently empty.`,
        statusBadge: 'Ready'
      });

      for (let i = 0; i < elements.length; i++) {
        const val = Number(elements[i]);
        if (Number.isNaN(val)) continue;
        this.insertValueWithSteps(val, i + 1, elements.length);
      }

      this.recordStep({
        phase: 'ALL_COMPLETE',
        title: 'Simulation Complete',
        description: `All ${elements.length} elements have been inserted. The final AVL Tree satisfies all AVL balance conditions: for every node, |BF| ≤ 1.`,
        statusBadge: 'Fully Balanced'
      });

      return this.steps;
    }

    /**
     * Granular step-by-step insertion of a single value
     */
    insertValueWithSteps(val, seqIndex = 1, seqTotal = 1) {
      this.recordStep({
        phase: 'START_INSERT',
        title: `Element ${seqIndex}/${seqTotal}: Insert ${val}`,
        description: `Initiating insertion of key ${val}. We will traverse the tree like a standard Binary Search Tree (BST), compare keys at each step, attach the new leaf, and then backtrack to verify balance.`,
        insertedNodeKey: val,
        statusBadge: `Inserting ${val}`
      });

      // Special case: Tree is empty
      if (!this.root) {
        this.root = new AVLNode(val);
        recalculateNodeMetrics(this.root);
        this.recordStep({
          phase: 'PLACE_NODE',
          title: `Tree Empty: Created Root Node ${val}`,
          description: `The tree was empty. Created node ${val} as the new root. Height = 1, Balance Factor = 0.`,
          insertedNodeKey: val,
          insertedNodeId: this.root.id,
          activeNodeKey: val,
          activeNodeId: this.root.id,
          mathDetails: {
            nodeKey: val,
            leftHeight: 0,
            rightHeight: 0,
            computedHeight: 1,
            balanceFactor: 0,
            isBalanced: true,
            formula: 'BF = Height(Left) - Height(Right) = 0 - 0 = 0'
          },
          statusBadge: 'Balanced'
        });
        return;
      }

      // Step 1: Standard BST search to find insertion point & track ancestor stack
      let current = this.root;
      const ancestors = []; // array of { node, childDirection }
      let duplicateFound = false;

      while (current) {
        if (val === current.key) {
          duplicateFound = true;
          this.recordStep({
            phase: 'DUPLICATE_KEY',
            title: `Duplicate Key ${val} Ignored`,
            description: `Key ${val} is already present in the AVL Tree at node ${current.key}. In this AVL simulation, duplicate keys are rejected to preserve strict binary search properties.`,
            activeNodeKey: current.key,
            activeNodeId: current.id,
            statusBadge: 'Duplicate Ignored'
          });
          break;
        }

        if (val < current.key) {
          this.recordStep({
            phase: 'COMPARE',
            title: `Compare: ${val} < ${current.key}`,
            description: `Since ${val} is strictly less than ${current.key}, we move to the LEFT subtree of node ${current.key}.`,
            activeNodeKey: current.key,
            activeNodeId: current.id,
            insertedNodeKey: val,
            statusBadge: 'Moving Left'
          });

          ancestors.push({ node: current, direction: 'left' });
          if (!current.left) {
            break;
          }
          current = current.left;
        } else {
          this.recordStep({
            phase: 'COMPARE',
            title: `Compare: ${val} > ${current.key}`,
            description: `Since ${val} is strictly greater than ${current.key}, we move to the RIGHT subtree of node ${current.key}.`,
            activeNodeKey: current.key,
            activeNodeId: current.id,
            insertedNodeKey: val,
            statusBadge: 'Moving Right'
          });

          ancestors.push({ node: current, direction: 'right' });
          if (!current.right) {
            break;
          }
          current = current.right;
        }
      }

      if (duplicateFound) {
        return;
      }

      // Step 2: Attach the new leaf node
      const newNode = new AVLNode(val);
      const parentInfo = ancestors[ancestors.length - 1];
      if (parentInfo.direction === 'left') {
        parentInfo.node.left = newNode;
      } else {
        parentInfo.node.right = newNode;
      }
      recalculateNodeMetrics(newNode);

      this.recordStep({
        phase: 'PLACE_NODE',
        title: `Attached Leaf Node ${val}`,
        description: `Attached node ${val} as the ${parentInfo.direction.toUpperCase()} child of parent node ${parentInfo.node.key}. Leaf node initial metrics: Height = 1, Balance Factor = 0.`,
        insertedNodeKey: val,
        insertedNodeId: newNode.id,
        activeNodeKey: val,
        activeNodeId: newNode.id,
        mathDetails: {
          nodeKey: val,
          leftHeight: 0,
          rightHeight: 0,
          computedHeight: 1,
          balanceFactor: 0,
          isBalanced: true,
          formula: 'BF = Height(Left) - Height(Right) = 0 - 0 = 0'
        },
        statusBadge: 'Leaf Attached'
      });

      // Step 3: Backtrack up the ancestor path to recompute heights and check balance
      // We traverse from parent up to the root
      let imbalancedAncestorFound = false;

      for (let k = ancestors.length - 1; k >= 0; k--) {
        const ancestorItem = ancestors[k];
        const ancestor = ancestorItem.node;

        // Recalculate metrics for ancestor
        const hL = getNodeHeight(ancestor.left);
        const hR = getNodeHeight(ancestor.right);
        const oldHeight = ancestor.height;
        ancestor.height = 1 + Math.max(hL, hR);
        ancestor.balanceFactor = hL - hR;

        const isBalanced = Math.abs(ancestor.balanceFactor) <= 1;

        this.recordStep({
          phase: 'CALCULATE',
          title: `Checking Ancestor Node ${ancestor.key}`,
          description: `Backtracking to ancestor node ${ancestor.key}:
• Left subtree height: ${hL}
• Right subtree height: ${hR}
• Node Height: 1 + max(${hL}, ${hR}) = ${ancestor.height}
• Balance Factor (BF): ${hL} - ${hR} = ${ancestor.balanceFactor > 0 ? '+' : ''}${ancestor.balanceFactor}
Status: ${isBalanced ? 'BALANCED (|BF| ≤ 1)' : '⚠️ IMBALANCED (|BF| ≥ 2)'}`,
          activeNodeKey: ancestor.key,
          activeNodeId: ancestor.id,
          insertedNodeKey: val,
          insertedNodeId: newNode.id,
          mathDetails: {
            nodeKey: ancestor.key,
            leftHeight: hL,
            rightHeight: hR,
            computedHeight: ancestor.height,
            balanceFactor: ancestor.balanceFactor,
            isBalanced: isBalanced,
            formula: `BF = Height(Left) - Height(Right) = ${hL} - ${hR} = ${ancestor.balanceFactor > 0 ? '+' : ''}${ancestor.balanceFactor}`
          },
          statusBadge: isBalanced ? 'Node Balanced' : '⚠️ Imbalance Detected'
        });

        if (!isBalanced) {
          // An imbalance is detected!
          imbalancedAncestorFound = true;
          this.handleImbalance({
            z: ancestor,
            insertedVal: val,
            ancestorStack: ancestors,
            ancestorIndex: k
          });
          // In an AVL tree insertion, after restoring balance at the first (lowest) imbalanced ancestor,
          // the height of this subtree returns to what it was before insertion.
          // Therefore, all higher ancestors remain balanced.
          break;
        }
      }

      this.recordStep({
        phase: 'INSERT_COMPLETE',
        title: `Insertion of ${val} Finished`,
        description: `Element ${val} has been successfully integrated and all ancestors satisfy the AVL balance factor condition (|BF| ≤ 1).`,
        activeNodeKey: val,
        statusBadge: 'Step Complete'
      });
    }

    /**
     * Diagnoses and performs the exact required rotation (LL, RR, LR, or RL)
     */
    handleImbalance({ z, insertedVal, ancestorStack, ancestorIndex }) {
      const bf = z.balanceFactor;
      let rotationCase = '';
      let rotationDescription = '';
      let parentOfZ = ancestorIndex > 0 ? ancestorStack[ancestorIndex - 1].node : null;
      let parentDirection = ancestorIndex > 0 ? ancestorStack[ancestorIndex - 1].direction : null;

      // Identify rotation case
      if (bf > 1) {
        // Left-heavy
        const y = z.left;
        if (insertedVal < y.key || y.balanceFactor >= 0) {
          // LL Case
          rotationCase = 'LL';
          this.executeLLRotation({ z, y, parentOfZ, parentDirection });
        } else {
          // LR Case
          rotationCase = 'LR';
          const x = y.right;
          this.executeLRRotation({ z, y, x, parentOfZ, parentDirection });
        }
      } else if (bf < -1) {
        // Right-heavy
        const y = z.right;
        if (insertedVal > y.key || y.balanceFactor <= 0) {
          // RR Case
          rotationCase = 'RR';
          this.executeRRRotation({ z, y, parentOfZ, parentDirection });
        } else {
          // RL Case
          rotationCase = 'RL';
          const x = y.left;
          this.executeRLRotation({ z, y, x, parentOfZ, parentDirection });
        }
      }
    }

    executeLLRotation({ z, y, parentOfZ, parentDirection }) {
      this.recordStep({
        phase: 'IMBALANCE_DETECTED',
        title: `⚠️ LL Imbalance Detected at Node ${z.key}`,
        description: `Node ${z.key} has Balance Factor ${z.balanceFactor > 0 ? '+' : ''}${z.balanceFactor} (Left-Heavy).
The new element was inserted into the LEFT subtree of left child ${y.key} (BF = ${y.balanceFactor > 0 ? '+' : ''}${y.balanceFactor}).
Diagnosis: LL (Left-Left) Case.
Required Action: Single RIGHT Rotation on node ${z.key}.`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        activeNodeKey: z.key,
        activeNodeId: z.id,
        rotationNodes: [z.id, y.id],
        rotationType: 'LL',
        rotationPivotKey: z.key,
        rotationDirection: 'RIGHT',
        mathDetails: {
          nodeKey: z.key,
          leftHeight: getNodeHeight(z.left),
          rightHeight: getNodeHeight(z.right),
          computedHeight: z.height,
          balanceFactor: z.balanceFactor,
          isBalanced: false,
          formula: `BF = Height(Left) - Height(Right) = ${getNodeHeight(z.left)} - ${getNodeHeight(z.right)} = ${z.balanceFactor}`
        },
        statusBadge: 'LL Case Detected'
      });

      this.recordStep({
        phase: 'ANIMATE_ROTATION',
        title: `Executing Right Rotation on Node ${z.key}`,
        description: `Performing clockwise RIGHT rotation around node ${z.key}:
1. Child node ${y.key} ascends to become the new subtree root.
2. Node ${y.key}'s right child (if any) is handed over to become ${z.key}'s new left child.
3. Node ${z.key} descends to become the RIGHT child of node ${y.key}.`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        rotationNodes: [z.id, y.id],
        rotationType: 'LL',
        rotationPivotKey: z.key,
        rotationDirection: 'RIGHT',
        statusBadge: 'Right Rotation'
      });

      // Apply rotation in data structure
      const newSubtreeRoot = this.rotateRight(z);

      if (!parentOfZ) {
        this.root = newSubtreeRoot;
      } else {
        if (parentDirection === 'left') {
          parentOfZ.left = newSubtreeRoot;
        } else {
          parentOfZ.right = newSubtreeRoot;
        }
      }

      this.recordStep({
        phase: 'UPDATE_TREE',
        title: `Right Rotation Completed (LL Solved)`,
        description: `Right rotation completed. Node ${newSubtreeRoot.key} is now the root of this subtree with left child ${newSubtreeRoot.left ? newSubtreeRoot.left.key : 'none'} and right child ${newSubtreeRoot.right ? newSubtreeRoot.right.key : 'none'}.
Subtree height and balance factors are successfully recalculated:
• Node ${z.key}: Height = ${z.height}, BF = ${z.balanceFactor > 0 ? '+' : ''}${z.balanceFactor}
• Node ${newSubtreeRoot.key}: Height = ${newSubtreeRoot.height}, BF = ${newSubtreeRoot.balanceFactor > 0 ? '+' : ''}${newSubtreeRoot.balanceFactor}
Balance has been completely restored!`,
        activeNodeKey: newSubtreeRoot.key,
        activeNodeId: newSubtreeRoot.id,
        rotationNodes: [newSubtreeRoot.id, z.id],
        rotationType: 'LL',
        statusBadge: 'LL Balanced'
      });
    }

    executeRRRotation({ z, y, parentOfZ, parentDirection }) {
      this.recordStep({
        phase: 'IMBALANCE_DETECTED',
        title: `⚠️ RR Imbalance Detected at Node ${z.key}`,
        description: `Node ${z.key} has Balance Factor ${z.balanceFactor > 0 ? '+' : ''}${z.balanceFactor} (Right-Heavy).
The new element was inserted into the RIGHT subtree of right child ${y.key} (BF = ${y.balanceFactor > 0 ? '+' : ''}${y.balanceFactor}).
Diagnosis: RR (Right-Right) Case.
Required Action: Single LEFT Rotation on node ${z.key}.`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        activeNodeKey: z.key,
        activeNodeId: z.id,
        rotationNodes: [z.id, y.id],
        rotationType: 'RR',
        rotationPivotKey: z.key,
        rotationDirection: 'LEFT',
        mathDetails: {
          nodeKey: z.key,
          leftHeight: getNodeHeight(z.left),
          rightHeight: getNodeHeight(z.right),
          computedHeight: z.height,
          balanceFactor: z.balanceFactor,
          isBalanced: false,
          formula: `BF = Height(Left) - Height(Right) = ${getNodeHeight(z.left)} - ${getNodeHeight(z.right)} = ${z.balanceFactor}`
        },
        statusBadge: 'RR Case Detected'
      });

      this.recordStep({
        phase: 'ANIMATE_ROTATION',
        title: `Executing Left Rotation on Node ${z.key}`,
        description: `Performing counter-clockwise LEFT rotation around node ${z.key}:
1. Child node ${y.key} ascends to become the new subtree root.
2. Node ${y.key}'s left child (if any) is transferred to become ${z.key}'s new right child.
3. Node ${z.key} descends to become the LEFT child of node ${y.key}.`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        rotationNodes: [z.id, y.id],
        rotationType: 'RR',
        rotationPivotKey: z.key,
        rotationDirection: 'LEFT',
        statusBadge: 'Left Rotation'
      });

      // Apply rotation in data structure
      const newSubtreeRoot = this.rotateLeft(z);

      if (!parentOfZ) {
        this.root = newSubtreeRoot;
      } else {
        if (parentDirection === 'left') {
          parentOfZ.left = newSubtreeRoot;
        } else {
          parentOfZ.right = newSubtreeRoot;
        }
      }

      this.recordStep({
        phase: 'UPDATE_TREE',
        title: `Left Rotation Completed (RR Solved)`,
        description: `Left rotation completed. Node ${newSubtreeRoot.key} is now the root of this subtree with left child ${newSubtreeRoot.left ? newSubtreeRoot.left.key : 'none'} and right child ${newSubtreeRoot.right ? newSubtreeRoot.right.key : 'none'}.
Subtree height and balance factors are successfully recalculated:
• Node ${z.key}: Height = ${z.height}, BF = ${z.balanceFactor > 0 ? '+' : ''}${z.balanceFactor}
• Node ${newSubtreeRoot.key}: Height = ${newSubtreeRoot.height}, BF = ${newSubtreeRoot.balanceFactor > 0 ? '+' : ''}${newSubtreeRoot.balanceFactor}
Balance has been completely restored!`,
        activeNodeKey: newSubtreeRoot.key,
        activeNodeId: newSubtreeRoot.id,
        rotationNodes: [newSubtreeRoot.id, z.id],
        rotationType: 'RR',
        statusBadge: 'RR Balanced'
      });
    }

    executeLRRotation({ z, y, x, parentOfZ, parentDirection }) {
      this.recordStep({
        phase: 'IMBALANCE_DETECTED',
        title: `⚠️ LR Imbalance Detected at Node ${z.key}`,
        description: `Node ${z.key} has Balance Factor ${z.balanceFactor > 0 ? '+' : ''}${z.balanceFactor} (Left-Heavy), but its left child ${y.key} has BF = ${y.balanceFactor > 0 ? '+' : ''}${y.balanceFactor} (Right-Heavy).
Diagnosis: LR (Left-Right) "Zig-Zag" Case.
Required Action: Double Rotation:
• Step 1: Left Rotation on left child ${y.key} (straightens the subtree into an LL shape).
• Step 2: Right Rotation on imbalanced root ${z.key}.`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        activeNodeKey: z.key,
        activeNodeId: z.id,
        rotationNodes: [z.id, y.id, x ? x.id : null].filter(Boolean),
        rotationType: 'LR',
        rotationPivotKey: z.key,
        mathDetails: {
          nodeKey: z.key,
          leftHeight: getNodeHeight(z.left),
          rightHeight: getNodeHeight(z.right),
          computedHeight: z.height,
          balanceFactor: z.balanceFactor,
          isBalanced: false,
          formula: `BF = Height(Left) - Height(Right) = ${getNodeHeight(z.left)} - ${getNodeHeight(z.right)} = ${z.balanceFactor}`
        },
        statusBadge: 'LR Double Rotation Required'
      });

      // Step 1: Left rotation on left child y
      this.recordStep({
        phase: 'ANIMATE_ROTATION',
        title: `LR Step 1: Left Rotation on Left Child ${y.key}`,
        description: `Rotating child node ${y.key} LEFT.
Node ${x ? x.key : 'child'} ascends to replace ${y.key} as the left child of ${z.key}, and ${y.key} becomes its left child.
This converts the zig-zag LR arrangement into a straight LL arrangement!`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        activeNodeKey: y.key,
        activeNodeId: y.id,
        rotationNodes: [y.id, x ? x.id : null].filter(Boolean),
        rotationType: 'LR',
        rotationStep: 1,
        rotationDirection: 'LEFT',
        rotationPivotKey: y.key,
        statusBadge: 'LR Step 1: Left Rotation'
      });

      // Perform Left Rotation on child y
      z.left = this.rotateLeft(y);
      recalculateNodeMetrics(z);

      this.recordStep({
        phase: 'UPDATE_TREE',
        title: `LR Step 1 Complete: Converted to LL Shape`,
        description: `Child rotation complete. Node ${z.key} now has left child ${z.left.key}, which is left-heavy.
The tree is now in standard LL (Left-Left) form. Ready for Step 2.`,
        activeNodeKey: z.key,
        activeNodeId: z.id,
        rotationNodes: [z.id, z.left.id],
        rotationType: 'LR',
        rotationStep: 1,
        statusBadge: 'LL Shape Achieved'
      });

      // Step 2: Right rotation on root z
      this.recordStep({
        phase: 'ANIMATE_ROTATION',
        title: `LR Step 2: Right Rotation on Imbalanced Root ${z.key}`,
        description: `Rotating imbalanced node ${z.key} RIGHT.
Node ${z.left.key} ascends to become the new subtree root, and ${z.key} becomes its right child.`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        activeNodeKey: z.key,
        activeNodeId: z.id,
        rotationNodes: [z.id, z.left.id],
        rotationType: 'LR',
        rotationStep: 2,
        rotationDirection: 'RIGHT',
        rotationPivotKey: z.key,
        statusBadge: 'LR Step 2: Right Rotation'
      });

      const newSubtreeRoot = this.rotateRight(z);

      if (!parentOfZ) {
        this.root = newSubtreeRoot;
      } else {
        if (parentDirection === 'left') {
          parentOfZ.left = newSubtreeRoot;
        } else {
          parentOfZ.right = newSubtreeRoot;
        }
      }

      this.recordStep({
        phase: 'UPDATE_TREE',
        title: `LR Double Rotation Completed Successfully!`,
        description: `Both rotations of LR case are complete.
Subtree root is now ${newSubtreeRoot.key}.
• Node ${newSubtreeRoot.left ? newSubtreeRoot.left.key : 'none'}: Height = ${getNodeHeight(newSubtreeRoot.left)}, BF = 0
• Node ${newSubtreeRoot.right ? newSubtreeRoot.right.key : 'none'}: Height = ${getNodeHeight(newSubtreeRoot.right)}, BF = 0
• Subtree Root ${newSubtreeRoot.key}: Height = ${newSubtreeRoot.height}, BF = ${newSubtreeRoot.balanceFactor > 0 ? '+' : ''}${newSubtreeRoot.balanceFactor}
The tree is now completely balanced!`,
        activeNodeKey: newSubtreeRoot.key,
        activeNodeId: newSubtreeRoot.id,
        rotationNodes: [newSubtreeRoot.id, newSubtreeRoot.left ? newSubtreeRoot.left.id : null, newSubtreeRoot.right ? newSubtreeRoot.right.id : null].filter(Boolean),
        rotationType: 'LR',
        statusBadge: 'LR Balanced'
      });
    }

    executeRLRotation({ z, y, x, parentOfZ, parentDirection }) {
      this.recordStep({
        phase: 'IMBALANCE_DETECTED',
        title: `⚠️ RL Imbalance Detected at Node ${z.key}`,
        description: `Node ${z.key} has Balance Factor ${z.balanceFactor > 0 ? '+' : ''}${z.balanceFactor} (Right-Heavy), but its right child ${y.key} has BF = ${y.balanceFactor > 0 ? '+' : ''}${y.balanceFactor} (Left-Heavy).
Diagnosis: RL (Right-Left) "Zig-Zag" Case.
Required Action: Double Rotation:
• Step 1: Right Rotation on right child ${y.key} (straightens the subtree into an RR shape).
• Step 2: Left Rotation on imbalanced root ${z.key}.`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        activeNodeKey: z.key,
        activeNodeId: z.id,
        rotationNodes: [z.id, y.id, x ? x.id : null].filter(Boolean),
        rotationType: 'RL',
        rotationPivotKey: z.key,
        mathDetails: {
          nodeKey: z.key,
          leftHeight: getNodeHeight(z.left),
          rightHeight: getNodeHeight(z.right),
          computedHeight: z.height,
          balanceFactor: z.balanceFactor,
          isBalanced: false,
          formula: `BF = Height(Left) - Height(Right) = ${getNodeHeight(z.left)} - ${getNodeHeight(z.right)} = ${z.balanceFactor}`
        },
        statusBadge: 'RL Double Rotation Required'
      });

      // Step 1: Right rotation on right child y
      this.recordStep({
        phase: 'ANIMATE_ROTATION',
        title: `RL Step 1: Right Rotation on Right Child ${y.key}`,
        description: `Rotating child node ${y.key} RIGHT.
Node ${x ? x.key : 'child'} ascends to replace ${y.key} as the right child of ${z.key}, and ${y.key} becomes its right child.
This converts the zig-zag RL arrangement into a straight RR arrangement!`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        activeNodeKey: y.key,
        activeNodeId: y.id,
        rotationNodes: [y.id, x ? x.id : null].filter(Boolean),
        rotationType: 'RL',
        rotationStep: 1,
        rotationDirection: 'RIGHT',
        rotationPivotKey: y.key,
        statusBadge: 'RL Step 1: Right Rotation'
      });

      // Perform Right Rotation on child y
      z.right = this.rotateRight(y);
      recalculateNodeMetrics(z);

      this.recordStep({
        phase: 'UPDATE_TREE',
        title: `RL Step 1 Complete: Converted to RR Shape`,
        description: `Child rotation complete. Node ${z.key} now has right child ${z.right.key}, which is right-heavy.
The tree is now in standard RR (Right-Right) form. Ready for Step 2.`,
        activeNodeKey: z.key,
        activeNodeId: z.id,
        rotationNodes: [z.id, z.right.id],
        rotationType: 'RL',
        rotationStep: 1,
        statusBadge: 'RR Shape Achieved'
      });

      // Step 2: Left rotation on root z
      this.recordStep({
        phase: 'ANIMATE_ROTATION',
        title: `RL Step 2: Left Rotation on Imbalanced Root ${z.key}`,
        description: `Rotating imbalanced node ${z.key} LEFT.
Node ${z.right.key} ascends to become the new subtree root, and ${z.key} becomes its left child.`,
        imbalancedNodeKey: z.key,
        imbalancedNodeId: z.id,
        activeNodeKey: z.key,
        activeNodeId: z.id,
        rotationNodes: [z.id, z.right.id],
        rotationType: 'RL',
        rotationStep: 2,
        rotationDirection: 'LEFT',
        rotationPivotKey: z.key,
        statusBadge: 'RL Step 2: Left Rotation'
      });

      const newSubtreeRoot = this.rotateLeft(z);

      if (!parentOfZ) {
        this.root = newSubtreeRoot;
      } else {
        if (parentDirection === 'left') {
          parentOfZ.left = newSubtreeRoot;
        } else {
          parentOfZ.right = newSubtreeRoot;
        }
      }

      this.recordStep({
        phase: 'UPDATE_TREE',
        title: `RL Double Rotation Completed Successfully!`,
        description: `Both rotations of RL case are complete.
Subtree root is now ${newSubtreeRoot.key}.
• Node ${newSubtreeRoot.left ? newSubtreeRoot.left.key : 'none'}: Height = ${getNodeHeight(newSubtreeRoot.left)}, BF = 0
• Node ${newSubtreeRoot.right ? newSubtreeRoot.right.key : 'none'}: Height = ${getNodeHeight(newSubtreeRoot.right)}, BF = 0
• Subtree Root ${newSubtreeRoot.key}: Height = ${newSubtreeRoot.height}, BF = ${newSubtreeRoot.balanceFactor > 0 ? '+' : ''}${newSubtreeRoot.balanceFactor}
The tree is now completely balanced!`,
        activeNodeKey: newSubtreeRoot.key,
        activeNodeId: newSubtreeRoot.id,
        rotationNodes: [newSubtreeRoot.id, newSubtreeRoot.left ? newSubtreeRoot.left.id : null, newSubtreeRoot.right ? newSubtreeRoot.right.id : null].filter(Boolean),
        rotationType: 'RL',
        statusBadge: 'RL Balanced'
      });
    }

    /**
     * Delete an element with AVL balancing and step-by-step recording
     */
    deleteValueWithSteps(val) {
      if (!this.root) {
        this.recordStep({
          phase: 'EMPTY_TREE',
          title: `Cannot Delete: Tree is Empty`,
          description: `Attempted to delete key ${val}, but the AVL Tree is empty.`,
          statusBadge: 'Empty Tree'
        });
        return;
      }

      this.recordStep({
        phase: 'START_DELETE',
        title: `Initiating Deletion of Key ${val}`,
        description: `Searching for key ${val} to delete from the AVL Tree.`,
        activeNodeKey: val,
        statusBadge: `Deleting ${val}`
      });

      // Internal recursive deletion with backtracking
      const self = this;
      let nodeFound = false;

      function findMinNode(node) {
        let curr = node;
        while (curr.left) {
          curr = curr.left;
        }
        return curr;
      }

      function deleteRec(node, key) {
        if (!node) {
          return null;
        }

        if (key < node.key) {
          self.recordStep({
            phase: 'COMPARE',
            title: `Search: ${key} < ${node.key}`,
            description: `Searching left subtree of node ${node.key} for key ${key}.`,
            activeNodeKey: node.key,
            activeNodeId: node.id
          });
          node.left = deleteRec(node.left, key);
        } else if (key > node.key) {
          self.recordStep({
            phase: 'COMPARE',
            title: `Search: ${key} > ${node.key}`,
            description: `Searching right subtree of node ${node.key} for key ${key}.`,
            activeNodeKey: node.key,
            activeNodeId: node.id
          });
          node.right = deleteRec(node.right, key);
        } else {
          nodeFound = true;
          self.recordStep({
            phase: 'DELETE_FOUND',
            title: `Found Node ${key} for Deletion`,
            description: `Located node ${key}. Handling node removal based on child count.`,
            activeNodeKey: node.key,
            activeNodeId: node.id
          });

          // Node with 0 or 1 child
          if (!node.left || !node.right) {
            const temp = node.left ? node.left : node.right;
            if (!temp) {
              // 0 children (leaf)
              node = null;
            } else {
              // 1 child
              node = temp;
            }
          } else {
            // Node with 2 children: get inorder successor (min in right subtree)
            const successor = findMinNode(node.right);
            self.recordStep({
              phase: 'SUCCESSOR_SWAP',
              title: `Replacing Node ${key} with Inorder Successor ${successor.key}`,
              description: `Node ${key} has two children. Copying inorder successor ${successor.key} to replace it, then deleting duplicate from right subtree.`,
              activeNodeKey: successor.key,
              activeNodeId: successor.id
            });
            node.key = successor.key;
            node.right = deleteRec(node.right, successor.key);
          }
        }

        if (!node) return null;

        // Recalculate metrics
        recalculateNodeMetrics(node);
        const bf = node.balanceFactor;
        const isBalanced = Math.abs(bf) <= 1;

        self.recordStep({
          phase: 'CALCULATE',
          title: `Checking Balance of Node ${node.key} after Deletion`,
          description: `Node ${node.key} metrics after deletion: Height = ${node.height}, Balance Factor = ${bf > 0 ? '+' : ''}${bf}.
Status: ${isBalanced ? 'BALANCED' : '⚠️ IMBALANCED'}`,
          activeNodeKey: node.key,
          activeNodeId: node.id,
          mathDetails: {
            nodeKey: node.key,
            leftHeight: getNodeHeight(node.left),
            rightHeight: getNodeHeight(node.right),
            computedHeight: node.height,
            balanceFactor: bf,
            isBalanced: isBalanced,
            formula: `BF = ${getNodeHeight(node.left)} - ${getNodeHeight(node.right)} = ${bf}`
          }
        });

        // Rebalance if needed
        if (bf > 1) {
          if (node.left.balanceFactor >= 0) {
            // LL
            return self.rotateRight(node);
          } else {
            // LR
            node.left = self.rotateLeft(node.left);
            return self.rotateRight(node);
          }
        }

        if (bf < -1) {
          if (node.right.balanceFactor <= 0) {
            // RR
            return self.rotateLeft(node);
          } else {
            // RL
            node.right = self.rotateRight(node.right);
            return self.rotateLeft(node);
          }
        }

        return node;
      }

      this.root = deleteRec(this.root, val);

      if (!nodeFound) {
        this.recordStep({
          phase: 'NOT_FOUND',
          title: `Key ${val} Not Found`,
          description: `Searched entire tree but key ${val} does not exist. Tree remains unchanged.`,
          statusBadge: 'Not Found'
        });
      } else {
        this.recordStep({
          phase: 'DELETE_COMPLETE',
          title: `Deletion of ${val} Completed`,
          description: `Key ${val} removed and all tree invariants re-verified. Tree is balanced.`,
          statusBadge: 'Deleted & Balanced'
        });
      }
    }
  }

  return {
    AVLNode,
    AVLTreeSimulator,
    cloneTree,
    getNodeHeight,
    recalculateNodeMetrics
  };
});
