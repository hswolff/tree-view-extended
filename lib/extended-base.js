'use babel';

import { CompositeDisposable } from 'atom';
import { requirePackages } from 'atom-utils';

export default class ExtendedBase {
  constructor() {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('tree-view-extended');

    this.configSubs = new CompositeDisposable();
  }

  createObservers({ stickyKey }) {
    const fullStickyKey = `tree-view-extended.${stickyKey}`;

    this.configSubs.add(atom.config.observe(fullStickyKey, (isSticky) => {
      this.isSticky = isSticky;
      if (this.isShowing()) {
        this.hide();
        this.show();
      }
    }));

    this.configSubs.add(atom.config.observe('tree-view-extended.maxHeight', (maxHeight) => {
      // Only apply a max height if the view is sticky.
      if (this.isSticky) {
        this.element.style.maxHeight = maxHeight > 0 ? `${maxHeight}px` : 'none';
      }
    }));
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    this.configSubs.dispose();
  }

  isShowing() {
    return this.element.parentElement != null;
  }

	toggle() {
		if (this.isShowing()) {
			this.hide();
		} else {
			this.show();
		}
	}

	hide() {
		this.element.remove();
	}

	show() {
		requirePackages('tree-view').then(([treeView]) => {
      const treeViewBackground = treeView.treeView.find('.tree-view').css('background');
      treeView.treeView.find('.tree-view-scroller').css('background', treeViewBackground);

      if (this.isSticky) {
        treeView.treeView.prepend(this.element);
      } else {
        const parentElement = treeView.treeView.element.querySelector('.tree-view-scroller')
        parentElement.insertBefore(this.element, parentElement.firstChild)
      }
		});
	}
}
