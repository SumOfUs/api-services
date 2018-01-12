import unsubscribePageFinder from './unsubscribePageFinder';

describe('finding page', () => {
  test('Returns french for 103', () => {
    expect(unsubscribePageFinder('/rest/v1/language/103')).toEqual(
      'unsubscribe_french'
    );
  });

  test('Returns german for 101', () => {
    expect(unsubscribePageFinder('/rest/v1/language/101')).toEqual(
      'unsubscribe_german'
    );
  });

  test('Returns default', () => {
    expect(unsubscribePageFinder('/rest/v1/language/999')).toEqual(
      'unsubscribe'
    );
    expect(unsubscribePageFinder('')).toEqual('unsubscribe');
  });
});
