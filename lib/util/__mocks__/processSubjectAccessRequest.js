export function processSubjectAccessRequest(data, processor, email) {
  console.log('mock process subject access request', data);
  return Promise.resolve(
    `Subject Access Data for ${processor} successfully sent for ${email}`
  );
}
