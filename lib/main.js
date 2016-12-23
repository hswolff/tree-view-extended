'use babel';

import { CompositeDisposable } from 'atom';
import MainView from './main-view';

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

  treeViewOpenFilesPlusView: null,
  isVisible: true,
  subscriptions: null,

  activate(state) {
    this.mainView = new MainView(state.treeViewOpenFilesPlusViewState);

    this.isVisible = state.isVisible;

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tree-view-open-files-plus:toggle': () => this.mainView.toggle(),
      'tree-view-open-files-plus:show': () => this.mainView.show(),
      'tree-view-open-files-plus:hide': () => this.mainView.hide(),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.mainView.destroy();
  },

  serialize() {
    return {
      treeViewOpenFilesPlusViewState: this.mainView.serialize()
    };
  },
};