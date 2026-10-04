/**
 * Step-by-Step Animation Controller
 * AI2203 - Data Structures and Algorithms Laboratory
 * 
 * Provides Play, Pause, Step Next, Step Prev, Speed Control,
 * and timeline navigation for the AVL simulation.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StepAnimator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  class StepAnimator {
    constructor(options = {}) {
      this.steps = [];
      this.currentIndex = -1;
      this.isPlaying = false;
      this.speed = options.speed || 900; // ms per step
      this.timerId = null;

      this.onStepChange = options.onStepChange || (() => {});
      this.onStateChange = options.onStateChange || (() => {});
    }

    loadSteps(steps, startAutoPlay = false) {
      this.pause();
      this.steps = steps || [];
      this.currentIndex = this.steps.length > 0 ? 0 : -1;

      this.triggerStep();

      if (startAutoPlay && this.steps.length > 1) {
        this.play();
      }
    }

    getCurrentStep() {
      if (this.currentIndex >= 0 && this.currentIndex < this.steps.length) {
        return this.steps[this.currentIndex];
      }
      return null;
    }

    triggerStep() {
      const step = this.getCurrentStep();
      this.onStepChange(step, this.currentIndex, this.steps.length);
    }

    setSpeed(speedMs) {
      this.speed = Math.max(150, Math.min(3000, Number(speedMs)));
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    }

    play() {
      if (this.isPlaying || this.steps.length === 0) return;
      
      // If at end, loop to start
      if (this.currentIndex >= this.steps.length - 1) {
        this.currentIndex = 0;
        this.triggerStep();
      }

      this.isPlaying = true;
      this.onStateChange(true);

      const tick = () => {
        if (!this.isPlaying) return;

        if (this.currentIndex < this.steps.length - 1) {
          this.currentIndex++;
          this.triggerStep();
          this.timerId = setTimeout(tick, this.speed);
        } else {
          // Reached end
          this.pause();
        }
      };

      this.timerId = setTimeout(tick, this.speed);
    }

    pause() {
      this.isPlaying = false;
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.onStateChange(false);
    }

    stepNext() {
      this.pause();
      if (this.currentIndex < this.steps.length - 1) {
        this.currentIndex++;
        this.triggerStep();
      }
    }

    stepPrev() {
      this.pause();
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.triggerStep();
      }
    }

    goToStep(index) {
      this.pause();
      if (index >= 0 && index < this.steps.length) {
        this.currentIndex = index;
        this.triggerStep();
      }
    }

    jumpToEnd() {
      this.pause();
      if (this.steps.length > 0) {
        this.currentIndex = this.steps.length - 1;
        this.triggerStep();
      }
    }

    reset() {
      this.pause();
      if (this.steps.length > 0) {
        this.currentIndex = 0;
        this.triggerStep();
      } else {
        this.currentIndex = -1;
        this.triggerStep();
      }
    }
  }

  return StepAnimator;
});
