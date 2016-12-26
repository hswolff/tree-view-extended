'use babel';

import { CompositeDisposable } from 'atom';
import OpenFilesView from './open-files-view';
import GitModifiedFilesView from './git-modified-files-view';

export default {
  config: {
    maxHeight: {
      type: 'integer',
      default: 250,
      min: 0,
      description: 'Maximum height of the list before scrolling is required. Set to 0 to disable scrolling.'
    },
    stickyOpenFiles: {
      type: 'boolean',
      default: false,
      description: 'Should the Open Files pane stick to the top of the tree view (by default it scrolls with the Tree View).',
    },
    stickyGitModifiedFiles: {
      type: 'boolean',
      default: false,
      description: 'Should the Git Modified Files pane stick to the top of the tree view (by default it scrolls with the Tree View),',
    },
  },

  activate(state) {
    this.openFilesView = new OpenFilesView();
    this.gitModifiedFilesView = new GitModifiedFilesView();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    if (state.openFilesViewIsShowing) {
      this.openFilesView.show();
    }
    if (state.gitModifiedFilesViewIsShowing) {
      this.gitModifiedFilesView.show();
    }

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tree-view-extended:toggle-all': () => {
        this.openFilesView.toggle();
        this.gitModifiedFilesView.toggle();
      },
      'tree-view-extended:show-all': () => {
        this.openFilesView.show();
        this.gitModifiedFilesView.show();
      },
      'tree-view-extended:hide-all': () => {
        this.openFilesView.hide();
        this.gitModifiedFilesView.hide();
      },

      'tree-view-extended:toggle-open-files': () => this.openFilesView.toggle(),
      'tree-view-extended:show-open-files': () => this.openFilesView.show(),
      'tree-view-extended:hide-open-files': () => this.openFilesView.hide(),
      'tree-view-extended:toggle-sticky-open-files': () => {
        atom.config.set(
          'tree-view-extended.stickyOpenFiles',
          !atom.config.get('tree-view-extended.stickyOpenFiles')
        );
      },

      'tree-view-extended:toggle-git-modified-files': () => this.gitModifiedFilesView.toggle(),
      'tree-view-extended:show-git-modified-files': () => this.gitModifiedFilesView.show(),
      'tree-view-extended:hide-git-modified-files': () => this.gitModifiedFilesView.hide(),
      'tree-view-extended:toggle-sticky-git-modified-files': () => {
        atom.config.set(
          'tree-view-extended.stickyGitModifiedFiles',
          !atom.config.get('tree-view-extended.stickyGitModifiedFiles')
        )
      },
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.openFilesView.destroy();
    this.gitModifiedFilesView.destroy();
  },

  serialize() {
    return {
      openFilesViewIsShowing: this.openFilesView.isShowing(),
      gitModifiedFilesViewIsShowing: this.gitModifiedFilesView.isShowing(),
    };
  },
};
