import { GraphQLServer } from 'graphql-yoga'
import { prepare } from '@gramps/gramps'
import XKCD from './data-source-xkcd'
import Numbers from './data-source-numbers'
import MockA from './data-source-mock-a'
import MockB from './data-source-mock-b'
import MockC from './data-source-mock-c'
import { Binding } from './generated/gramps'
import { Context } from './utils'

// TODO: put resolvers in separate file for consistency with datasource folder structure
const resolvers = {
  Query: {
    async comicAndTrivia(parent, args, ctx: Context, info) {
      const comic = await ctx.binding.query.latestComic({}, ctx)
      const { day, month } = comic
      const trivia = await ctx.binding.query.date({ date: `${month}/${day}` }, ctx)
      return { comic, trivia }
    },
    async triviaAndOtherData(parent, args, ctx: Context, info) {
      const trivia = await ctx.binding.query.trivia({ number: Math.round(Math.random()*100) }, ctx) 
      return {triviaContent: trivia.text}
    },
    debug(parent, args, ctx, info) {
      console.log(info);
      console.log(info.fieldNodes)
      return 'Hello'
    }
  },
  TriviaAndOtherData: {
    anotherPublicField (parent, args, ctx: Context, info) {
      const mockDataA = ctx.binding.query.MockA_data(null, ctx)
      return mockDataA
    },
    yetAnotherPublicField (parent, args, ctx: Context, info) {
      const mockDataB = ctx.binding.query.MockB_data(null, ctx)
      return {someNestedField: mockDataB}
    },
  },
  SomeType: {
    someNestedFieldWithChildren (parent, args, ctx: Context, info) {
      const mockDataC = ctx.binding.query.MockC_data(null, ctx)
      return {childOfSomeNestedField: mockDataC}
    }
  }
}

const gramps = prepare({ dataSources: [XKCD, Numbers, MockA, MockB, MockC] })

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
