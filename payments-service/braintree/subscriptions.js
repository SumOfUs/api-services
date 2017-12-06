// import { ok, badRequest } from '../../shared/lambda-utils/responses';
// import braintree from '../../shared/clients/braintree';
//
//
// const search = () => {
//   return new Promise((resolve, reject) => {
//     braintree.customer.search(function (search) {
//       search.email().is("omar+1555@sumofus.org");
//     }, function (err, response) {
//       if(err !== ''){
//         reject(err);
//       };
//
//       const data = response.each(function (err, customer) {
//         console.log(customer.firstName);
//       });
//       resolve(data);
//     });
//   })
// }
//
// export const handler = (event, context, callback) => {
//   search.
//     .then((data) => {
//       callback(null, ok({body: JSON.stringify(data)}));
//     })
//     .catch(err => {
//       console.log(`${provider} SUBSCRIPTION CANCEL ERROR:`, err);
//       callback(null, badRequest());
//     });
// };
