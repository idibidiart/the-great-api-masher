export default {
  Query: {
    MockB_data: (_, __, context) => context.model.getData()
  }
};