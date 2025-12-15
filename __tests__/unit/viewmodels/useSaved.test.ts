describe('useSaved ViewModel', () => {
  it('should export useSaved hook', () => {
    const savedViewModel = require('../../../lib/viewmodels/useSaved');
    expect(savedViewModel.useSaved).toBeDefined();
    expect(typeof savedViewModel.useSaved).toBe('function');
  });
});
