const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;


const schema = new Schema({
  email:{
    type:Object,
    required:true
  },
  password:String,
  user_type:String,
  first_name: String,
  last_name: String,
  username: String,
  reset_password_hash:String,
  reset_password_expiry:Date,
  session: Array,
  session_id: Schema.Types.ObjectId,
},{ timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' } });

//Model
const model = mongoose.model('user',schema);


module.exports    = model;
