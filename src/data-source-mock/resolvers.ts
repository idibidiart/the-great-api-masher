export default {
  Query: {
    greenApple: (_, __, context) => context.model.getData({type: "GreenApple"}),
    cherry: (_, __, context) => context.model.getData({type: "Cherry"}),
    fruit: (_, __, context) => context.model.getData({}),
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