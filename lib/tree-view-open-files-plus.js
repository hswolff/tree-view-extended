'use babel';

import TreeViewOpenFilesPlusView from './tree-view-open-files-plus-view';
import { CompositeDisposable } from 'atom';

export default {

  treeViewOpenFilesPlusView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.treeViewOpenFilesPlusView = new TreeViewOpenFilesPlusView(state.treeViewOpenFilesPlusViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.treeViewOpenFilesPlusView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tree-view-open-files-plus:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.treeViewOpenFilesPlusView.destroy();
  },

  serialize() {
    return {
      treeViewOpenFilesPlusViewState: this.treeViewOpenFilesPlusView.serialize()
    };
  },

  toggle() {
    console.log('TreeViewOpenFilesPlus was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
