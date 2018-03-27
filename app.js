// ===== TODO LIST =====
// Fix saving to DB for tasks
// Logic error with Subdocument for Subjects




// ===== CONFIG =====

const express = require("express"),
      bodyParser = require("body-parser"),
      app = express(),
      mongoose = require("mongoose");

mongoose.connect(process.env.DB);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.favicon(__dirname + '/public/imgs/study-old.png')); 

function move(arr, prevIndex, newIndex) {
    while (prevIndex < 0) {
        prevIndex += arr.length;
    }
    while (newIndex < 0) {
        newIndex += arr.length;
    }
    if (newIndex >= arr.length) {
        var k = newIndex - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }
     arr.splice(newIndex, 0, arr.splice(prevIndex, 1)[0]);  
   return arr;
}

var User = require("./models/user")

// ===== DATABASE ======

// function User(fullName, email, name, pass){
// this.username = name;
// this.password = pass;
// this.fullName = fullName;
// this.email = email;
// this.subjects = [
//     new Subject("Math"),
//     new Subject("English"),
//     new Subject("Sciences"),
//     new Subject("Geography")
//     ];
// }

// function findFromUsers(ifTrue, ifFalse) {
//     User.find({}, function(err, users) {
//         users.forEach(function(user) {
//             if (loggedInUser.username === user.username && loggedInUser.password === user.password) {
//                 ifTrue
//                 loggedInUser = user
//             }

//             else if (loggedInUser.username !== user.username && loggedInUser.password !== user.password) {
//                 console.log(err)
//                 ifFalse
//             }
//         })
//     })
// }

function Subject(subjectName) {
    var obj = {
        name: subjectName,
        urlName: subjectName[0].toLowerCase() + subjectName.substring(1),
        tasks: [],
        selected: false
    };

    obj.tasks.push({
        text: "This is your first " + subjectName[0].toLowerCase() + subjectName.substring(1) + " task. Edit or Delete it to your liking.",
        favorite: false});

    return obj;

}

var invalidLogin = false;
var loggedInUser;

// ===== ROUTES =====


// ===== HOME ROUTES =====

app.get("/", function(req, res) {
    console.log("Home route recieved.");

    var title = "ezStudy - Online Study Planner";
    var styleLink = "/css/home.css";
    res.render("home", { title: title, styleLink: styleLink, loggedInUser: loggedInUser });
});

app.get("/login", function(req, res) {
    console.log("Login route recieved.");

    var title = "ezStudy - Login";
    var styleLink = "/css/login.css";
    res.render("login", { title: title, invalidLogin: invalidLogin, styleLink: styleLink, loggedInUser: loggedInUser });
});

app.post("/loginUser", function(req, res) {
    console.log("Login (POST) route recieved.");

    var username = req.body.username;
    var password = req.body.password;
    var forEachRun = true;

    User.find({}, function(err, users) {
        users.forEach(function(user) {
            if(forEachRun === true) {
            if (username === user.username && password === user.password) {
                console.log("Login for user " + user.username + " successful.");
                invalidLogin = false;
                forEachRun = false;
                user.subjects[0].selected = true;
                user.currentSubject = user.subjects[0];
                user.tasksToLoad = user.subjects[0].tasks;

                user.save(function(err, upUser) {
                    if (err) {
                        console.log(err);
                    }

                    loggedInUser = upUser;
                    loggedInUser.id = upUser._id;
                    console.log("User: " + user.username + " successfully updated.");
                });

            }

            else if (username !== user.username || password !== user.password) {
                console.log(err);
                invalidLogin = true;
            }
            }
        });
       
       if(invalidLogin === true){
           res.redirect("/login");
       }
       
       else if(invalidLogin === false){
           res.redirect("/planner");
       }
    });

});

app.get("/register", function(req, res) {
    console.log("Register route recieved.");

    var title = "ezStudy - Register";
    var styleLink = "/css/register.css";
    res.render("register", { title: title, styleLink: styleLink, loggedInUser: loggedInUser });
});

app.post("/registerUser", function(req, res) {
    console.log("Register (POST) route recieved.");

    var name = req.body.regName;
    var username = req.body.regUsername;
    var email = req.body.regEmail;
    var password = req.body.regPassword;

    User.create({
        username: username,
        password: password,
        fullName: name,
        email: email,
        subjects: [
            Subject("All"),
            Subject("Math"),
            Subject("English"),
            Subject("Sciences"),
            Subject("Geography")
        ],
        currentSubject: {},
        tasksToLoad: []
    }, function(err, user) {

        if (err) {
            console.log(err);
            res.redirect("/error");
        }

        else {
            user.subjects[0].tasks.shift()
            for(var i = 1; i < user.subjects.length; i++){
                var arr = user.subjects[i].tasks
                arr.forEach(function(task){
                    user.subjects[0].tasks.push(task)
                })
            }
            
            user.subjects[0].selected = true;
            user.currentSubject = user.subjects[0];
            user.tasksToLoad = user.subjects[0].tasks;
            loggedInUser = user;
            loggedInUser.id = user._id;
            console.log("New user created: " + user);
            res.redirect("planner");

            user.save(function(err, upUser) {
                if (err) {
                    console.log(err);
                    res.redirect("/error");
                }

                loggedInUser = upUser;
                console.log("User: " + user.username + " successfully updated.");
            });
        }
    });
});


