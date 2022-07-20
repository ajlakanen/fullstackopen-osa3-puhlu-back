const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://fullstackopen:${password}@cluster0.b9jhy.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const name = process.argv[3];
const number = process.argv[4];

const person = new Person({
  name: `${name}`,
  number: `${number}`,
});

if (process.argv.length < 5) {
  console.log("Phonebook:");
  Person.find({}).then((persons) => {
    persons.forEach((p) => {
      console.log(`${p.name} ${p.number}`);
    });
    mongoose.connection.close();
  });
  return;
}

person.save().then(() => {
  console.log("person saved!");
  mongoose.connection.close();
});
