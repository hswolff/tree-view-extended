'use babel';

import _ from 'lodash';
import yo from 'yo-yo';

function getRepositories() {
  return Promise.all(
    atom.project.getDirectories().map(
      atom.project.repositoryForDirectory.bind(atom.project)
    )
  );
}

export default class ExtendedTreeView {
  constructor(initialState = {}) {
    this.setState = this.setState.bind(this);
    this.render = this.render.bind(this);

    this.state = _.extend({
      activeItem: {},
      headerOnClick: () => this.setState({ expanded: !this.state.expanded }),
      title: 'Pane',
      expanded: true,
      items: [],
      repos: [],
    }, initialState);

    this.render();

    getRepositories().then(repos => {
      this.setState({ repos });
    });
  }

  destroy() {
    this.element.remove();
    this.state = null;
  }

  setState(state = {}, cb = _.noop) {
    _.extend(this.state, state);
    this.render();
    cb();
  }

  render() {
    const {
      activeItem,
      title,
      headerOnClick,
      expanded,
      items,
      repos,
    } = this.state;

    const element = yo`
      <ul class="tree-view list-tree has-collapsable-children">
        <li class="list-nested-item ${expanded ? 'expanded' : 'collapsed'}">
          <div class="header list-item" onclick=${headerOnClick}>
            <span class="name icon icon-file-directory">${title}</span>
          </div>
          <ol class="entries list-tree">
            ${items.map(item => {
              const path = item.getPath ? item.getPath() : '';
              const title = item.getTitle ? item.getTitle() : '';
              const iconKlass = item.getIconName ? item.getIconName() : 'file-text';

              let containerClasses = item === activeItem ? 'selected' : '';
              if (item.isModified != null) {
                containerClasses += item.isModified() ? ' modified' : '';
              }

              for (const repo of repos) {
                if (repo.isPathModified(path)) {
                  containerClasses += ' status-modified';
                }
                if (repo.isPathNew(path)) {
                  containerClasses += ' status-added';
                }
                if (repo.isPathIgnored(path)) {
                  containerClasses += ' status-ignored';
                }
              }

              const openItem = () => atom.workspace.paneForItem(item).activateItem(item);
              const closeItem = (e) => {
                e.stopPropagation();
                atom.workspace.paneForItem(item).destroyItem(item)
              };

              return yo`
                <li class="file list-item ${containerClasses}" is="tree-view-file" onclick=${openItem}>
                  <button class="close-open-file" onclick=${closeItem}></button>
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
