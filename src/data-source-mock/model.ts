import { GraphQLModel } from 'graphql-rest-helpers';

export default class MockModel extends GraphQLModel {
  constructor({connector}) {
    super({connector});
  }
  // see model.ts in XKCD or Numbers sources 
  // for how to write async fetch functions and error handling
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
  
}