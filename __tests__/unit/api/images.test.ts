describe('Images API', () => {
  it('should export image upload functions', () => {
    const imagesApi = require('../../../lib/api/images');
    expect(imagesApi.uploadRecipeImage).toBeDefined();
    expect(imagesApi.uploadMultipleRecipeImages).toBeDefined();
    expect(imagesApi.deleteRecipeImage).toBeDefined();
    expect(imagesApi.setPrimaryImage).toBeDefined();
  });
});
