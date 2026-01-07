// Placeholder data SDK for GitHub Pages deployment
// Implement or replace with real SDK when integrating with backend
window.dataSdk = {
  async delete(item) {
    console.warn('dataSdk.delete() called in placeholder. Item:', item);
    return Promise.resolve();
  },
  async save(item) {
    console.warn('dataSdk.save() called in placeholder. Item:', item);
    return Promise.resolve(item);
  },
  async fetchAll() {
    console.warn('dataSdk.fetchAll() called in placeholder.');
    return Promise.resolve([]);
  }
};
