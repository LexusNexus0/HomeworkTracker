const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Get the current date
const currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth() + 1;
let currentDay = currentDate.getDate();
let maximumYear = currentYear + 10;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({
    extended: true
}));

const db = "mongodb+srv://Someone:asd452@cluster0.w5v874y.mongodb.net/?retryWrites=true&w=majority";

// Connect to the MongoDB database
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('MongoDB Connected');
    })
    .catch(err => {
        console.log(err);
        console.log('MongoDB Not Connected');
    });

// Create a database schema for the tasks
var taskSchema = new mongoose.Schema({
    subject: String,
    taskName: String,
    dueYear: Number,
    dueMonth: Number,
    dueDay: Number,
    description: String,
    completed: Boolean,
    dueDate: String
});

// Create a database schema for the subjects
var subjectSchema = new mongoose.Schema({
    subject: String
});

// Create a model for the task
var Task = mongoose.model("Task", taskSchema);

// Create a model for the subjects
var Subject = mongoose.model("Subject", subjectSchema);

// The home page route
app.get('/', (req, res) => {
    // Retrieve all incomplete tasks from the database
    Task.find({
        completed: false
    })
    .then((result1) => {
        console.log("All incomplete tasks retrieved from database");
        // Retrieve all completed tasks from the database
        Task.find({
            completed: true
        })
        .then((result2) => {
            console.log("All completed tasks retrieved from database");
            
            var overdueList = [];
            var notOverdueList = [];
            console.log("Current date from db: " + currentDate);
  
            result1.forEach(element => {
                var leDate = element.dueYear.toString() + element.dueMonth.toString() + element.dueDay.toString();
                console.log("String thing: " + leDate);
                var leDateNum = Int.parseInt(leDate);
                console.log("Int thing: " + leDateNum);
                
                /*
                const test = new Date(element.dueDate);
                console.log("Reformatted date: " + test);

                if(test < currentDate) {
                    overdueList.push = element;
                    console.log(element.taskName + " added to overdue");
                    console.log(element.dueDate);
                    console.log(test);
                } else {
                    notOverdueList.push = element;
                    console.log(element.taskName + " added to not overdue");
                    console.log(element.dueDate);
                    console.log(test);
                } 
                */
            }); 

            // Render the home page and pass through list of tasks from result
            res.render('index', {
                IncompleteTaskList: result1,
                CompletedTaskList: result2,
                currentDate: currentDate
            });
        })
        .catch((err) => {
            console.log("No tasks were retrieved from database.");
        })
    })
    .catch((err) => {
        console.log("No tasks were retrieved from database.");
    })
});

// Display selected task details
app.get('/task/:id', (req, res) => {
    var id = req.params.id;

    // Retrieve task from the database with matching ID
    Task.findById(id)
    .then((result) => {
        console.log(`The task ${result.taskName} was retrieved from the database`);
        // Render the task page and pass through the task details from result
        res.render('task', {
            taskName: result.taskName,
            subject: result.subject,
            dueDay: result.dueDay,
            dueMonth: result.dueMonth,
            dueYear: result.dueYear,
            description: result.description,
            completed: result.completed,
            dueDate: result.dueDate,
            id: result.id
        });
    })
    .catch((err) => {
        console.log('Task could not be retrieved from database.')
    })
});

// Show the 'add task' form
app.get('/add', (req, res) => {
    // Retrieve all subjects from database
    Subject.find({})
    .then((result) => {
        // Render the "add" and pass through list of subjects from result and the current date
        res.render('add', {
            subjectsList: result,
            currentDay, currentMonth, currentYear, maximumYear
        });
    })
});

// Add task data to the database
app.post('/add', (req, res) => {
    var data = req.body;
    console.log(data);

    oldDate = data.dueDate;
    var year = oldDate.substring(0, 4);
    var month = oldDate.substring(5, 7);
    var day = oldDate.substring(8,10);
    var newDate = day + "/" + month + "/" + year;

    Task.create({
        taskName: data.taskName,
        subject: data.subject,
        dueDay: day,
        dueMonth: month,
        dueYear: year,
        description: data.description,
        dueDate: newDate,
        completed: false
    })
    .then((result) => {
        console.log("Task data added to the database");
        // Redirect user to the home page
        res.redirect('/');
    })
    .catch((err) => {
        console.log("Task data could not be added to database.");
        res.render('add', {});
    })
});

