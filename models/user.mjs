import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    _id: {
        type: Number,
    },

    first_name: {
        type: String,
    },

    username: {
        type: String,
    },

    channels: {
      type: Array,
      default: [],
    },
  }
);

export default mongoose.model('User', schema);
