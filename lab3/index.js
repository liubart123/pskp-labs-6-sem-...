const express = require("express")
const app = express();

app.use(express.json())
app.use((req,res,next)=>{
    console.log("my middleware :3");
    next();
}) 

const facultyController = require('./controllers/faculty')
const pulpitController = require('./controllers/pulpit')
const teacherController = require('./controllers/teacher')

app.use("/api/faculties",facultyController);
app.use("/api/pulpits",pulpitController);
app.use("/api/teachers",teacherController);


app.use((req,res,next)=>{
    res.sendStatus(404);
})

var server = app.listen(3000);