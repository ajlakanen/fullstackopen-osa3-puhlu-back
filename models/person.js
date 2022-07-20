const mongoose = require("mongoose");

const url = process.env.REACT_APP_MONGODB_URI;
console.log(url);
console.log("connecting to", url);
mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    minlength: 3,
    validate: {
      validator: function (v) {
        return /^(\d{2}-\d{6,})|(\d{3}-\d{5,})$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number`,
    },
    required: [true, "phone number required"],
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