app.get("/logout", function(req, res) {
    loggedInUser = null;
    res.redirect("/");
});


// ===== MAIN PLANNER ROUTES =====

app.get("/planner", function(req, res) {
    console.log("Planner route recieved.");

    var title = "ezStudy - Planner";
    var styleLink = "/css/planner.css";
    var tasksToLoad;
    invalidLogin = false;

    if (loggedInUser === undefined || loggedInUser === null) {
        res.redirect("/error");
    }


    User.findById(loggedInUser.id, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/error");
        }

        else {
            user.subjects.forEach(function(subject) {
                if (subject.name === user.currentSubject.name) {
                    // subject.tasks.forEach(function(task){
                    //     if(task.favorite === true){
                    //         move(subject.tasks, subject.tasks.indexOf(task), 0)
                    //     }
                    // })
                    user.tasksToLoad = subject.tasks;
                    loggedInUser.currentSub = subject;
                }
            });


            user.save(function(err, upUser) {
                if (err) {
                    console.log(err);
                    res.redirect("/error");
                }

                loggedInUser = upUser;
                console.log("User: " + user.username + " successfully updated.");
            });

        }
    });

    res.render("planner", {
        loggedInUser: loggedInUser,
        title: title,
        styleLink: styleLink,
        tasksToLoad: tasksToLoad
    });
});

// ===== SUBJECTS =====

app.get("/planner/:subject", function(req, res) {
    console.log("Selection of subject route recieved.");

    //  loggedInUser.subjects.forEach(function(subjects){
    //      subjects.selected = false;
    //      if(requestedSubject === subjects.urlName){
    //          subjects.selected = true;
    //      }
    //  })

    var requestedSubject = req.params.subject;

    User.findById(loggedInUser.id, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/error");
        }

        else {
            user.subjects.forEach(function(subject) {
                subject.selected = false;
                console.log("Running selection on subject: " + subject.name);

                if (subject.name === requestedSubject) {
                    subject.selected = true;
                    user.currentSubject = subject;
                    user.tasksToLoad = subject.tasks;

                    console.log("Subject " + subject.name + " selected.");
                }
            });

            user.save(function(err, upUser) {
                if (err) {
                    console.log(err);
                    res.redirect("/error");
                }

                loggedInUser = upUser;
                console.log(upUser);
                console.log("User: " + user.username + " successfully updated.");
            });
        }
    });



    res.redirect("planner");
});

app.post("/addNewSubject", function(req, res) {
    console.log("Route for subject add recieved.");

    var subjectName = req.body.newSubject;
    User.findById(loggedInUser.id, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/error");
        }

        else {
            user.subjects.push(Subject(subjectName));
            user.subjects.forEach(function(subject) {
                subject.selected = false;
                if (subject.name === subjectName) {
                    subject.selected = true;
                    user.currentSubject = subject;
                    user.tasksToLoad = subject.tasks;
                    console.log("Subject: " + subject.urlName + " pushed and selected sucessfully.");
                }
            });
            
                user.subjects[0].tasks = []
                for(var i = 1; i < user.subjects.length; i++){
                var arr = user.subjects[i].tasks
                arr.forEach(function(task){
                    user.subjects[0].tasks.push(task)
                })
            }

            user.save(function(err, upUser) {
                if (err) {
                    console.log(err);
                    res.redirect("/error");
                }

                loggedInUser = upUser;
                console.log("User: " + user.username + " successfully updated.");
            });
        }

    });

    res.redirect("planner");
});

app.get("/delete/:clickedSub", function(req, res) {
    console.log("Route for deleting subject recieved.");

    var requestedSubject = req.params.clickedSub;

    User.findById(loggedInUser.id, function(err, user) {

        if (err) {
            console.log(err);
            res.redirect("/error");
        }

        else {

            user.subjects.forEach(function(subject) {
                console.log("Running deletion protocol on subject: " + subject.urlName);
                subject.selected = false;
                if (requestedSubject === subject.urlName) {
                    console.log("Deleted requested subject: " + requestedSubject);
                    user.subjects.splice(user.subjects.indexOf(subject), 1);
                }

            });
            
                user.subjects[0].tasks = []
                for(var i = 1; i < user.subjects.length; i++){
                var arr = user.subjects[i].tasks
                arr.forEach(function(task){
                    user.subjects[0].tasks.push(task)
                })
            }
            
            user.subjects[0].selected = true;
            user.currentSubject = user.subjects[0];
            user.tasksToLoad = user.subjects[0].tasks;

            user.save(function(err, upUser) {
                if (err) {
                    console.log(err);
                    res.redirect("/error");
                }

                loggedInUser = upUser;
                console.log("User: " + user.username + " successfully updated.");
            });


        }
    });

    res.redirect("planner");
});


