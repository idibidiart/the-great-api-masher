import * as fs from 'fs';
import Connector from './connector';
import Model from './model';
import resolvers from './resolvers';

const model = {model: new Model({ connector: new Connector() })}

export default {
  namespace: 'XKCD',
  context: model,
  typeDefs: fs.readFileSync('./src/data-source-xkcd/schema.graphql', 'utf-8'),
  resolvers
};