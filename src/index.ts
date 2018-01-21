import { GraphQLServer } from 'graphql-yoga'
import { prepare } from '@gramps/gramps'
import XKCD from './data-source-xkcd'
import Numbers from './data-source-numbers'
import Mock from './data-source-mock'
import { Binding } from './generated/gramps'
import { Context } from './utils'

const fillRandom = () => {
  let arr = new Array(Math.round(Math.random() * 10))
  const set = [{cherry: "🍒 "},{apple: "🍏"}]
  return arr.fill(null).map((el) => set[Math.floor(set.length * Math.random())]) 
}

// TODO: put resolvers in separate file for consistency with datasource folder structure
const resolvers = {
  Query: {
    async comicAndTrivia(parent, args, ctx: Context, info) {
      const comic = await ctx.binding.query.latestComic({}, ctx)
      const { day, month } = comic
      const trivia = await ctx.binding.query.date({ date: `${month}/${day}` }, ctx)
      return { comic, trivia }
    },
    async triviaAndFruit(parent, args, ctx: Context, info) {
      const trivia = await ctx.binding.query.trivia({ number: Math.round(Math.random()*100) }, ctx) 
      return {triviaContent: trivia.text}
    },
    debug(parent, args, ctx, info) {
      console.log(info);
      console.log(info.fieldNodes)
      return 'Hello'
    }
  },
  TriviaAndFruit: {
    aBasketOfGreenApples (parent, args, ctx: Context, info) {
      const mockData = ctx.binding.query.greenApple({}, ctx)
      return mockData
    },
    aBasketOfCherries (parent, args, ctx: Context, info) {
      const mockData = ctx.binding.query.cherry({}, ctx)
      return mockData
    },
    aBasketOfMixedFruit (parent, args, ctx: Context, info) {
      const mockData = fillRandom()
      return mockData
    },
    legend (parent, args, ctx: Context, info) {
      return {greenApple: "🍏", cherry: "🍒"}
    }
  },  MixedFruit: {
    __resolveType(obj) {
        if (obj.cherry)  {
            return "Cherry"
        } else {
            return "GreenApple"
        }
    }
}

}

const gramps = prepare({ dataSources: [XKCD, Numbers, Mock] })

const server = new GraphQLServer({
  typeDefs: './src/generated/app.graphql',
  resolvers,
  context: req => ({
    ...req,
    ...gramps.context(req),
    binding: new Binding({ schema: gramps.schema }),
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
