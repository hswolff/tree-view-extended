'use babel';

import { CompositeDisposable } from 'atom';
import OpenFiles from './open-files';
import GitModifiedFiles from './git-modified-files';

export default {
  config: {
  },

  activate(state) {
    this.openFiles = new OpenFiles();
    this.gitModifiedFiles = new GitModifiedFiles();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Explicitly check if the values are not false so that we default to showing each view.

    if (state.openFilesViewIsShowing !== false) {
      this.openFiles.show();
    }
    if (state.gitModifiedFilesViewIsShowing !== false) {
      this.gitModifiedFiles.show();
    }

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tree-view-extended:toggle-all': () => {
        this.openFiles.toggle();
        this.gitModifiedFiles.toggle();
      },
      'tree-view-extended:show-all': () => {
        this.openFiles.show();
        this.gitModifiedFiles.show();
      },
      'tree-view-extended:hide-all': () => {
        this.openFiles.destroy();
        this.gitModifiedFiles.destroy();
      },

      'tree-view-extended:toggle-open-files': () => this.openFiles.toggle(),
      'tree-view-extended:show-open-files': () => this.openFiles.show(),
      'tree-view-extended:hide-open-files': () => this.openFiles.destroy(),

      'tree-view-extended:toggle-git-modified-files': () => this.gitModifiedFiles.toggle(),
      'tree-view-extended:show-git-modified-files': () => this.gitModifiedFiles.show(),
      'tree-view-extended:hide-git-modified-files': () => this.gitModifiedFiles.destroy(),
    }));

    this.subscriptions.add(
      atom.workspace.onWillDestroyPaneItem(({ item }) => {
        if (item instanceof OpenFiles) {
          this.openFiles.destroy();
        }
        if (item instanceof GitModifiedFiles) {
          this.gitModifiedFiles.destroy();
        }
      })
    )
  },

  deactivate() {
    this.subscriptions.dispose();
    if (this.openFiles) {
      this.openFiles.destroy();
    }

    if (this.gitModifiedFiles) {
      this.gitModifiedFiles.destroy();
    }
  },

  serialize() {
    return {
      openFilesViewIsShowing: this.openFiles.isShowing(),
      gitModifiedFilesViewIsShowing: this.gitModifiedFiles.isShowing(),
    };
  },
};
