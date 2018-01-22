import Model from './model'
import Connector from './connector';

const model = new Model({ connector: new Connector() })

export default {
  Query: {
    greenApple: (parent, args, context) => model.getData({type: "GreenApple"}),
    cherry: (parent, args, context) => model.getData({type: "Cherry"}),
    fruit: (parent, args, context) => model.getData({}),
  }, 
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