# AVL Tree Visualization and Balancing System
**Course:** AI2203 – Data Structures and Algorithms Laboratory  
**Project Category:** Academic Mini Project / Interactive Pedagogical Tool  
**Technologies:** Vanilla HTML5, CSS3, SVG Graphics, Object-Oriented JavaScript (Zero Dependencies)

---

## 📖 Project Overview

The **AVL Tree Visualization and Balancing System** is a professional, interactive educational web application engineered specifically for second-year engineering students and instructors. It demystifies the dynamic balancing mechanics of AVL Trees (Adelson-Velsky and Landis, 1962).

Unlike standard tree visualizers that jump directly from an input sequence to the final balanced tree, this system decomposes the entire pipeline into **discrete, granular micro-steps**:
1. **Insert**: Announces the element to be inserted.
2. **Compare**: Traces root-to-leaf BST search paths, highlighting traversed nodes.
3. **Place Leaf**: Inserts the new node with initial metrics ($h = 1, \text{BF} = 0$).
4. **Calculate Height & BF**: Backtracks up the ancestor chain, showing live mathematical evaluations:
   $$\text{Balance Factor} = \text{Height}(\text{Left Subtree}) - \text{Height}(\text{Right Subtree})$$
5. **Imbalance Diagnosis**: Pinpoints imbalanced nodes ($|\text{BF}| \ge 2$) with pulsating visual alarms and diagnoses the exact rotation case (**LL, RR, LR, RL**).
6. **Animate Rotation**: Shows rotational arcs and step-by-step subtree re-linking (including Step 1 and Step 2 separately for double rotations).
7. **Verify Balance**: Continues ancestor verification until the tree is fully balanced.

---

## 🚀 How to Run the Application

The application is completely self-contained and requires **no build tools or external internet access**.

### Option A: Direct Browser Launch (Easiest)
Simply double-click `index.html` or open it with any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).

### Option B: Local HTTP Server
Using Python:
```bash
python -m http.server 3000 --directory C:\Users\Admin\.gemini\antigravity\scratch\avl-tree-system
```
Then navigate to: `http://localhost:3000`

Using Node.js / npx:
```bash
npx serve C:\Users\Admin\.gemini\antigravity\scratch\avl-tree-system
```

---

## 🎯 Verification of Core Requirements

| Test Sequence | Rotation Detected | Expected Action | Result |
| :--- | :--- | :--- | :--- |
| `30, 20, 10` | **LL Case** | Single Right Rotation around 30 | ✅ Passed (Root = 20) |
| `10, 20, 30` | **RR Case** | Single Left Rotation around 10 | ✅ Passed (Root = 20) |
| `30, 10, 20` | **LR Case** | Double Rotation (Step 1 Left, Step 2 Right) | ✅ Passed (Root = 20) |
| `10, 30, 20` | **RL Case** | Double Rotation (Step 1 Right, Step 2 Left) | ✅ Passed (Root = 20) |
| `30, 20, 10, 25, 28` | **LL & LR** | Multi-step sequential rebalancing | ✅ Passed (Root = 20, BF: -1) |

---

## 🏗️ System Architecture

```text
avl-tree-system/
├── index.html              # Main single-page application with 5 comprehensive tabs
├── css/
│   └── styles.css          # Clean academic styling, node badges, animations, print/screenshot rules
├── js/
│   ├── avl-logic.js        # Pure AVL data structure & immutable step snapshot recorder
│   ├── tree-renderer.js    # Interactive SVG renderer (smooth positioning, pan/zoom, rotation cues)
│   ├── animator.js         # Playback controller (Play/Pause, Next/Prev, Speed, Timeline scrubber)
│   ├── bst-comparison.js   # Side-by-side BST vs AVL skew benchmark and live search tester
│   └── app.js              # UI controller wiring tabs, presets, snapshot export, and notifications
├── tests/
│   ├── test-avl.js         # Unit test suite verifying core AVL invariants
│   └── verify-all.js       # Comprehensive verification runner for all preset sequences
└── README.md               # Complete lab documentation and user manual
```

---

## 📸 Screenshots & Presentation Checklist for AI2203 Lab Report

Use the built-in **"📸 Snapshot"** button in the canvas toolbar to export crisp high-resolution PNG images for your laboratory record:
1. **Home / Initial State**: Empty tree ready for input.
2. **Search / Comparison Step**: Traversal down the tree highlighting compared nodes in amber.
3. **Leaf Insertion**: Green-highlighted newly attached node.
4. **Imbalance Detected**: Crimson pulsating card with warning badge when $|\text{BF}| \ge 2$.
5. **LL Rotation**: Clockwise rotation cue around pivot.
6. **RR Rotation**: Counter-clockwise rotation cue around pivot.
7. **LR Rotation (Step 1 & Step 2)**: Double rotation showing intermediate LL form.
8. **RL Rotation (Step 1 & Step 2)**: Double rotation showing intermediate RR form.
9. **Final Balanced Tree**: All nodes with $|\text{BF}| \le 1$.
10. **BST vs AVL Comparison Tab**: Side-by-side view showing standard BST degenerating into a line ($O(N)$ depth) vs balanced AVL ($O(\log N)$ depth).
11. **Real-World Applications Tab**: High-level overview of database indexing, OS schedulers, and network routing.

---

## 🎓 Viva Voce Quick Revision Guide

1. **What is an AVL Tree?**  
   A self-balancing binary search tree where for every node, the height difference between left and right subtrees is at most 1: $\text{BF} \in \{-1, 0, +1\}$.
2. **What is the formula for Balance Factor?**  
   $\text{BF}(N) = \text{Height}(\text{Left Subtree}) - \text{Height}(\text{Right Subtree})$.
3. **What is the worst-case height of an AVL tree?**  
   Strictly bounded by $h < 1.44 \log_2(n+2)$, derived from the Fibonacci tree recurrence $N(h) = 1 + N(h-1) + N(h-2)$.
4. **Why are rotations $O(1)$?**  
   They only adjust a fixed number of pointer references (3 pointer swaps) and recalculate the height of 2 nodes.
5. **How many rotations are needed on insertion vs deletion?**  
   Insertion requires at most **1 rotation** (single or double). Deletion may require up to $O(\log n)$ rotations up the ancestor chain.
