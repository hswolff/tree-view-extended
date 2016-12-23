'use babel';

import { CompositeDisposable } from 'atom';
import _ from 'lodash';
import yo from 'yo-yo';

export default class PaneView {
  constructor(pane) {
    this.update = this.update.bind(this);

    this.paneSub = new CompositeDisposable();

    this.paneSub.add(atom.workspace.onDidChangeActivePaneItem(this.update))

    this.state = {
      expanded: true,
    };

    this.element = this.render();

    if (pane) {
      this.setPane(pane);
    }
  }

  update() {
    yo.update(this.element, this.render());
  }

  setState(state = {}) {
    _.merge(this.state, state);
    this.update();
  }

  render() {
    const {
      expanded,
    } = this.state;

    const activeItem = this.pane ? this.pane.getActiveItem() : {};
    const items = this.pane ? this.pane.getItems() : [];

    return yo`
      <ul class="tree-view list-tree has-collapsable-children">
        <li class="list-nested-item ${expanded ? 'expanded' : 'collapsed'}">
          <div class="header list-item" onclick=${() => this.setState({ expanded: !expanded })}>
            <span class="name icon icon-file-directory" data-name="Pane">Pane</span>
          </div>
          <ol class="entries list-tree">
            ${items.map(item => {
              const path = item.getPath ? item.getPath() : '';
              const title = item.getTitle ? item.getTitle() : '';
              const iconKlass = item.getIconName ? item.getIconName() : 'file-text';
              let classes = item === activeItem ? 'selected' : '';
              if (item.isModified != null) {
                classes += item.isModified() ? ' modified' : '';
              }

              return yo`
                <li class="file list-item ${classes}" is="tree-view-file" onclick=${() => this.pane.activateItem(item)}>
                  <button class="close-open-file" onclick=${(e) => { e.stopPropagation(); this.pane.destroyItem(item) }}></button>
                  <span class="name icon icon-${iconKlass}" data-path="${path}" data-name="${title}">
                    ${title}
                  </span>
                </li>
              `;
            })}
          </ol>
        </li>
      </ul>
    `;
  }

  setPane(pane) {
		this.pane = pane;

    const safeUpdate = () => process.nextTick(this.update);

		this.paneSub.add(pane.observeItems(item => {
      if (item.onDidChangeTitle != null) {
        this.paneSub.add(item.onDidChangeTitle(safeUpdate));
      }
      if (item.onDidChangeModified != null) {
        this.paneSub.add(item.onDidChangeModified(safeUpdate));
      }
    }));

    this.paneSub.add(pane.onDidMoveItem(safeUpdate));
    this.paneSub.add(pane.onDidRemoveItem(safeUpdate));
    this.paneSub.add(pane.onDidDestroy(() => this.paneSub.dispose()));

    safeUpdate();
	}

  destroy() {
    this.element.remove();
    this.paneSub.dispose();
  }
}
