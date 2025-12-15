describe('Ratings Workflow', () => {
  it('should work with recipe ratings', async () => {
    const recipesApi = require('../../../lib/api/recipies');
    const ratingsApi = require('../../../lib/api/ratings');
    
    const { data: recipes } = await recipesApi.getRecipes();
    
    if (recipes && recipes.length > 0) {
      const recipeId = recipes[0].id;
      const { average, count, error } = await ratingsApi.getAverageRating(recipeId);
      
      expect(error).toBeNull();
      expect(typeof average).toBe('number');
      expect(typeof count).toBe('number');
      expect(average).toBeGreaterThanOrEqual(0);
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  it('should verify rating functions exist', () => {
    const ratingsApi = require('../../../lib/api/ratings');
    expect(ratingsApi.addRating).toBeDefined();
    expect(ratingsApi.getUserRating).toBeDefined();
    expect(ratingsApi.getAverageRating).toBeDefined();
    expect(typeof ratingsApi.addRating).toBe('function');
    expect(typeof ratingsApi.getUserRating).toBe('function');
    expect(typeof ratingsApi.getAverageRating).toBe('function');
  });
});
