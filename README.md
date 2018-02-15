# The Great API Masher

Proof-of-Concept (PoC) for Remixing REST APIs with GraphQL

![pf](https://image.ibb.co/g8dP8x/1_wl_Xf8_Uu_VWLJt_DDXqo_P1_Tr_Q.png)

## Vision

The overall proposal is to make UI development more agile by leveraging GraphQL, an open source spec and implementation from Facebook, to implement data flow and runtime state derivation using a declarative paradigm, leaving the UI a thin I/O layer, with only the behaviors required for interactivity. 

Ultimately, UI components may be generated from the GraphQL schema as suggestions to UI developers, which can be customized by them and/or the designers. The idea is to ultimately generate 80% of code involved in developing a front-end app, starting with the data, and leveraging both GraphQL's declarative paradigm as well as interactive CLI tools, while also supporting fully manual --yet evolved-- app development with no lock-in. 

The philosophy employed here is to tackle the essential complexity of the task of building highly maintainable and highly performant apps, by using a declarative data flow and keeping business logic out of the UI, while at the same time eliminating self-inflicted, incidental complexity.

## Visual TL;DR

In the example below, you see that istead of four (4) requests between UI and REST API we have just one (1) request between UI and GraphQL. This can be done for the whole page or per component. It makes getting the data in a readily consumable form possible with just one call, thus increasing page load and pre-rendering performance drastically. In addition, we are able to define common data flow processes, including runtime state derivation, using the declarative paradigm of GraphQL instead of hard-coding that data flow in our UI or mid-tier data access layer. This helps us build cleaner UIs as well as avoid hard-coding data flow and runtime state derivation (and inference) in the UI and/or mid-tier.

### Note:

To ensure correct application behavior, and specifically, guaranteeing consistent reads and writes of a set of related data in the presence of concurrency and shared mutable state, the APIs must leverage the database to provide the level of transactional isolation required during orchestration and aggregation of any set of related data, e.g. using domain Aggregates (see: [Developing Microservices with Aggregates](https://www.slideshare.net/SpringCentral/developing-microservices-with-aggregates)) 

.

![image](https://image.ibb.co/fK0Oi7/Untitled_Diagram_54.png)

...

__The other great benefit of using the declarative power of GraphQL, besides eliminating the data-flow from the UI, is to eliminate the blocking dependency the frontend team often has on the backend team (those endless requests to tweak existing APIs to work better for a particular client, e.g. mobile, or build new APIs on top of existing ones simply go away with GraphQL and this declarative approach to _remixing_ REST APIs)__

## Accomplished Goals (so far)

- Convert REST APIs into GraphQL data sources that can be shared amongst internal and/or external teams.

- Enable automatic merging of such sources into one GraphQL Schema that can be accessed by internal and/or external teams to build apps in agile manner by using GraphQL’s declarative data-flow capabilities.

- Enable remixing of the GraphQL types (including queries and mutations) from the merged data source schemas into new GraphQL types to produce client-specific schema. This includes the ability to compose higher-order types to query data from various sources with one request and the ability to derive state based on some field in the query/mutation result, and represent the derived state in a sibling field, using declarative syntax. This removes the need for imperatively hardcoding common data-flow processes in the mid-tier and/or (as is often the case) in the UI. It means the UI becomes be a pure projection of persisted/derived state on the server (aside from client-specific logic for UI component animation and validation), and a thin I/O layer. 

## Maintaining Application Correctness 

The following rules apply whenever consistent reads and writes for a set of related data are expected when using stateless APIs in the presence of concurrency and shared mutable state in the persistence layer.  

While the API layer and the database schema/queries should be defined in such a way as to guarantee consistent reads and writes for related data, e.g. by using domain Aggregates in API endpoints, where distributed transactions can be avoided and all reads and writes happen within a single database transaction boundary, having a client invoke the same API endpoint more than once within the boundary of a single GraphQL query (e.g. recursive resolution or a list type that contains elements of the same type which are resolved in separate calls), can lead to application-level data inconsistency and incorrect behavior. 

- There should be no attempt to perform distributed transactions via GraphQL (instead use Aggregates on the backend to avoid distributed transactions and perform related mutations/queries within a single database transaction boundary, using the appropriate transaction isolation level, e.g. strict serializable for writes and snapshot isolation for reads) If a distributed transaction is needed, an API must be created that manages the distributed transaction.  

- Given the distributed/async nature of GraphQL query resolution, when contrasted with an expectation of a consistent state from each query, and when the data being fetched is shared and dynamic (can change between requests), in addition to using domain Aggregates for APIs with e.g. snapshot/serializable transaction isolation for reads/writes on the database side, multiple requests to the same API within a single query must be batched. This means that resolving an output is a list of higher order types (that have to be resolved further) should not involve calling the same API n times, where n is the number of items in the list. Instead we should batch into one call and let the API handle the consistent read (see: [graphql-resolve-batch](https://github.com/calebmer/graphql-resolve-batch)) This also means that we must avoid recursion in queries unless the data we're fetching is guaranteed not to change between requests. _Having said that, in exceptional circumstances, when one needs an escape hatch, the resolveInfo parameter, which is passed to every type resolver function, holds the entire query tree and can be used to go from GraphQL to SQL/NewSQL/NoSQL/Cypher or whatever native query format._

- Single Responsibility Principle (SRP) must be preserved in Type Resolvers (aka Controllers) by limiting interactions with the backend to a single API call per resolver and letting GraphQL perform the composition of the query's return type by following the resolver dependency chain. This way we can keep the composition declarative. Treating output from queries as all or nothing eliminates the requirement for complex exception handling.

- When multiple queries to the same API (or APIs) need to be processed in the sequence they were sent in, e.g. multiple queries from an autocomplete text box where the query results could come back out-of-order with respect to the HTTP requests,  GraphQL doesn't have a built-in way to handle that. Therefore, we would need to rely on the presence of temporal markers, e.g. automatically inserted time stamp in each HTTP request (via context), so if the Client receives multiple results from the same API that are out of order it can ignore any result with timestamp that is smaller than one it has received already. Similarly, other temporal logic maybe implemented by injecting unqiue (or sequential) values in the request, and passing them via context (`timeStamp` is injected by default by the server.) See "someQuery" in the example query at bottom of this page. 

-  If the API response can be interpreted differently by different clients that's a problem. Deriving a definite state in extra fields in the query output eliminates that problem. In other words if state needs to be "inferred" from API response, it should be done derived using extra fields in query's return type, where normally the client would have to infer state (based on presence/absence of certain fields or other types of inference) This is a feature of GraphQL that allows us to augment the API response to eliminate the need to infer or derive state in the client, which along with the ability to describe data-flow processes declaratively, allows us to keep our client as a thin I/O layer (aside from client-specific logic for UI component animation and validation.)


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
```

### XKCD Schema
```js
// Internal GraphQL Schema for XKCD API

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
{
    Query: {
      latestComic: (parent, args, context) => model.getLatestComic(parent, args, context),
      comic: (parent, { id }, context) => model.getComicById(parent, {id}, context),
    },
    XKCD_Comic: {
      // The link is often empty, so build one if it’s not returned.
      link: data => data.link || `https://xkcd.com/${data.num}/`,
    },
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
```

### Numbers Trivia Schema
```js
// Internal GraphQL Schema for Numbers Trivia API
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
{
  Query: {
    trivia: (parent, { number }, context) => model.getNumbers(parent, {number, type: 'trivia'}, context),
    date: (parent, { date }, context) => model.getNumbers(parent, {number: date, type: 'date'}, context),
    math: (parent, { number }, context) => model.getNumbers(parent, {number, type: 'math'}, context),
    year: (parent, { number }, context) => model.getNumbers(parent, {number, type: 'year'}, context),
  },
  Numbers_Trivia: {
    date: data => data.date || null, /* have to be explicit if it might be missing */
    year: data => data.year || null, /* have to be explicit if it might be missing */
  },
}
```

### Mock Schema

```js

// Using mock data source that returns (based on query type):
// an array of GreenApple,
// an array of Cherry
// an an array of Union type of GreenApple and Cherry 
// 

// Internal GraphQL Schema for Mock API

type Query {
  greenApple: [GreenApple]
  cherry: [Cherry]
  fruit: [MixedFruit]
  someQuery: SomeType
}

type SomeType {
  abc (someInput: String!): String
  timeStamp: String
  xyz: SomeOtherType
}

type SomeOtherType {
  test: String
  anotherTest: YetAnotherType
}

type YetAnotherType {
  test: String
}

type Cherry {
  cherry: String
}

type GreenApple {
  apple: String
}

union MixedFruit = Cherry | GreenApple

// Internal Resolvers for Mock API Schema

{
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
```

### Example of Automatically Generated Internal MERGED Schema

```js

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
  someQuery: SomeType
}

type SomeOtherType {
  test: String
  anotherTest: YetAnotherType
}

type SomeType {
  abc(someInput: String!): String
  timeStamp: String
  xyz: SomeOtherType
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

type YetAnotherType {
  test: String
}

```

### Example of Public GraphQL Schema that Remixes the Merged Internal Schema 

```js

# the following is not a comment; see graphql-import 
# import XKCD_Comic, Numbers_Trivia, GreenApple, Cherry, MixedFruit, SomeType from "./generated/gramps.graphql"

type Query {
  comicAndTrivia: ComicAndTrivia
  triviaAndFruit: TriviaAndFruit
  someQuery: SomeType
  debug: String
}

type ComicAndTrivia {
  comic: XKCD_Comic # exposing type from XKCD source 
  trivia: Numbers_Trivia # exposing type from Numbers source
}

type TriviaAndFruit {
  triviaContent: String # resolved by Numbers source
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

### Example of Public Resolvers for the Remixed Public Schema

```js
{
  Query: {
    async comicAndTrivia(parent, args, ctx: Context, info) {
      const comic = await XKCDResolvers.Query.latestComic(parent, args, ctx)
      return { comic }
    },
    async triviaAndFruit(parent, args, ctx: Context, info) {
      const trivia = await NumbersResolvers.Query.trivia(parent, { number: Math.round(Math.random()*100) }, ctx) 
      return {triviaContent: trivia.text}
    },
    someQuery (parent, args, ctx: Context, info) {
      const mockData = MockResolvers.Query.someQuery(parent, args, ctx)
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
      /* reselect a field and its descendants from parent that this field depends on, 
      using fragment */
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
      const mockData = MockResolvers.Query.greenApple(parent, args, ctx)
      return mockData
    },
    aBasketOfCherries (parent, args, ctx: Context, info) {
      const mockData = MockResolvers.Query.cherry(parent, args, ctx)
      return mockData
    },
    aBasketOfMixedFruit (parent, args, ctx: Context, info) {
      const mockData = MockResolvers.Query.fruit(parent, args, ctx)
      return mockData
    },
    legend (parent, args, ctx: Context, info) {
      return {greenApple: "🍏", cherry: "🍒"}
    }
  },  
}

```

### Example Public Query and its Output Using the Remixed Public Schema

```js
{
  someQuery {
    abc (someInput:"some string")
    timeStamp
    xyz {
      test
      anotherTest {
        test
      }
    }
  } 
  comicAndTrivia {
    comic {
        title
    }
    trivia {
        text
    }
  }

  triviaAndFruit {
    triviaContent
    
    aBasketOfCherries {
      cherry
    }
    aBasketOfGreenApples {
      apple
    }
    aBasketOfMixedFruit {
       ... on Cherry {
        cherry
      }
      ... on GreenApple {
        apple
      }
    }
    legend {
      greenApple
      cherry
    }
  }
}
```

```js

{
  "data": {
    "someQuery": {
      "abc": "some autocompletion of some string",
      "timeStamp": "1518233840275",
      "xyz": {
        "test": "some test xyz",
        "anotherTest": {
          "test": "yet another test"
        }
      }
    },
    "comicAndTrivia": {
      "comic": {
        "title": "The History of Unicode"
      },
      "trivia": {
        "text": "February 9th is the day in 1975 that the Soyuz 17 Soviet spacecraft returns to Earth."
      }
    },
    "triviaAndFruit": {
      "triviaContent": "85 is the atomic number of astatine.",
      "aBasketOfCherries": [
        {
          "cherry": "🍒"
        },
        {
          "cherry": "🍒"
        }
      ],
      "aBasketOfGreenApples": [
        {
          "apple": "🍏"
        },
        {
          "apple": "🍏"
        },
        {
          "apple": "🍏"
        },
        {
          "apple": "🍏"
        },
        {
          "apple": "🍏"
        },
        {
          "apple": "🍏"
        },
        {
          "apple": "🍏"
        },
        {
          "apple": "🍏"
        },
        {
          "apple": "🍏"
        }
      ],
      "aBasketOfMixedFruit": [
        {
          "cherry": "🍒 "
        },
        {
          "apple": "🍏"
        },
        {
          "cherry": "🍒 "
        },
        {
          "apple": "🍏"
        },
        {
          "cherry": "🍒 "
        },
        {
          "apple": "🍏"
        }
      ],
      "legend": {
        "greenApple": "🍏",
        "cherry": "🍒"
      }
    }
  }
}
```