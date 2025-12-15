describe('useReviews ViewModel', () => {
  it('should export useReviews hook', () => {
    const reviewsViewModel = require('../../../lib/viewmodels/useReviews');
    expect(reviewsViewModel.useReviews).toBeDefined();
    expect(typeof reviewsViewModel.useReviews).toBe('function');
  });
});
