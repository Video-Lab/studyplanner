// ===== CONFIG AND MODELLING =====
var createNewSubject = document.getElementById("create");
var subjectContainer = document.querySelector(".sidebar");
var newSubject = document.querySelector("#newSub");
var subjects = document.querySelectorAll(".subject");
var selectedSubject;
var isOn = false;
var main = document.querySelector(".main")
var abcdef = 0;
var hi = "yellow"
var delIcons = document.querySelectorAll(".delIcon")
var add = document.querySelector(".addTask")
var tasks = document.querySelectorAll(".task")
var taskTexts = document.querySelectorAll(".taskText")
var edit = document.querySelectorAll(".fa-font")
var taskForm = document.querySelector("#taskAdd")
var testing = document.querySelector(".testing-button")
var editForms = document.querySelectorAll(".editTask")
var editFormInputs = document.querySelectorAll("editTaskInput")
var fontClickCount = false;


// ===== FUNCTIONS ===== 
function setCurrentSubject(e) {
    var i = document.getElementById(e)
    e.selected = true;
    loggedInUser.subjects.forEach(function(subject) {
        if (subject.name !== e.textContent) {
            subject.selected = false;
        }
    })
    location.reload()
}

function colorChange(index, newColor) {
    if ($(this).css("background").indexOf(index) !== -1) {
        $(this).css("background", newColor)
    }
}


// ===== LOGIC ===== 

for (var i = 0; i < edit.length; i++) {
    edit[i].addEventListener("click", function() {
        console.log("Added listener");
        var index = this.classList[3];
        console.log(index);
        var selectedTask;
        for (var x = 0; x < tasks.length; x++) {
            // Loop through edit form inputs
            // Check if the current doenst have the class
            // Add the class to the input
            editForms[x].classList.add("hide");
            if (tasks[x].classList[1] === index) {
                selectedTask = tasks[x];
            }
        }
        // Setup the form with the index
        if (fontClickCount === false) {
            editForms[index].classList.remove("hide");
            editForms[index].children[0].value = selectedTask.children[0].textContent;
            editForms[index].children[0].focus();
        }

        else if (fontClickCount === true) {
            console.log("Add");
            for (var z = 0; z < editForms.length; z++) {
                editForms[z].classList.add("hide");
            }
        }
        fontClickCount = !fontClickCount;
    });
}

$("#create").on("click", function() {

    if (isOn === false) {

        $("#newSub").fadeIn(300, function() {
            $("#newSub").css("display", "block")
            $("#newSub").removeClass("hide")
        })
        $(".delIcon").fadeIn(300, function() {
            $(".delIcon").css("display", "inline-block")
        })
        $("#create").text("Finish")
    }

    else if (isOn === true) {
        $("#newSub").fadeOut(300, function() {
            $("#newSub").css("display", "none")
        })

        $(".delIcon").fadeOut(300, function() {
            $(".delIcon").css("display", "none")
            $("#create").text("Edit...")
        })


    }
    isOn = !isOn

});

createNewSubject.addEventListener("click", function() {
    isOn2 = !isOn2
    for (var i = 0; i < delIcons.length; i++) {
        if (isOn2 === true) {
            delIcons[i].classList.add("nonHide")
        }

        else if (isOn2 === false) {
            delIcons[i].classList.remove("nonHide")
        }
    }
})

$(".delIcon").css("display", "none")

for (var i = 0; i < subjects.length; i++) {
    if (subjects[i].name === "Math") {
        subjects[i].classList.add("selected");
        selectedSubject = subjects[i];
    }

    subjects[i].addEventListener("click", function() {
        selectedSubject = this
        for (var x = 0; x < subjects.length; x++) {
            subjects[x].classList.remove("selected")
            this.classList.add("selected")
        }

    })
}

// ===== JUNK ===== 

