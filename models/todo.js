const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise; //replace mongoose deprecated promise with a native one

const TodoSchema = new Schema({
  value: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  parent: {
    type: Schema.Types.ObjectId,
    default: null
  }
});

module.exports = mongoose.model('Todo', TodoSchema);
