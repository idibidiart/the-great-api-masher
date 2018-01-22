import { GrampsError } from '@gramps/errors';
import { GraphQLModel } from '@gramps/rest-helpers';

export default class MockModel extends GraphQLModel {
  constructor({connector}) {
    super({connector});
  }
  // see model.ts in XKCD or Numbers sources 
  // for how to write async fetch functions
  getData(args) {
    let fruitBasket = new Array(Math.round(Math.random() * 10))
    switch (args.type) {
      case "Cherry": 
        fruitBasket.fill({cherry: "🍒"})
      break;
      case "GreenApple": 
        fruitBasket.fill({apple: "🍏"})
      break;
      default:
        const set = [{cherry: "🍒 "},{apple: "🍏"}]
        fruitBasket = fruitBasket.fill(null).map((el) => set[Math.floor(set.length * Math.random())])    
    }
    return Promise.resolve(fruitBasket)
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
      message = 'Mock API: Something went wrong.',
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