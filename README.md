# The Great API Masher

See [This](https://docs.google.com/document/d/1CzGScZ69VozocWmULRB-Kt4i8fxUUmC_xooYq9ZZPAs/edit?usp=sharing) for background.

Proof-of-Concept (PoC) for Remixing REST APIs with GraphQL, GrAMPS, GraphQL Bindings, and GraphQL Yoga.

## TL;DR

- Convert REST APIs into GraphQL data sources that can be shared amongst internal and/or external teams.

- Enable automatic merging of such sources into one GraphQL Schema that can be accessed by internal and/or external teams to build apps in agile manner by using GraphQL’s declarative nature.

- Enable remixing of the GraphQL types (including queries and mutations) from the merged schema into new GraphQL types to produce application --or client-- specific schema. This includes the ability to declaratively filter, compose and pipe the output from one or more queries into other queries/mutations (and do so between the parts of a single query)  In essence, it allows us to use GraphQL as a declarative schema-centered, data-flow programming environment, which removes the need for imperatively coding data flow in the mid-tier and/or (as is often the case) in the UI. This means the UI is guaranteed to be a pure projection of app state on the server, and a thin I/O layer. 

__The main benefit of the approach, besides getting rid of the data-flow code in the UI is to remove the blocking dependency the frontend team often has on the backend team (those endless requests to tweak existing APIs to work better for a particular client, e.g. mobile, or build new APIs on top of existing ones simply go away with GraphQL and this declarative approach to _remixing_ REST APIs) __

Based on open source work by: 

[**Jason Lengstorf** (US)](https://github.com/gramps-graphql/gramps) author of GrAMPS (GraphQL Apollo Microservices Pattern Server)

[**Kim Brandwijk** (NL)](https://github.com/kbrandwijk) author of graphql-static-binding and contributor to GraphQL Bindings & GraphQL Yoga

[**Marc Fawzi** (US)](https://github.com/idibidiart/graffalo) co-author GraffaloJS

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
      latestComic: (parent, args, context) => model.getLatestComic(),
      comic: (parent, { id }, context) => model.getComicById(id),
    },
    XKCD_Comic: {
      // The link is often empty, so build one if it’s not returned.
      link: data => data.link || `https://xkcd.com/${data.num}/`,
    }
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
    trivia: (parent, { number }, context) => model.getNumbers(number, 'trivia'),
    date: (parent, { date }, context) => model.getNumbers(date, 'date'),
    math: (parent, { number }, context) => model.getNumbers(number, 'math'),
    year: (parent, { number }, context) => model.getNumbers(number, 'year'),
  },
  Numbers_Trivia: {
    date: data => data.date || null, /* have to be explicit if it might be missing */
    year: data => data.year || null, /* have to be explicit if it might be missing */
  }
```

### Mock API 

```js

// Using mock data source that returns (based on query params):
// an array of GreenApple,
// an array of Cherry
// an an array of Union type of GreenApple and Cherry 
//  
// no external request

// Internal GraphQL Schema for Mock API, manually constructed

type Query {
  greenApple: [GreenApple]
  cherry: [Cherry]
  fruit: [MixedFruit]
}

type Cherry {
  cherry: String
}

type GreenApple {
  apple: String
}

union MixedFruit = Cherry | GreenApple

// Internal Resolvers for Mock API Schema

  Query: {
    greenApple: (parent, args, context) => model.getData({type: "GreenApple"}),
    cherry: (parent, args, context) => model.getData({type: "Cherry"}),
    fruit: (parent, args, context) => model.getData({}), // returns Union of both types
  }, 
  // GraphQL must be able to distinguish GreenApple from Cherry in MixedFruit
  // which is a Union of different types (i.e. the actual type is **not** fixed 
  // at design time) 
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
```

## Example of Automatically Generated Internal MERGED Schema

```js
type Cherry {
  cherry: String
}

type GreenApple {
  apple: String
}

union MixedFruit = Cherry | GreenApple

type Numbers_Trivia {
  text: String
  found: Boolean
  number: Int
  type: String
  date: String
  year: String
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
  greenApple: [GreenApple]
  cherry: [Cherry]
  fruit: [MixedFruit]
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
```

## Example of Public GraphQL Schema that Remixes the Merged Internal Schema 

```js

# the following is not a comment; see graphql-import 
# import XKCD_Comic, Numbers_Trivia, GreenApple, Cherry, MixedFruit from "./generated/gramps.graphql"

type Query {
  comicAndTrivia: ComicAndTrivia,
  triviaAndFruit: TriviaAndFruit
  debug: String
}

type ComicAndTrivia {
  comic: XKCD_Comic # exposing type from XKCD source 
  trivia: Numbers_Trivia # exposing type from Numbers source
}

type TriviaAndFruit {
  triviaContent: String, # resolved by Numbers source
  aBasketOfGreenApples: [GreenApple]  # resolved by Mock source
  aBasketOfCherries: [Cherry] # resolved by Mock source
  aBasketOfMixedFruit: [MixedFruit] # resolved by Mock source
  legend: Legend   
}

type Legend {
  greenApple: String
  cherry: String
}

```

## Example of Public Resolvers for the Remixed Public Schema

```js
{
  Query: {
    async comicAndTrivia(parent, args, ctx: Context, info) {
      const comic = await XKCDResolvers.Query.latestComic(parent, {}, ctx)
      return { comic }
    },
    async triviaAndFruit(parent, args, ctx: Context, info) {
      const trivia = await NumbersResolvers.Query.trivia(parent, { number: Math.round(Math.random()*100) }, ctx) 
      return {triviaContent: trivia.text}
    },
    debug(parent, args, ctx, info) {
      console.log(info);
      console.log(info.fieldNodes)
      return 'Hello'
    }
  },
  // advanced: special field level resolver that gets its data implicitly from  
  // another type, via destructuring 
  ComicAndTrivia: {
    trivia: {
      /* define type and data that this field depends on, using fragment */
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
  // referencing __resolveType in the Mock data source resolvers
  // see resolvers for Mock data source 
  MixedFruit: {
    __resolveType: MockResolvers.MixedFruit.__resolveType
  }
}

```

## Example Public Query and its Output Using the Remixed Public Schema

![image](https://image.ibb.co/bEmebw/Screen_Shot_2018_01_23_at_7_50_21_AM.png)

![image](https://image.ibb.co/dGVDib/Screen_Shot_2018_01_22_at_12_30_57_AM.png)


