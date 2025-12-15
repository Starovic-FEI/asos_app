describe('Tags API', () => {
  it('should fetch all tags', async () => {
    const tagsApi = require('../../../lib/api/tags');
    const { data, error } = await tagsApi.getTags();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should fetch tag by id', async () => {
    const tagsApi = require('../../../lib/api/tags');
    const { data: tags } = await tagsApi.getTags();
    
    if (tags && tags.length > 0) {
      const firstTagId = tags[0].id;
      const { data, error } = await tagsApi.getTagById(firstTagId);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(firstTagId);
    }
  });

  it('should export tag management functions', () => {
    const tagsApi = require('../../../lib/api/tags');
    expect(tagsApi.addRecipeTags).toBeDefined();
    expect(tagsApi.removeRecipeTags).toBeDefined();
  });
});
