import { GraphQLServer } from 'graphql-yoga'
import { prepare } from '@gramps/gramps'
import XKCD from './data-source-xkcd'
import XKCDResolvers from './data-source-xkcd/resolvers'
import Numbers from './data-source-numbers'
import NumbersResolvers from './data-source-numbers/resolvers'
import Mock from './data-source-mock'
import MockResolvers from './data-source-mock/resolvers'
import { Context, mergeResolvers } from './utils'

const fillRandom = () => {
  let arr = new Array(Math.round(Math.random() * 10))
  const set = [{cherry: "🍒 "},{apple: "🍏"}]
  return arr.fill(null).map((el) => set[Math.floor(set.length * Math.random())]) 
}

// TODO: put resolvers in separate file for consistency with datasource folder structure
const resolvers = {
  Query: {
    async comicAndTrivia(parent, args, ctx: Context, info) {
      const comic = await XKCDResolvers.Query.latestComic(parent, {}, ctx)
      return { comic }
    },
    async triviaAndFruit(parent, args, ctx: Context, info) {
      const trivia = await NumbersResolvers.Query.trivia(parent, { number: Math.round(Math.random()*100) }, ctx) 
      return {triviaContent: trivia.text}
    },
    someQuery (parent, args, ctx: Context, info) {
      const mockData = MockResolvers.Query.someQuery(parent, {}, ctx)
      return mockData
    },
    debug(parent, args, ctx, info) {
      console.log(info);
      console.log(info.fieldNodes)
      return 'Hello'
    }
  },
  ComicAndTrivia: {
    trivia: {
      /* define fragment on parent type that this field depends on, using 
      fragment, i.e. filter and pipe data between children and in this 
      case between comic source and trivia source */
      fragment: `fragment ComicFragment on ComicAndTrivia { comic { day month } }`,
      resolve: async (parent, args, ctx: Context, info) => {
         const {day, month} = parent.comic
         const trivia = await NumbersResolvers.Query.date(parent, { date: `${month}/${day}` }, ctx)
         return trivia 
      }
    }
  },

  TriviaAndFruit: {
    aBasketOfGreenApples (parent, args, ctx: Context, info) {
      const mockData = MockResolvers.Query.greenApple(parent, {}, ctx)
      return mockData
    },
    aBasketOfCherries (parent, args, ctx: Context, info) {
      const mockData = MockResolvers.Query.cherry(parent, {}, ctx)
      return mockData
    },
    aBasketOfMixedFruit (parent, args, ctx: Context, info) {
      const mockData = MockResolvers.Query.fruit(parent, {}, ctx)
      return mockData
    },
    legend (parent, args, ctx: Context, info) {
      return {greenApple: "🍏", cherry: "🍒"}
    }
  },  
}

const gramps = prepare({ dataSources: [XKCD, Numbers, Mock] })

const server = new GraphQLServer({
  typeDefs: './src/generated/app.graphql',
  resolvers: mergeResolvers(resolvers, XKCDResolvers, NumbersResolvers, MockResolvers),
  context: req => ({
    ...req,
    ...gramps.context(req)
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
