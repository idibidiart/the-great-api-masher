# The Great API Masher

Proof-of-Concept (PoC) for Remixing REST APIs with GraphQL

![gql](https://image.ibb.co/nBXCXT/1_wl_Xf8_Uu_VWLJt_DDXqo_P1_Tr_Q.png)

## Agile Architecture

The aim is to make UI development more agile by leveraging the declarative paradigm of GraphQL, an open source spec with NodeJS, Java and other implementations that allows us to specify the data flow and business logic outside the UI in a flexible, easy to change way. By keeping the data flow and business logic outside the UI we can keep the UI as a thin I/O layer, with only state being managed in client being the local state needed for visual behaviors and input validation.

The other great benefit of using a declarative data flow paradigm is remiving the blocking dependency the frontend team often has on the backend team (the endless requests to tweak existing APIs to work better for a particular client, e.g. mobile, or build new APIs on top of existing ones only to aggregate data, simply go away with GraphQL.

As we can see in the example below, instead of having many requests between UI and backend, we have just one request. This increases page responsiveness greatly and can be done for the whole page or on per-component basis. It makes it possible to get all the data we need for a given page (or component) in a directly consumable manner, including [derived state](https://github.com/idibidiart/the-great-api-masher/blob/master/README.md#example-of-public-resolvers-for-the-remixed-public-schema), with just one request, which dramatically reduces page load time and increases rendering performance, not to mention providing a much lighter, decoupled UI architecture that is much easier to evolve.

.

![image](https://image.ibb.co/gTZJ77/Screen_Shot_2018_03_30_at_8_25_50_AM.png)


### Application Correctness
To ensure correct application behavior and guarantee consistent reads and updates for a given set of related entities, the backend APIs, under the GraphQL layer, must leverage transaction isolation at the database level. In addition, we must use an API design pattern that guarantees consistent reads and updates. The main reason for this is that Eventually Consistent backends put the burden on the developer to prevent incorrect application behavior that results from conccurent writes and reads on shared data. One good way we found to solve the consistency problem is to use the domain Aggregates pattern to build an API layer under GraphQL (see: [Developing Microservices with Aggregates](https://www.slideshare.net/SpringCentral/developing-microservices-with-aggregates))

## Accomplished Goals (so far)

- Convert REST APIs into GraphQL data sources that can be shared amongst internal and/or external teams.

- Enable automatic merging of such sources into one GraphQL Schema that can be accessed by internal and/or external teams to build apps in agile manner by using GraphQL’s declarative data-flow capabilities.

- Enable remixing of the GraphQL types (including queries and mutations) from the merged data source schemas into new GraphQL types to produce client-specific schema. This includes the ability to compose higher-order types to query data from various sources with one request and the ability to derive state based on some field in the query/mutation result, and represent the derived state in a sibling field, using declarative syntax. This removes the need for imperatively hardcoding common data-flow processes. It means the UI becomes be a pure projection of persisted/derived state on the server (aside from client-specific logic for UI component visual behavior and validation), and a thin I/O layer. 

## GraphQL & Application Correctness   

While the API and the persistence layer should be designed in such a way as to guarantee consistent reads and uodates for each set of related data, e.g. by using domain Aggregates when the transaction executes in one database (so that distributed transactions can be avoided and all reads and updates from/to a set of related data can happen within a single database transaction with the appropriate isolation level), having a client asynchronously call the same API endpoint more than once, in rapid sequence and with different input, is not handled in anyway by GraphQL when it comes to assuring correct application behavior. Moreover, if different clients, e.g mobile vs desktop vs xbox, infer state from the API in different ways some of them may break following changes in the API. 

In general the following are good rules to follow:

- There should be no attempt to perform distributed transactions via GraphQL (instead use Aggregates on the backend to avoid distributed transactions when dealing with one database and perform related mutations/queries within a single database transaction boundary, using the appropriate transaction isolation level, e.g. strict serializable for writes and snapshot isolation for reads) If a distributed transaction involves multiple systems, or is long running, a transaction management layer should be created that manages such distributed transactions.  

- When multiple queries to the same API (or APIs) need to be processed in sync with UI state, e.g. multiple queries from an autocomplete text box where the query results could come back out-of-order with respect to the HTTP requests,  GraphQL doesn't have a built-in way to handle that. Therefore, we would need to rely on the presence of request-response mapping, e.g. add a 'uuid(val: String) : String' field in each query so if the client receives multiple results from the same API that are out of order it can use the uuid field in the query result (which reflects the input val) to filter for the response that matches the current state of the autocomplete. 

-  If the API response can be interpreted differently by different clients that's a problem. Inferring a definite state in extra fields in the query output eliminates that problem. In other words if state needs to be "inferred" from API response, it should be done using extra fields in query's return type, where normally the client would have to infer state (based on presence/absence of certain fields or other types of inference) This feature of GraphQL allows us to augment our API's response to eliminate the need to infer state in the client.

## Maintaining Declarative Composition

- Single Responsibility Principle (SRP) must be preserved in Type Resolvers (aka Controllers) by limiting interactions with the backend to a single API call per resolver invocation and letting GraphQL perform the composition of the returned types by following the resolver dependency chain. This way we can keep the composition declarative.

## Query Performance

- To avoid N+1 query proliferation when resolving sub-types in a list type, e.g. get the user's Friends and the name of each of the Friends, we may use batched resolution, via e.g. graphql-resolve-batch. In this case, the API for Friends must support batched input.  

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
  uuid(val: String): String
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
    uuid: (parent, args, context) => Promise.resolve(args.val),
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
  uuid (val: String): String
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
      using fragment. This is also how we can implement #derived state. */
      
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
    uuid(val: "6eghwudf7iy3idhgs8o9s89ds89f9gghgh")
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
      "uuid": "6eghwudf7iy3idhgs8o9s89ds89f9gghgh",
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
