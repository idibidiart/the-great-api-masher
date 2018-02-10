import Model from './model'
import Connector from './connector';

const model = new Model({ connector: new Connector() })

export default {
  Query: {
    greenApple: (parent, args, context) => model.getFruit({type: "GreenApple"}),
    cherry: (parent, args, context) => model.getFruit({type: "Cherry"}),
    fruit: (parent, args, context) => model.getFruit({}), // returns Union of both fruit types
    someQuery: (parent, args, context) => {
      return {}
    }
  }, 
  SomeType: {
    abc: (parent, args, context) => Promise.resolve(`some autocompletion of ${args.someInput}`),
    timeStamp: (parent, args, context) => Promise.resolve(context.timeStamp),
    xyz: (parent, args, context) => model.getSomeOtherData(parent, args, context)
  },
  SomeOtherType: {
    anotherTest: (parent, args, context) => model.getYetAnotherData(parent, args, context)
  },
  // GraphQL must be able to distinguish GreenApple from Cherry in MixedFruit
  // which is a Union of different types (i.e. the actual type is fixed at design
  // time) 
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
}