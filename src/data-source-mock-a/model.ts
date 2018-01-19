import { GrampsError } from '@gramps/errors';
import { GraphQLModel } from '@gramps/rest-helpers';

export default class MockModelA extends GraphQLModel {
  constructor({connector}) {
    super({connector});
  }
  // see model.ts in XKCD or Numbers sources 
  // for how to write async fetch functions
  getData() {
    return Promise.resolve("this is test data from data source Mock A")
  }  

  /**
   * Throws a custom GrAMPS error.
   * @param  {Object}  error            the API error
   * @param  {Object?} customErrorData  additional error data to display
   * @return {void}
   */
  throwError(
    {
      statusCode = 500,
      message = 'Mock A API: Something went wrong.',
      targetEndpoint = null,
    },
    customErrorData = {},
  ) {
    const defaults = {
      statusCode,
      targetEndpoint,
      errorCode: `${this.constructor.name}_Error`,
      description: message,
      graphqlModel: this.constructor.name
    };

    throw GrampsError(Object.assign({defaults}, {customErrorData}));
  }
}