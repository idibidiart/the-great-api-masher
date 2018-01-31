import { GraphQLConnector } from 'graphql-rest-helpers';

export default class NumbersConnector extends GraphQLConnector {
  constructor() {
    super();

    this.headers['Content-Type'] = 'application/json';
    this.apiBaseUri = `http://numbersapi.com`;
  }
}