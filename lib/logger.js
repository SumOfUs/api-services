const wrapper = (handler, name) => {
  return function(event, context, callback, ...args) {
    console.log(`++++++ ${name}: EVENT ++++++`);
    console.log(JSON.stringify(event, null, 2));

    console.log(`++++++ ${name}: CONTEXT ++++++`);
    console.log(JSON.stringify(context, null, 2));

    return handler(event, context, callback, ...args);
  };
};

export default wrapper;
