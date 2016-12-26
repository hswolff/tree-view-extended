'use babel';

import { CompositeDisposable } from 'atom';
import OpenFilesView from './open-files-view';

export default {
  config: {
    maxHeight: {
      type: 'integer',
      default: 250,
      min: 0,
      description: 'Maximum height of the list before scrolling is required. Set to 0 to disable scrolling.'
    },
    sticky: {
      type: 'boolean',
      default: true,
      description: 'Should the pane stick to the top of the tree view or scroll with it.'
    }
  },

  isVisible: true,
  subscriptions: null,

  activate(state) {
    this.openFilesView = new OpenFilesView(state.treeViewExtendedState);

    this.isVisible = state.isVisible;

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tree-view-extended:toggle': () => this.openFilesView.toggle(),
      'tree-view-extended:show': () => this.openFilesView.show(),
      'tree-view-extended:hide': () => this.openFilesView.hide(),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.openFilesView.destroy();
  },

  serialize() {
    return {
      treeViewExtendedState: this.openFilesView.serialize()
    };
  },
};