// Display all the subject the user can search by
app.get('/subjects', (req, res) => {
    // Retrieve all subjects from database
    Subject.find({})
    .then((result) => {
        console.log("All subjects retrieved from database");
        res.render('subjects', {
            subjectsList: result
        });
    })
    .catch((err) => {
        console.log("No subjects were retrieved from database.");
    })
});

// Display selected subject's tasks
app.get('/subjectSearch/:id', (req, res) => {
    var id = req.params.id;
    var selectedSubject = '';

    // Identify the subject
    Subject.findById(id)
    .then((result) => {
        selectedSubject = result.subject;
        console.log(`The selected subject is ${selectedSubject}`);
        // Retrieve all tasks from that subject
        Task.find({
            subject: String(selectedSubject) // Not working
        })
        .then((result) => {
            console.log("All tasks within the selected subject retrieved");
            // Render the page and pass through list of tasks from result
            res.render('subjectSearch', {
                tasksList: result,
                selectedSubject: selectedSubject
            });
        })
        .catch((err) => {
            console.log("No tasks were retrieved from database.");
        })
    })
    .catch((err) => {
        console.log("Could not identify the selected subject");
    })
});

// Show the 'add subject' form
app.get('/addSubject', (req, res) => {
    res.render('addSubject');
});

app.post('/addSubject', (req, res) => {
    var data = req.body;
    console.log(data);
    Subject.create({
        subject: data.subject
    })
    .then((result) => {
        console.log("Subject data added to the database");
        // Redirect user to the 'subjects' page
        res.redirect('/subjects');
    })
    .catch((err) => {
        console.log("Subject data could not be added to database.");
        res.render('addSubject', {});
    })
});

// Show the 'remove subject' form with the subjects
app.get('/removeSubject', (req, res) => {
    Subject.find({})
    .then((result) => {
        // Render the "removeSubject" and pass through list of subjects from result
        res.render('removeSubject', {
            subjectsList: result
        });
    })
    .catch((err) => {
        console.log("No subjects were retrieved from the database")
    })
});

// Remove the subject from the database
app.post('/removeSubject', (req, res) => {
    var data = req.body;
    Subject.deleteOne({
        subject: data.subject
    })
    .then((result) => {
        console.log("Subject data removed to the database");
        // Redirect user to the 'subjects' page
        res.redirect('/subjects');
    })
    .catch((err) => {
        console.log("Subject data could not be removed to database.");
        res.render('removeSubject', {});
    })
});

// When button is clicked change "completed" to true or false then redirect users back to the page
app.get('/taskComplete/:id', (req, res) => {
    var id = req.params.id;

    // Find whether the task has been completed or not
    Task.findById(id)
    .then((result) => {
        if (result.completed == true) {
            // If the task has been completed before set it to false
            Task.findByIdAndUpdate(id, {completed: false})
            .then((result) => {
                console.log("Task successfully updated to false");
                res.redirect('/');
            })
            .catch((err) => {
                console.log("Task failed to update");
                res.redirect('/');
            })
        }
        else if (result.completed == false) {
            // If the task hasn't been completed before set it to true
            Task.findByIdAndUpdate(id, {completed: true})
            .then((result) => {
                console.log("Task successfully updated to true");
                res.redirect('/')
            })
            .catch((err) => {
                console.log("Task failed to update");
                res.redirect('/');
            })
        }
    })
});

// Taken out because there is an error and I can't figure out why
// When the button is clicked remove that task
app.get('/removeTask/:id', (req, res) => {
    var id = req.params.id;
    console.log(id);
    
    // Delete task with the id
    Task.findByIdAndDelete(id)
    .then((result) => {
        console.log(result);
        console.log("Task successfully deleted");
        res.redirect('/');
    })
    .catch((err) => {
        console.log("Task failed to be deleted");
        res.redirect('/');
    })
});

app.listen(3000, () => console.log('Server started'));