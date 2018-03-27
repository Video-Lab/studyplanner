var mongoose = require("mongoose")

var taskSchema = new mongoose.Schema({
    text: String,
    favorite: Boolean
});

var subjectSchema = new mongoose.Schema({
    name: String,
    urlName: String,
    tasks: [taskSchema],
    selected: Boolean,
    favorite: Boolean
});

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    fullName: String,
    email: String,
    // subjects: [{
    //     name: String,
    //     urlName: String,
    //     tasks: Array,
    //     selected: Boolean
    // }],
    subjects: [subjectSchema],
    currentSubject: Object,
    tasksToLoad: Array
});



module.exports = mongoose.model("User", userSchema);