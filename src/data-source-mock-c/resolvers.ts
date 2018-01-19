export default {
  Query: {
    MockC_data: (_, __, context) => context.model.getData()
  }
};