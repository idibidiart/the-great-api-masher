# The Great API Masher

Proof-of-Concept (PoC) for Remixing REST APIs with GraphQL, GrAMPS, GraphQL Bindings, and GraphQL Yoga.

Based on open source work by: 

**Jason Lengstorf** (IBM, USA) author of GrAMPS (GraphQL Apollo Microservices Pattern Server)

**Kim Brandwijk** (NL) author of graphql-static-binding and contributor to GraphQL Bindings & GraphQL Yoga



## Examples of Existing REST APIs (and Mock APIs) and their GraphQL Schema

### XKCD API

```js
// KXCD API 
// Request made to https://xkcd.com/info.0.json

{ month: '1',
  num: 1943,
  link: '',
  year: '2018',
  news: '',
  safe_title: 'Universal Dreams',
  transcript: '',
  alt: '"That\'s ... unsettling." "Yeah, those definitely don\'t sound like the normal dream" ',
  img: 'https://imgs.xkcd.com/comics/universal_dreams.png',
  title: 'Universal Dreams',
  day: '17' }

// Internal GraphQL Schema for XKCD API, manually constructed

type Query {
  latestComic: XKCD_Comic
  comic(
    id: ID!
  ): XKCD_Comic
}

type XKCD_Comic {
  num: ID!
  title: String!
  safe_title: String!
  # Direct link to the comic image.
  img: String!
  alt: String!
  transcript: String
  year: String
  month: String
  day: String
  link: String
  news: String
}

// Internal GraphQL Resolvers for XKCD Schema

Query: {
    latestComic: (_, __, context) => context.model.getLatestComic(),
    comic: (_, { id }, context) => context.model.getComicById(id),
},
XKCD_Comic: {
    // The link is often empty, so build one if it’s not returned.
    link: data => data.link || `https://xkcd.com/${data.num}/`,
},
```

### Numbers Trivia API

```js
// Numbers Trivia API
// Request made to http://numbersapi.com/98/trivia

{ text: '98 is the highest jersey number allowed in the National Hockey League (as 99 was retired by the entire league to honor Wayne Gretzky).',
  number: 98,
  found: true,
  type: 'trivia' }

// Request made to http://numbersapi.com/1/17/date

{ text: 'January 17th is the day in 1912 that Captain Robert Falcon Scott reaches the South Pole, one month after Roald Amundsen.',
  year: 1912,
  number: 17,
  found: true,
  type: 'date' }

// Internal Graph Schema for Numbers Trivia API, manually constructed

type Query {
  trivia(number: Int): Numbers_Trivia
  date(date: String): Numbers_Trivia
  math(number: Int): Numbers_Trivia
  year(number: Int): Numbers_Trivia
}

type Numbers_Trivia {
  text: String
  found: Boolean
  number: Int
  type: String
  date: String
  year: String
}

// Internal Resolvers for Numbers Trivia Schema

  Query: {
    trivia: (_, { number }, context) => context.model.getNumbers(number, 'trivia'),
    date: (_, { date }, context) => context.model.getNumbers(date, 'date'),
    math: (_, { number }, context) => context.model.getNumbers(number, 'math'),
    year: (_, { number }, context) => context.model.getNumbers(number, 'year'),
  },
  Numbers_Trivia: {
    date: data => data.date || null, /* have to be explicit if it might be missing */
    year: data => data.year || null, /* have to be explicit if it might be missing */
  }
```

### Mock API (A, B and C)

```js

// Using mock data source that returns a string; no external request

// Internal GraphQL Schema for Mock API, manually constructed

type Query {
  # Generally, types should be prefixed with source name to avoid conflict
  Mock[A|B|C]_data: String
}

// GraphQL Resolvers for Mock API Schema

Query: {
    Mock[A|B|C]_data: (_, __, context) => context.model.getData()
}
```

## Example of Automatically Generated Internal MERGED Schema

```js
type Numbers_Trivia {
  text: String
  found: Boolean
  number: Int
  type: String
  date: String
  year: String
}

type XKCD_Comic {
  num: ID!
  title: String!
  safe_title: String!
  """Direct link to the comic image."""
  img: String!
  alt: String!
  transcript: String
  year: String
  month: String
  day: String
  link: String
  news: String
}

type Query {
  """Returns the current version of GrAMPS."""
  grampsVersion: String!
  latestComic: XKCD_Comic
  comic(id: ID!): XKCD_Comic
  trivia(number: Int): Numbers_Trivia
  date(date: String): Numbers_Trivia
  math(number: Int): Numbers_Trivia
  year(number: Int): Numbers_Trivia
  MockA_data: String
  MockB_data: String
  MockC_data: String
}
```

## Example of Public GraphQL Schema that Remixes the Merged Internal Schema 

```js

# Public Schema that remixes internal schemas of GrAMPS sources

# the following is not a comment; see graphql-import 
# import XKCD_Comic, Numbers_Trivia from "./generated/gramps.graphql"

type Query {
  getComicAndTrivia: ComicAndTrivia,
  getTriviaAndOtherData: TriviaAndOtherData
}

type ComicAndTrivia {
  comic: XKCD_Comic # exposing type from XKCD source 
  trivia: Numbers_Trivia # exposing type from Numbers source
}

type TriviaAndOtherData {
  triviaContent: String, # resolved by Numbers source
  anotherPublicField: String  # resolved by Mock A source
  yetAnotherPublicField: SomeType
}

type SomeType {
  someNestedField: String # resolved by Mock B source 
  someNestedFieldWithChildren: SomeOtherType
}

type SomeOtherType {
  childOfSomeNestedField: String # resolved by Mock C source resolver
}

```

## Example of Public Resolvers for the Remixed Public Schema

```js
const resolvers = {
  Query: {
    async getComicAndTrivia(parent, args, ctx: Context, info) {
      const comic = await ctx.binding.query.latestComic({}, ctx)
      const { day, month } = comic
      const trivia = await ctx.binding.query.date({ date: `${month}/${day}` }, ctx)
      return { comic, trivia }
    },
    async getTriviaAndOtherData(parent, args, ctx: Context, info) {
      const trivia = await ctx.binding.query.trivia({ number: Math.round(Math.random()*100) }, ctx) 
      return {triviaContent: trivia.text}
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

```

## Example Public Query and its Output Using the Remixed Public Schema

![image](https://image.ibb.co/hKmHMm/Screen_Shot_2018_01_18_at_4_30_13_PM.png)


