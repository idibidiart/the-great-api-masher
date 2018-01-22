import * as fs from 'fs';
import resolvers from './resolvers';

export default {
  namespace: 'Numbers',
  typeDefs: fs.readFileSync('./src/data-source-numbers/schema.graphql', 'utf-8'),
  resolvers
};