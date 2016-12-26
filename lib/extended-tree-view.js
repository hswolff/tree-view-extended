'use babel';

import _ from 'lodash';
import yo from 'yo-yo';
import { CompositeDisposable } from 'atom';
import { getRepositories } from './helpers';

export default class ExtendedTreeView {
  constructor(initialState = {}) {
    this.setState = this.setState.bind(this);
    this.render = this.render.bind(this);

    this.state = _.extend({
      activeItem: {},
      disableClosingItem: false,
      headerOnClick: () => this.setState({ expanded: !this.state.expanded }),
      title: 'Pane',
      expanded: true,
      items: [],
      repos: [],
    }, initialState);

    this.render();

    this.gitSubs = new CompositeDisposable();
    getRepositories().then(repos => {
      for (const repo of repos) {
        this.gitSubs.add(repo.onDidChangeStatus(this.render));
      }
      this.setState({ repos });
    });
  }

  destroy() {
    this.gitSubs.dispose();
    this.element.remove();
    this.state = null;
  }

  setState(state = {}, cb = _.noop) {
    _.extend(this.state, state);
    this.render();

    if (this.itemSubs) {
      this.itemSubs.dispose();
    }
    this.itemSubs = new CompositeDisposable();
    for (const item of this.state.items) {
      if (item.onDidChangeTitle != null) {
        this.itemSubs.add(item.onDidChangeTitle(this.render));
      }
      if (item.onDidChangeModified != null) {
        this.itemSubs.add(item.onDidChangeModified(this.render));
      }
    }

    cb();
  }

  render() {
    const {
      activeItem,
      disableClosingItem,
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
              let path = '';
              if (item.getPath) {
                path = item.getPath();
              } else if (item.uri) {
                path = item.uri;
              }
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

              const openItem = () => {
                const pane = atom.workspace.paneForItem(item);
                if (pane) {
                  pane.activateItem(item);
                  return;
                }
                atom.workspace.open(path)
              };
              const closeItem = disableClosingItem ? _.noop : (e) => {
                e.stopPropagation();
                atom.workspace.paneForItem(item).destroyItem(item)
              };

              return yo`
                <li class="file list-item ${containerClasses}" is="tree-view-file" onclick=${openItem}>
                  <button class="close-open-file ${disableClosingItem ? 'hidden' : ''}" onclick=${closeItem}></button>
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
