export default {
  Query: {
    MockA_data: (_, __, context) => context.model.getData()
  }
};