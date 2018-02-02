
import { GraphQLModel } from 'graphql-rest-helpers';

export default class XKCDModel extends GraphQLModel {
  /**
   *
   */
  constructor({connector}) {
    super({connector});
  }

  /**
   * Loads the latest xkcd comic.
   * @return {Promise}     resolves with the loaded comic data
   */
  async getLatestComic() {
    return this.connector.get(`/info.0.json`)
      .then((res) => {
        // workaround for Promise.all use by Dataloader
        if (res.error) {
          throw(res)
        }
        console.log("XKCD API output for getLatestComic", res)
        return res
      })
      .catch(res =>
        this.throwError(res, {
          data: {}
        }))
  }

  /**
   * Loads an xkcd comic by its ID.
   * @param  {String}  id  the ID of the comic to load
   * @return {Promise}     resolves with the loaded comic data
   */
  async getComicById(id) {
    return this.connector.get(`/${id}/info.0.json`)
      .then((res) => {
        // workaround for Promise.all used for Dataloader
        if (res.error) {
          throw(res)
        }
        console.log("XKCD API output for getComicById with id", id, res)
        return res
      }).catch(res => {
        this.throwError(res, {
          data: {}
        })
      })
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