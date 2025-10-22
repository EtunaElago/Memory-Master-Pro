import AdManager from '../../src/services/ads';

describe('AdManager', () => {
  let adManager;

  beforeEach(() => {
    adManager = new AdManager();
  });

  test('should initialize correctly', async () => {
    const result = await adManager.initialize();
    expect(result).toBe(true);
  });

  test('should manage ad frequency', () => {
    expect(adManager.shouldShowAd(3)).toBe(true);
    expect(adManager.shouldShowAd(4)).toBe(false);
    expect(adManager.shouldShowAd(6)).toBe(true);
  });

  test('should handle ad show failures gracefully', async () => {
    const result = await adManager.showInterstitial();
    expect(typeof result).toBe('boolean');
  });
});