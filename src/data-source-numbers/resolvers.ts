import Model from './model'
import Connector from './connector';

const model = new Model({ connector: new Connector() })

export default {
  Query: {
    trivia: (parent, { number }, context) => model.getNumbers(parent, {number, type: 'trivia'}, context),
    date: (parent, { date }, context) => model.getNumbers(parent, {number: date, type: 'date'}, context),
    math: (parent, { number }, context) => model.getNumbers(parent, {number, type: 'math'}, context),
    year: (parent, { number }, context) => model.getNumbers(parent, {number, type: 'year'}, context),
  },
  Numbers_Trivia: {
    date: data => data.date || null, /* have to be explicit if it might be missing */
    year: data => data.year || null, /* have to be explicit if it might be missing */
  },
};