// ===== TASKS =====

app.post("/taskCreate", function(req, res) {
    console.log("Route for task creation recieved.");

    var reqTask = req.body.task.taskText;

    User.findById(loggedInUser.id, function(err, user) {

        if (err) {
            console.log(err);
            res.redirect("/error");
        }

        else {
            user.subjects.forEach(function(subject) {
                subject.selected = false;
                if (subject.name === user.currentSubject.name) {
                    subject.tasks.push({text: reqTask, favorite: false});
                    subject.selected = true;
                    console.log("Task: " + reqTask + " pushed into subject: " + subject.urlName);
                }
            });
            
                user.subjects[0].tasks = []
                for(var i = 1; i < user.subjects.length; i++){
                var arr = user.subjects[i].tasks
                arr.forEach(function(task){
                    user.subjects[0].tasks.push(task)
                })
            }

            user.save(function(err, upUser) {

                if (err) {
                    console.log(err);
                    res.redirect("/error");
                }

                loggedInUser = upUser;
                console.log("User: " + user.username + " successfully updated.");

            });
        }
    });
    res.redirect("/planner");
});


app.get("/deleteTask/:index", function(req, res) {
    console.log("Route for task deletion recieved.");

    User.findById(loggedInUser.id, function(err, user) {

        if (err) {
            console.log(err);
            res.redirect("/error");
        }

        else {
            user.subjects.forEach(function(subject) {

                if (subject.name === user.currentSubject.name) {
                    subject.tasks.splice(req.params.index, 1);
                    console.log("Task: " + subject.tasks[req.params.index] + " removed from subject: " + subject.urlName);
                }
            });
            
            
                user.subjects[0].tasks = []
                for(var i = 1; i < user.subjects.length; i++){
                var arr = user.subjects[i].tasks
                arr.forEach(function(task){
                    user.subjects[0].tasks.push(task)
                })
            }
            
            user.save(function(err, upUser) {
                if (err) {
                    console.log(err);
                    res.redirect("/error");
                }

                loggedInUser = upUser;
                console.log("User: " + user.username + " successfully updated.");
                res.redirect("/planner");
            });
        }
    });

});

app.get("/favoriteTask/:index", function(req, res) {
    console.log("Route for favoriting task recieved.");
    User.findById(loggedInUser.id, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/error");
        }

        else {

            user.subjects.forEach(function(subject) {
                if (subject.name === user.currentSubject.name) {
                    subject.tasks[req.params.index].favorite = !subject.tasks[req.params.index].favorite;
                }
            });
            
                user.subjects[0].tasks = []
                for(var i = 1; i < user.subjects.length; i++){
                var arr = user.subjects[i].tasks
                arr.forEach(function(task){
                    user.subjects[0].tasks.push(task)
                })
            }
            
            user.save(function(err, upUser) {
                if (err) {
                    console.log(err);
                    res.redirect("/error");
                }

                loggedInUser = upUser;
                console.log("User: " + user.username + " successfully updated.");
                res.redirect("/planner");
            });
        }
    });
});

app.post("/editTask/:index", function(req, res) {
    console.log("Route for editing task recieved.");
    var index = req.params.index;
    User.findById(loggedInUser.id, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/error");
        }

        else {
            user.subjects.forEach(function(subject) {
                if (subject.name === user.currentSubject.name) {
                    console.log("Found subject " + subject.name);
                    subject.tasks[index].text = req.body.task.text;
                }
            });
            
            
                user.subjects[0].tasks = []
                for(var i = 1; i < user.subjects.length; i++){
                var arr = user.subjects[i].tasks
                arr.forEach(function(task){
                    user.subjects[0].tasks.push(task)
                })
            }
            
            user.save(function(err, upUser) {
                if (err) {
                    console.log(err);
                    res.redirect("/error");
                }

                loggedInUser = upUser;
                console.log("User " + loggedInUser.username + " successfully updated.");
                res.redirect("planner");
            });
        }
    });
});

// ===== OTHER =====

app.get("*", function(req, res) {
    var title = "404 Error";
    var styleLink = "";
    res.render("error", { title: title, styleLink: styleLink, loggedInUser: loggedInUser });
});

// ===== LISTENER =====

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running Server on Port " + process.env.PORT);
});

// ===== JUNK =====

//   app.post("/createTask", function(req, res){
//     console.log("Route recieved!")


