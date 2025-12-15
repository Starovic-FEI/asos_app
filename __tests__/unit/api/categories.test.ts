describe('Categories API', () => {
  it('should fetch all categories', async () => {
    const categoriesApi = require('../../../lib/api/categories');
    const { data, error } = await categoriesApi.getCategories();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('id');
    }
  });

  it('should fetch category by id', async () => {
    const categoriesApi = require('../../../lib/api/categories');
    const { data: categories } = await categoriesApi.getCategories();
    
    if (categories && categories.length > 0) {
      const firstCategoryId = categories[0].id;
      const { data, error } = await categoriesApi.getCategoryById(firstCategoryId);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(firstCategoryId);
    }
  });
});
