
import { GraphQLModel } from 'graphql-rest-helpers';

export default class NumbersModel extends GraphQLModel {
  constructor({connector}) {
    super({connector});
  }
 
  async getNumbers(parent, {number, type}, context) {
    return this.connector.get(`/${number}/${type}`)
      .then((res) => {
        // workaround for Promise.all used for Dataloader
        if (res.error) {
          throw(res)
        }
        console.log("Numbers API output for getNumbers with input", number, "type", type, res)
        return res
      })
      .catch(res => {
        this.throwError(res, {
          data: { number, type }
        })
      }
    );
  }  

  throwError(
    res,
    {data},
  ) { 
    const err = `message: ${res.message}
    uri: ${res.options.uri}
    code: ${res.error.code}
    data: ${JSON.stringify(data)}`
    throw new Error(err)
  }
}