describe('Saved Recipes Workflow', () => {
  it('should verify saved recipes exports', () => {
    const savedApi = require('../../../lib/api/saved');
    expect(savedApi.saveRecipe).toBeDefined();
    expect(savedApi.removeSavedRecipe).toBeDefined();
    expect(savedApi.getSavedRecipes).toBeDefined();
    expect(savedApi.getFavoriteRecipes).toBeDefined();
    expect(savedApi.toggleFavorite).toBeDefined();
  });
});
