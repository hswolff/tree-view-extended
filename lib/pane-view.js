'use babel';

import { CompositeDisposable } from 'atom';
import _ from 'lodash';
import yo from 'yo-yo';

function getRepositories() {
  return Promise.all(
    atom.project.getDirectories().map(
      atom.project.repositoryForDirectory.bind(atom.project)
    )
  );
}

export default class PaneView {
  constructor(pane) {
    this.render = this.render.bind(this);

    if (pane) {
      this.setPane(pane);
    }

    this.state = {
      activeItem: this.pane.getActiveItem(),
      headerOnClick: () => this.setState({ expanded: !this.state.expanded }),
      pane: this.pane,
      paneTitle: 'Open Files',
      expanded: true,
      items: this.pane.getItems(),
      repos: [],
    };

    this.render();

    getRepositories().then(repos => {
      this.setState({ repos });
    });
  }

  destroy() {
    this.element.remove();
    this.paneSub.dispose();
    this.state = null;
  }

  setPane(pane) {
    if (this.paneSub) {
      this.paneSub.dispose();
    }

    this.paneSub = new CompositeDisposable();
		this.pane = pane;

    this.paneSub.add(atom.workspace.onDidChangeActivePaneItem(activeItem => {
      this.setState({ activeItem });
    }))

		this.paneSub.add(pane.observeItems(item => {
      if (item.onDidChangeTitle != null) {
        this.paneSub.add(item.onDidChangeTitle(this.render));
      }
      if (item.onDidChangeModified != null) {
        this.paneSub.add(item.onDidChangeModified(this.render));
      }
    }));

    const updateItems = () => this.setState({ items: this.pane.getItems() });
    this.paneSub.add(pane.onDidAddItem(updateItems));
    this.paneSub.add(pane.onDidMoveItem(updateItems));
    this.paneSub.add(pane.onDidRemoveItem(updateItems));
    this.paneSub.add(pane.onDidDestroy(() => this.paneSub.dispose()));
	}

  setState(state = {}) {
    _.extend(this.state, state);
    this.render();
  }

  render() {
    const {
      activeItem,
      pane,
      paneTitle,
      headerOnClick,
      expanded,
      items,
      repos,
    } = this.state;

    const element = yo`
      <ul class="tree-view list-tree has-collapsable-children">
        <li class="list-nested-item ${expanded ? 'expanded' : 'collapsed'}">
          <div class="header list-item" onclick=${headerOnClick}>
            <span class="name icon icon-file-directory" data-name="Pane">${paneTitle}</span>
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

              for (const repo of repos) {
                if (repo.isPathModified(path)) {
                  classes += ' status-modified';
                }
                if (repo.isPathNew(path)) {
                  classes += ' status-added';
                }
                if (repo.isPathIgnored(path)) {
                  classes += ' status-ignored';
                }
              }

              return yo`
                <li class="file list-item ${classes}" is="tree-view-file" onclick=${() => pane.activateItem(item)}>
                  <button class="close-open-file" onclick=${(e) => { e.stopPropagation(); pane.destroyItem(item) }}></button>
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

    if (!this.element) {
      this.element = element;
    }

    yo.update(this.element, element);

    return this.element;
  }
}
