'use babel';

export function getRepositories() {
  return Promise.all(
    atom.project.getDirectories().map(
      atom.project.repositoryForDirectory.bind(atom.project)
    )
  );
}
