describe('Reviews Workflow', () => {
  it('should fetch and display reviews for recipe', async () => {
    const recipesApi = require('../../../lib/api/recipies');
    const reviewsApi = require('../../../lib/api/reviews');
    
    const { data: recipes } = await recipesApi.getRecipes();
    
    if (recipes && recipes.length > 0) {
      const recipeId = recipes[0].id;
      const { data: reviews, error } = await reviewsApi.getRecipeReviews(recipeId);
      
      expect(error).toBeNull();
      expect(Array.isArray(reviews)).toBe(true);
    }
  });

  it('should verify review management functions', () => {
    const reviewsApi = require('../../../lib/api/reviews');
    expect(reviewsApi.getRecipeReviews).toBeDefined();
    expect(reviewsApi.addReview).toBeDefined();
    expect(reviewsApi.deleteReview).toBeDefined();
  });
});