//  edit[0].addEventListener("click", function(){
//         var index = this.classList[3]
//         console.log(index)
// for(var x = 0; x < taskTexts.length; x++){
//     if(taskTexts[x].classList[1] === index){
//         console.log("Stage 2")
//       add.value = taskTexts[0].textContent;
//       taskForm.setAttribute("action", "/editTask/" + index)
//       add.focus()
//     }
// }
//     })    


// for(var i = 0; i < edit.length; i++){
//     edit[i].addEventListener("click", function(){
//         var index = this.classList[3]
//         console.log(index)
//         for(var x = 0; x < tasks.length; x++){
//             if(tasks[x].classList[1] === index && fontClickCount === false){
//                 fontClickCount = true;
//                 console.log("Stage 2")
//               add.value= tasks[x].children[0].textContent;
//               taskForm.setAttribute("action", "/editTask/" + index)
//               add.focus()
//             }

//             else if(tasks[x].classList[1] === index && fontClickCount === true) {
//                 add.value = ""
//                 document.body.click()
//                 taskForm.setAttribute("action", "/taskCreate")
//             }
//         }
//     })    
// }

// document.body.addEventListener("click", function(){
//     for(var i = 0; i < editForms.length; i++){
//         editForms[i].classList.add("hide")        
//     }
// })

// for(var i = 0; i < edit.length; i++){
//     edit[i].addEventListener("click", function(){
//         var index = this.classList[3]
//         console.log(index)
//         for(var x = 0; x < tasks.length; x++){
//             // if(tasks[x].classList[1] === index && fontClickCount === false){
//                 for(var y = 0; y < editForms.length; y++){
//                 editForms[y].classList.add("hide")
//                 editForms[y].children[0].textContent = ""
//                 document.body.click()
//                 }
//             console.log("Stage 2")
//             //   add.value= tasks[x].children[0].textContent;
//             //   taskForm.setAttribute("action", "/editTask/" + index)
//             //   add.focus()
//             editForms[index].classList.remove("hide")
//             editForms[index].children[0].textContent = tasks[x].children[0].textContent;
//             editForms[index].children[0].focus()
//             }

//             // else if(tasks[x].classList[1] === index && fontClickCount === true) {
//                 for(var y = 0; y < editForms.length; y++){
//                 editForms[y].classList.add("hide")
//                 editForms[y].children[0].textContent = ""
//                 document.body.click()
//                 }
//             // }
//         // }
//         fontClickCount = !fontClickCount
//     })    
// }

// $(".task").on("mouseover", function(){
//     if($(this).css("background").indexOf("rgb(250, 255, 117)") !== -1) {
//         console.log("oi")
//         $(this).css("background", "rgb(251, 255, 155)")
//     }

//     else if($(this).css("background").indexOf("rgb(238, 238, 238)") !== -1) {
//          $(this).css("background", "rgb(252, 252, 252)")
//     }

//     else if($(this).css("background").indexOf("rgb(221, 221, 221)") !== -1){
//         $(this).css("background", "rgb(237, 237, 237)")
//     }

// })

// $(".task").on("click", function(){
//     document.querySelector(".addTask").focus()
//     if($(this).attr("style") !== "background: #faff75;") {
//         var value = $(this).contents()[1].innerText
//         console.log(value)
//         $(".addTask").val(value)
//         $(".addTask").attr("action", "/editTask/" + $(this).attr("class")[6])
//         document.querySelector(".addTask").focus()
//     }
// })


// for(var i = 0; i < tasks.length; i++) {
//     edit[i].addEventListener("click", function(){
//     if(this.getAttribute("style") !== "background: #faff75;") {
//         var value = this.children[0].textContent;

//         add.value = value
//         add.focus()
//         var index = this.classList[3]
//         taskForm.setAttribute("action", "/editTask/" + index)
//     }
// })
// add.focus()
// }
// var fontIcon = document.querySelectorAll(".fa-font")

// for(var i = 0; i < fontIcon.length; i++){
//     fontIcon[i].addEventListener(click, func)
//     console.log(fontIcon[i].classList)
// }
