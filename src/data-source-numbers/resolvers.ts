export default {
  Query: {
    trivia: (_, { number }, context) => context.model.getNumbers(number, 'trivia'),
    date: (_, { date }, context) => context.model.getNumbers(date, 'date'),
    math: (_, { number }, context) => context.model.getNumbers(number, 'math'),
    year: (_, { number }, context) => context.model.getNumbers(number, 'year'),
  },
  Numbers_Trivia: {
    date: data => data.date || null, /* have to be explicit if it might be missing */
    year: data => data.year || null, /* have to be explicit if it might be missing */
  },
};