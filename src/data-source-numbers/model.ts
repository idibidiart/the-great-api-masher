
import { GraphQLModel } from 'graphql-rest-helpers';

export default class NumbersModel extends GraphQLModel {
  constructor({connector}) {
    super({connector});
  }
 
  async getNumbers(input, type) {
    return this.connector.get(`/${input}/${type}`)
      .then((res) => {
        // workaround for Promise.all use by Dataloader
        if (res.error) {
          throw(res)
        }
        console.log("Numbers API output for getNumbers with input", input, "type", type, res)
        return res
      })
      .catch(res => {
        this.throwError(res, {
          data: { input, type }
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