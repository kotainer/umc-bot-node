import uuid from 'uuid/v1';
import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    _id: {
        type: String,
        default: uuid,
    },

    userId: Number,
    channelId: Number,
    text: String,

    types: {
      image: {
        type: Number,
        default: 0,
      },
      text: {
        type: Number,
        default: 0,
      },
      buttons: {
        type: Number,
        default: 0,
      },
      reactions: {
        type: Number,
        default: 0,
      },
      links: {
        type: Number,
        default: 0,
      },
      stats: {
        type: Number,
        default: 0,
      },
    },

    photo: {
      type: Array,
      default: [],
    },

    document: {
      type: Array,
      default: [],
    },

    buttons: {
      type: Array,
      default: [],
    },

    reactions: {
      type: Array,
      default: [],
    },

    isSending: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: new Date,
    },
  }
);

export default mongoose.model('Post', schema);
