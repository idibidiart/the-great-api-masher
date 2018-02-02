import * as fs from 'fs';
import resolvers from './resolvers';

export default {
  namespace: 'Mock',
  typeDefs: fs.readFileSync('./src/data-source-mock/schema.graphql', 'utf-8'),
  resolvers
};