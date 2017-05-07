'use babel';

import { CompositeDisposable } from 'atom';
import ExtendedBase from './extended-base';
import OpenFilesPaneView from './open-files-pane-view';

export default class OpenFilesView extends ExtendedBase {
  constructor() {
    super();

    this.dockTitle = 'Open Files';

    this.paneViews = [];
    this.paneSubs = new CompositeDisposable();
    this.paneSubs.add(
      atom.workspace.getCenter().observePanes(this.addPane.bind(this))
    );
  }

  // Tear down any state and detach
  destroy() {
    super.destroy();
		this.paneSubs.dispose();
  }

  addPane(pane) {
    this.syncPanes();

		const paneView = new OpenFilesPaneView(pane);
		this.paneViews.push(paneView);
		this.element.appendChild(paneView.element);

    const destroySub = pane.onDidDestroy(() => {
      destroySub.dispose();
      this.removePane(pane);
    });

    this.paneSubs.add(destroySub);
	}

  // When a user is switching project folders (usually with project manager)
  // panes are added and removed.
  // This file syncs the views against what panes are currently displayed.
  syncPanes() {
    const currentPanes = atom.workspace.getCenter().getPanes();
    // Use slice to create a copy of paneViews as we mutate that array.
    this.paneViews.slice().forEach(view => {
      const currentPaneIndex = currentPanes.indexOf(view.pane);
      const currentPane = currentPanes[currentPaneIndex];
      if (currentPaneIndex === -1 ||
          currentPane.activeItem !== view.pane.activeItem) {
        this.removePane(view.pane);
      }
    });
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
