'use babel';

import { CompositeDisposable } from 'atom';
import { requirePackages } from 'atom-utils';
import PaneView from './pane-view';

export default class MainView {
  constructor(serializedState) { // eslint-disable-line no-unused-vars
    window.a = this;
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('tree-view-open-files-plus');

    this.configSubs = new CompositeDisposable();
    this.configSubs.add(atom.config.observe('tree-view-open-files-plus.maxHeight', (maxHeight) => {
      this.element.style.maxHeight = maxHeight > 0 ? `${maxHeight}px` : 'none';
    }));
    this.configSubs.add(atom.config.observe('tree-view-open-files-plus.sticky', (isSticky) => {
      this.isSticky = isSticky;
      if (this.isShowing()) {
        this.hide();
        this.show();
      }
    }));

    this.paneViews = [];
    this.paneSubs = new CompositeDisposable();
    this.paneSubs.add(atom.workspace.observePanes(this.addPane.bind(this)));
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
		this.paneSubs.dispose();
    this.configSubs.dispose();
  }

  getElement() {
    return this.element;
  }

  addPane(pane) {
		const paneView = new PaneView(pane);
		this.paneViews.push(paneView);
		this.element.appendChild(paneView.element);

    const destroySub = pane.onDidDestroy(() => {
      destroySub.dispose();
      this.removePane(pane);
    });

    this.paneSubs.add(destroySub);
	}

	removePane(pane) {
    const index = this.paneViews.findIndex(view => view.pane === pane);
    if (index === -1) {
      return;
    }
		this.paneViews[index].destroy();
		this.paneViews.splice(index, 1);
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
