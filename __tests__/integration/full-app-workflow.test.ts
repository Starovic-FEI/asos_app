describe('Full App Workflow Integration', () => {
  it('should have all API modules accessible', () => {
    const auth = require('../../lib/api/auth');
    const categories = require('../../lib/api/categories');
    const images = require('../../lib/api/images');
    const ratings = require('../../lib/api/ratings');
    const recipes = require('../../lib/api/recipies');
    const reports = require('../../lib/api/reports');
    const reviews = require('../../lib/api/reviews');
    const saved = require('../../lib/api/saved');
    const tags = require('../../lib/api/tags');
    
    expect(auth).toBeDefined();
    expect(categories).toBeDefined();
    expect(images).toBeDefined();
    expect(ratings).toBeDefined();
    expect(recipes).toBeDefined();
    expect(reports).toBeDefined();
    expect(reviews).toBeDefined();
    expect(saved).toBeDefined();
    expect(tags).toBeDefined();
  });

  it('should have all ViewModels accessible', () => {
    const useAuth = require('../../lib/viewmodels/useAuth');
    const useRatings = require('../../lib/viewmodels/useRatings');
    const useRecipes = require('../../lib/viewmodels/useRecipes');
    const useReviews = require('../../lib/viewmodels/useReviews');
    const useSaved = require('../../lib/viewmodels/useSaved');
    
    expect(useAuth).toBeDefined();
    expect(useRatings).toBeDefined();
    expect(useRecipes).toBeDefined();
    expect(useReviews).toBeDefined();
    expect(useSaved).toBeDefined();
  });

  it('should simulate recipe browsing workflow', async () => {
    const recipesApi = require('../../lib/api/recipies');
    const categoriesApi = require('../../lib/api/categories');
    const tagsApi = require('../../lib/api/tags');
    
    const { data: categories } = await categoriesApi.getCategories();
    const { data: tags } = await tagsApi.getTags();
    const { data: recipes } = await recipesApi.getRecipes();
    
    expect(categories).toBeDefined();
    expect(tags).toBeDefined();
    expect(recipes).toBeDefined();
    
    if (recipes && recipes.length > 0) {
      const { data: recipe } = await recipesApi.getRecipeById(recipes[0].id);
      expect(recipe).toBeDefined();
      expect(recipe.id).toBe(recipes[0].id);
    }
  });

  it('should verify recipe interaction workflow', async () => {
    const recipesApi = require('../../lib/api/recipies');
    const ratingsApi = require('../../lib/api/ratings');
    const reviewsApi = require('../../lib/api/reviews');
    const reportsApi = require('../../lib/api/reports');
    
    const { data: recipes } = await recipesApi.getRecipes();
    
    if (recipes && recipes.length > 0) {
      const recipeId = recipes[0].id;
      
      const { average, count } = await ratingsApi.getAverageRating(recipeId);
      const { data: reviews } = await reviewsApi.getRecipeReviews(recipeId);
      const { count: reportCount } = await reportsApi.getReportCount(recipeId);
      
      expect(typeof average).toBe('number');
      expect(typeof count).toBe('number');
      expect(Array.isArray(reviews)).toBe(true);
      expect(typeof reportCount).toBe('number');
    }
  });
});
