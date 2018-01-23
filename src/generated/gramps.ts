import { Binding as BaseBinding, BindingOptions } from 'graphql-binding'
import { GraphQLResolveInfo } from 'graphql'

export interface Cherry {
  cherry?: String
}

export interface GreenApple {
  apple?: String
}

export interface Numbers_Trivia {
  text?: String
  found?: Boolean
  number?: Int
  type?: String
  date?: String
  year?: String
}

export interface XKCD_Comic {
  num: ID_Output
  title: String
  safe_title: String
  img: String
  alt: String
  transcript?: String
  year?: String
  month?: String
  day?: String
  link?: String
  news?: String
}

/*
The `Boolean` scalar type represents `true` or `false`.
*/
export type Boolean = boolean

/*
The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. 
*/
export type Int = number

/*
The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
*/
export type ID_Input = string | number
export type ID_Output = string

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string

export type MixedFruit = Cherry | GreenApple

export interface Schema {
  query: Query
}

export type Query = {
  grampsVersion: (args: {}, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<String>
  latestComic: (args: {}, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<XKCD_Comic | null>
  comic: (args: { id: ID_Output }, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<XKCD_Comic | null>
  trivia: (args: { number?: Int }, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<Numbers_Trivia | null>
  date: (args: { date?: String }, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<Numbers_Trivia | null>
  math: (args: { number?: Int }, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<Numbers_Trivia | null>
  year: (args: { number?: Int }, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<Numbers_Trivia | null>
  greenApple: (args: {}, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<GreenApple[] | null>
  cherry: (args: {}, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<Cherry[] | null>
  fruit: (args: {}, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<MixedFruit[] | null>
}

export class Binding extends BaseBinding {
  
  constructor({ schema, fragmentReplacements }: BindingOptions) {
    super({ schema, fragmentReplacements });
  }
  
  query: Query = {
    grampsVersion: (args, context, info): Promise<String> => super.delegate('query', 'grampsVersion', args, context, info),
    latestComic: (args, context, info): Promise<XKCD_Comic | null> => super.delegate('query', 'latestComic', args, context, info),
    comic: (args, context, info): Promise<XKCD_Comic | null> => super.delegate('query', 'comic', args, context, info),
    trivia: (args, context, info): Promise<Numbers_Trivia | null> => super.delegate('query', 'trivia', args, context, info),
    date: (args, context, info): Promise<Numbers_Trivia | null> => super.delegate('query', 'date', args, context, info),
    math: (args, context, info): Promise<Numbers_Trivia | null> => super.delegate('query', 'math', args, context, info),
    year: (args, context, info): Promise<Numbers_Trivia | null> => super.delegate('query', 'year', args, context, info),
    greenApple: (args, context, info): Promise<GreenApple[] | null> => super.delegate('query', 'greenApple', args, context, info),
    cherry: (args, context, info): Promise<Cherry[] | null> => super.delegate('query', 'cherry', args, context, info),
    fruit: (args, context, info): Promise<MixedFruit[] | null> => super.delegate('query', 'fruit', args, context, info)
  }
}