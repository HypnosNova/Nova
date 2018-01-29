let NotFunctionError = class extends Error {
  constructor( message ) {
    super( message );
    this.name = 'NotFunctionError';
    this.message = message || 'The object is not a function.';
  }
};

export {
  NotFunctionError
};