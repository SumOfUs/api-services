// @flow weak

export default (langResource: string) => {
  const langId = langResource.split('/').filter(Number)[0];

  switch (langId) {
    case '103':
      return 'unsubscribe_french';
    case '101':
      return 'unsubscribe_german';
    default:
      return 'unsubscribe';
  }
};
