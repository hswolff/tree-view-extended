'use babel';

import { CompositeDisposable } from 'atom';
import ExtendedBase from './extended-base';
import OpenFilesPaneView from './open-files-pane-view';

export default class OpenFilesView extends ExtendedBase {
  constructor(serializedState) { // eslint-disable-line no-unused-vars
    super(serializedState);

    this.paneViews = [];
    this.paneSubs = new CompositeDisposable();
    this.paneSubs.add(atom.workspace.observePanes(this.addPane.bind(this)));
  }

  // Tear down any state and detach
  destroy() {
    super.destroy();
		this.paneSubs.dispose();
  }

  addPane(pane) {
		const paneView = new OpenFilesPaneView(pane);
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
}
