'use babel';

import _ from 'lodash';
import { CompositeDisposable } from 'atom';
import hyperx from 'hyperx';
import { h, Component, render } from 'preact';
import ExtendedTreeView from './extended-tree-view-preact';

const hx = hyperx(h);
const EmptyComponent = () => null;

export default class OpenFilesPaneView {
  constructor(pane) {
    this.element = document.createElement('div');

    this.state = {
      activeItem: pane.getActiveItem(),
      title: 'Open Files',
      items: pane.getItems(),
    };

    this.setPane(pane);
  }

  destroy() {
    this.paneSub.dispose();
    this.element.remove();
    this.element = null;
  }

  setState(newState) {
    _.extend(this.state, newState);

    this.renderedElement = render(
      h(ExtendedTreeView, this.state),
      this.element,
      this.renderedElement
    );
  }

  setPane(pane) {
    if (this.paneSub) {
      this.paneSub.dispose();
    }

    this.paneSub = new CompositeDisposable();
		this.pane = pane;

    this.paneSub.add(atom.workspace.onDidStopChangingActivePaneItem(activeItem => {
      this.setState({ activeItem });
    }))

    const updateItems = () => this.setState({ items: this.pane.getItems() });
    this.paneSub.add(pane.onDidAddItem(updateItems));
    this.paneSub.add(pane.onDidMoveItem(updateItems));
    this.paneSub.add(pane.onDidRemoveItem(updateItems));
    this.paneSub.add(pane.onDidDestroy(() => this.paneSub.dispose()));
	}
}
