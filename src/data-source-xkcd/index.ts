import * as fs from 'fs';
import resolvers from './resolvers';

export default {
  namespace: 'XKCD',
  typeDefs: fs.readFileSync('./src/data-source-xkcd/schema.graphql', 'utf-8'),
  resolvers
};