import Model from './model'
import Connector from './connector';

const model = new Model({ connector: new Connector() })

export default {
    Query: {
      latestComic: (parent, args, context) => model.getLatestComic(parent, args, context),
      comic: (parent, { id }, context) => model.getComicById(parent, {id}, context),
    },
    XKCD_Comic: {
      // The link is often empty, so build one if it’s not returned.
      link: data => data.link || `https://xkcd.com/${data.num}/`,
    },
  };