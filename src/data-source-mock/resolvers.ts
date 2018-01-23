import Model from './model'
import Connector from './connector';

const model = new Model({ connector: new Connector() })

export default {
  Query: {
    greenApple: (parent, args, context) => model.getData({type: "GreenApple"}),
    cherry: (parent, args, context) => model.getData({type: "Cherry"}),
    fruit: (parent, args, context) => model.getData({}), // returns Union of both types
  }, 
  // GraphQL must be able to distinguish GreenApple from Cherry in MixedFruit
  // which is a Union of types (i.e. the actual type is not fixed at design time) 
  // We do this with __resolveType
  MixedFruit: {
    __resolveType(obj) {
        if (obj.cherry)  {
            return "Cherry"
        } else {
            return "GreenApple"
        }
    }
  }
};