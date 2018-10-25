const AKMockData = {
  actions: [{ page_id: 213, member_id: 123 }, { page_id: 234, member_id: 435 }],
};

export function AKSubjectAccessData(email) {
  return Promise.resolve(AKMockData);
}
