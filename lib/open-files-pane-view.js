'use babel';

import { CompositeDisposable } from 'atom';
import ExtendedTreeView from './extended-tree-view';

export default class OpenFilesPaneView {
  constructor(pane) {
    this.extendedTreeView = new ExtendedTreeView({
      activeItem: pane.getActiveItem(),
      title: 'Open Files',
      items: pane.getItems(),
    });

    this.setPane(pane);
  }

  get element() {
    return this.extendedTreeView.element;
  }

  destroy() {
    this.extendedTreeView.destroy();
    this.paneSub.dispose();
    this.extendedTreeView = null;
  }

  setPane(pane) {
    if (this.paneSub) {
      this.paneSub.dispose();
    }

    this.paneSub = new CompositeDisposable();
		this.pane = pane;

    this.paneSub.add(atom.workspace.onDidChangeActivePaneItem(activeItem => {
      this.extendedTreeView.setState({ activeItem });
    }))

		this.paneSub.add(pane.observeItems(item => {
      if (item.onDidChangeTitle != null) {
        this.paneSub.add(item.onDidChangeTitle(this.extendedTreeView.render));
      }
      if (item.onDidChangeModified != null) {
        this.paneSub.add(item.onDidChangeModified(this.extendedTreeView.render));
      }
    }));

    const updateItems = () => this.extendedTreeView.setState({ items: this.pane.getItems() });
    this.paneSub.add(pane.onDidAddItem(updateItems));
    this.paneSub.add(pane.onDidMoveItem(updateItems));
    this.paneSub.add(pane.onDidRemoveItem(updateItems));
    this.paneSub.add(pane.onDidDestroy(() => this.paneSub.dispose()));
	}
}
