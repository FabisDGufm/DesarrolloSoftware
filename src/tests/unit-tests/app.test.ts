describe('app unit tests', () => {
  it('sanity check', () => {
    expect(1 + 1).toBe(2);
  });

  it('string comparison works', () => {
    const appName = 'DesarrolloSoftware';
    expect(appName).toContain('Software');
  });
});
