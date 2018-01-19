import { GrampsError } from '@gramps/errors';
import { GraphQLModel } from '@gramps/rest-helpers';

export default class NumbersModel extends GraphQLModel {
  constructor({connector}) {
    super({connector});
  }
 
  async getNumbers(input, type) {
    return this.connector.get(`/${input}/${type}`)
      .then((res) => {
        console.log("Numbers API output for getNumbers with input", input, "type", type, res)
        return res
      })
      .catch(res =>
        this.throwError(res.error, {
          description: 'Numbers API: Could not get the info',
        }),
    );
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
      message = 'Numbers API: Something went wrong.',
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