import SNS from 'aws-sdk/clients/sns';

const sns = new SNS();

const alertError = (e, name) => {
  console.log(`++++++ ${name}: ERROR ++++++`);

  const params = {
    Message: JSON.stringify({
      error: e,
      source: name,
    }),
    MessageStructure: 'json',
    TargetArn: '#TOPIC ARN GOES HERE',
  };

  sns.publish(params, (err, data) => {
    if (err)
      console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
  });
};

const log = (fn, name) => {
  return function() {
    const event = arguments[0];
    const context = arguments[1];

    console.log(`++++++ ${name}: EVENT ++++++`);
    console.log(JSON.stringify(event, null, 2));

    console.log(`++++++ ${name}: CONTEXT ++++++`);
    console.log(JSON.stringify(context, null, 2));

    try {
      const resp = fn.apply(this, arguments);
      console.log(`++++++ ${name}: RESPONSE ++++++`);
      console.log(resp);
      return resp;
    } catch (e) {
      alertError(e, name);
    }
  };
};

export default log;