//     // var reqTask = req.body.taskText;
//     // var subjectIndex;
//     //     var selSubject;
//     //     var selSubjects = []
//     // var objectToPass;

//     // User.findById(loggedInUser.id, function(err, user){
//     //     if(err){
//     //         res.redirect("/error");
//     //         console.log(err);
//     //     }

//     //     else {
//     //         objectToPass = user;
//     //         console.log(objectToPass)
//     //         objectToPass.subjects.forEach(function(subject){
//     //             if(subject.name === user.currentSubject){
//     //                 objectToPass.tasksToLoad.push(req.body.taskText)
//     //                 subject.tasks = user.tasksToLoad
//     //                 console.log(subject.tasks[1])
//     //                 console.log(objectToPass.tasksToLoad[1])
//     //             }
//     //         })

//     //         user = objectToPass;
//     //         loggedInUser = objectToPass;

//     //         user.save(function(err, user) {
//     //             if(err){
//     //                 console.log(err)
//     //                 res.redirect("/error")
//     //                 return;
//     //             }

//     //             res.redirect("/planner")
//     //             console.log(user)
//     //             console.log("==== UPUSER =====")
//     //             console.log(user)
//     //         })

//     //     }

//     // })

//     // User.findByIdAndUpdate(loggedInUser.id, objectToPass, function(err, upUser){
//     //     if(err){
//     //         console.log(err)
//     //         res.redirect("/err")
//     //     }

//     //         loggedInUser = upUser
//     //         res.redirect("/planner")
//     // })




//     //     /*User.findById(loggedInUser.id, function(err, user) {
//     //     if (err) {
//     //         console.log(err)
//     //     }

//     //     else {
//     //         user.subjects.forEach(function(subject){
//     //             if(subject.name === user.currentSubject){
//     //                 subject.tasks.push(req.body.task.taskText)
//     //             }
//     //         })

//     //               user.save(function(err, upUser) {
//     //         if (err) {
//     //             console.log(err)
//     //         }

//     //         loggedInUser = upUser
//     //     }) 
//     //     }
//     //     })

//     // */
//         // else {
//         // console.log("found user")
//         // user.subjects.forEach(function(subject){
//         //     // Check if current subject & selected subject match
//         //     if(subject.name === user.currentSubject){
//         //         // Push task into subject tasks array
//         //         user.tasksToLoad.push(reqTask)
//         //         subject.tasks = user.tasksToLoad;
//         //         console.log(subject.tasks)
//         //         user.currentSubject = subject.name;
//         //     }
//         // })


//         //     user.save(function(err, upUser) {
//         //     if (err) {
//         //         console.log(err)
//         //     }



//         //     console.log(user.subjects[1].tasks)
//         //     console.log(upUser.subjects[1].tasks)
//         //     loggedInUser = upUser

//         // })



//     // //      else {

//     // //     console.log("k")

//     // //     user.subjects.forEach(function(subject){
//     // //         subject.selected = false;
//     // //         selSubjects.push(subject);
//     // //         if(subject.name === user.currentSubject){
//     // //             console.log(subject.name)
//     // //             subject.tasks.push(reqTask);
//     // //             user.tasksToLoad = subject.tasks;
//     // //             selSubject = user.tasksToLoad;
//     // //         }
//     // //         selSubjects[selSubjects.length - 1] = subject;

//     // //     })
//     // //     console.log(selSubjects)
//     // //     console.log(selSubject)

//     // //     // user.subjects[subjectIndex].tasks.push(reqTask);
//     // //     // user.tasksToLoad = user.subjects[subjectIndex].tasks;


//     // // }

//     // // })

//     // // User.findByIdAndUpdate(
//     // //     loggedInUser.id,
//     // //     {
//     // //         subjects: selSubjects,
//     // //         tasksToLoad: selSubject
//     // //     },

//     // //     {new: true},

//     // //     function(err, upUser){
//     // //         if(err){
//     // //             res.redirect("/error")
//     // //             console.log(err)
//     // //         }

//     // //         else {
//     // //             console.log(selSubjects)
//     // //             loggedInUser = upUser
//     // //             console.log("hello")
//     // //         }
//     // //     }
//     // //     )
//     // res.redirect("planner")
// }) 

// app.post("/setSubject", function(req, res) {
//     // Capture clicked subject
//     loggedInUser.subjects.forEach(function(subject) {
//         if (subject.selected === true) {
//             var currentSubject = subject;
//         }
//     })
//     // Set current subject as captured data
//     loggedInUser.currentSubject = currentSubject;
//     // Redirect to planner
//     res.redirect("planner")
//     console.log(loggedInUser.currentSubject)
// })

// app.post("/save", function(req, res) {
//     var heyo = req.body.loggedInUser.subjects[0]
//     console.log(heyo)
// })



