import Model from './model'
import Connector from './connector';

const model = new Model({ connector: new Connector() })

export default {
  Query: {
    trivia: (parent, { number }, context) => model.getNumbers(number, 'trivia'),
    date: (parent, { date }, context) => model.getNumbers(date, 'date'),
    math: (parent, { number }, context) => model.getNumbers(number, 'math'),
    year: (parent, { number }, context) => model.getNumbers(number, 'year'),
  },
  Numbers_Trivia: {
    date: data => data.date || null, /* have to be explicit if it might be missing */
    year: data => data.year || null, /* have to be explicit if it might be missing */
  },
};