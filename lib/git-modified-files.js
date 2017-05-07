'use babel';

import { CompositeDisposable } from 'atom';
import path from 'path';
import _ from 'lodash';
import ExtendedBase from './extended-base';
import ExtendedTreeView from './extended-tree-view';
import { getRepositories } from './helpers';

export default class GitModifiedFiles extends ExtendedBase {
  constructor() {
    super();

    this.dockTitle = 'Git Modified Files';
  }

  show() {
    this.subs = new CompositeDisposable();
    this.subs.add(atom.project.onDidChangePaths(this.loadRepos.bind(this)));

    this.loadRepos();

    super.show();
  }

  loadRepos() {
    if (this.views && this.views.length > 0) {
      _.invokeMap(this.views, 'destroy');
      this.viewSubs.dispose();
    }

    this.views = [];
    this.viewSubs = new CompositeDisposable();

    getRepositories().then(repos => {
      for (const repo of repos) {
        const view = new ExtendedTreeView({
          activeItem: atom.workspace.getCenter().getActivePaneItem(),
          title: 'Git Modified',
          disableClosingItem: true,
        });

        const updateView = () => {
          const wd = repo.getWorkingDirectory();
          const allPaneItems = atom.workspace.getCenter().getPaneItems();

          const items = _.reduce(repo.statuses, (acc, val, filePath) => {
            const fullPath = path.join(wd, filePath);

            // Check inner repo object to see if this file is deleted so we don't
            // show it in the view.
            if (repo && repo.repo && repo.repo.isPathDeleted(filePath)) {
              return acc;
            }

            const item = allPaneItems.find(item => {
              if (item.getPath) {
                return fullPath === item.getPath();
              }
              return false;
            });

            // If there is a paneItem then use that.
            if (item) {
              return acc.concat(item);
            }

            // Create a stub for the paneItem.
            return acc.concat({
              uri: fullPath,
              getTitle: () => path.basename(filePath),
            });
          }, []);

          view.setState({ items });
        };

        this.viewSubs.add(repo.onDidChangeStatus(updateView));
        this.viewSubs.add(repo.onDidChangeStatuses(updateView));
        this.viewSubs.add(atom.workspace.getCenter().observeActivePaneItem((activeItem) => {
          updateView();
          view.setState({ activeItem });
        }));
        this.views.push(view);

        updateView();
        this.element.appendChild(view.element);
      }
    });
  }

  destroy() {
    super.destroy();
		this.subs.dispose();
    _.invokeMap(this.views, 'destroy');
    this.viewSubs.dispose();
  }
}
