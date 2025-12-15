describe('Recipe Reports Workflow', () => {
  it('should check report counts across multiple recipes', async () => {
    const recipesApi = require('../../../lib/api/recipies');
    const reportsApi = require('../../../lib/api/reports');
    
    const { data: recipes } = await recipesApi.getRecipes();
    
    if (recipes && recipes.length > 0) {
      for (let i = 0; i < Math.min(3, recipes.length); i++) {
        const { count, error } = await reportsApi.getReportCount(recipes[i].id);
        expect(error).toBeNull();
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('should verify all report functions exist', () => {
    const reportsApi = require('../../../lib/api/reports');
    expect(reportsApi.reportRecipe).toBeDefined();
    expect(reportsApi.hasUserReported).toBeDefined();
    expect(reportsApi.getReportCount).toBeDefined();
    expect(typeof reportsApi.reportRecipe).toBe('function');
    expect(typeof reportsApi.hasUserReported).toBe('function');
    expect(typeof reportsApi.getReportCount).toBe('function');
  });
});
