'use babel';

import { requirePackages } from 'atom-utils';

export default class ExtendedBase {
  constructor() {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('tree-view-extended');
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  isShowing() {
    return this.element.parentElement != null;
  }

	show() {
    requirePackages('tree-view').then(([treeView]) => {
      const parentElement = treeView.treeView.element.querySelector('li[is="tree-view-directory"]');
      parentElement.insertBefore(this.element, parentElement.firstChild)
		});
	}

  toggle() {
		if (this.isShowing()) {
			this.destroy();
		} else {
			this.show();
		}
	}
}
