import * as fs from 'fs';
import Model from './model';
import resolvers from './resolvers';

export default {
  namespace: 'XKCD',
  typeDefs: fs.readFileSync('./src/data-source-xkcd/schema.graphql', 'utf-8'),
  resolvers
};