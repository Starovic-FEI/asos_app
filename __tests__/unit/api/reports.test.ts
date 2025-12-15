describe('Reports API', () => {
  it('should export report functions', () => {
    const reportsApi = require('../../../lib/api/reports');
    expect(reportsApi.reportRecipe).toBeDefined();
    expect(reportsApi.hasUserReported).toBeDefined();
    expect(reportsApi.getReportCount).toBeDefined();
  });

  it('should get report count for recipe', async () => {
    const recipesApi = require('../../../lib/api/recipies');
    const reportsApi = require('../../../lib/api/reports');
    
    const { data: recipes } = await recipesApi.getRecipes();
    if (recipes && recipes.length > 0) {
      const recipeId = recipes[0].id;
      const { count, error } = await reportsApi.getReportCount(recipeId);
      
      expect(error).toBeNull();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
