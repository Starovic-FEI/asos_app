describe('Categories and Tags Integration', () => {
  it('should fetch categories and tags for recipe filtering', async () => {
    const categoriesApi = require('../../../lib/api/categories');
    const tagsApi = require('../../../lib/api/tags');
    
    const { data: categories, error: catError } = await categoriesApi.getCategories();
    const { data: tags, error: tagsError } = await tagsApi.getTags();
    
    expect(catError).toBeNull();
    expect(tagsError).toBeNull();
    expect(Array.isArray(categories)).toBe(true);
    expect(Array.isArray(tags)).toBe(true);
  });

  it('should verify category by id lookup works', async () => {
    const categoriesApi = require('../../../lib/api/categories');
    const { data: categories } = await categoriesApi.getCategories();
    
    if (categories && categories.length > 0) {
      const categoryId = categories[0].id;
      const { data: category, error } = await categoriesApi.getCategoryById(categoryId);
      
      expect(error).toBeNull();
      expect(category).toBeDefined();
      expect(category.id).toBe(categoryId);
    }
  });

  it('should verify tag by id lookup works', async () => {
    const tagsApi = require('../../../lib/api/tags');
    const { data: tags } = await tagsApi.getTags();
    
    if (tags && tags.length > 0) {
      const tagId = tags[0].id;
      const { data: tag, error } = await tagsApi.getTagById(tagId);
      
      expect(error).toBeNull();
      expect(tag).toBeDefined();
      expect(tag.id).toBe(tagId);
    }
  });
});
