export function SARconstructor() {
  return function(data, processor, email) {
    return Promise.resolve(
      `Subject Access Data for ${processor} successfully sent for ${email}`
    );
  };
}
