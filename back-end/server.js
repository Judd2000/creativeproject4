const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());

// connect to the database
mongoose.connect('mongodb://localhost:27017/operationopportunity', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/********************
*   Tutor Methods   *
********************/

// Create a scheme for tutors
const tutorSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: String,
    state: String,
    password: String,
    passwordRepeat: String,
    editTutors: Boolean,
    saveEdit: String,
});

// Create a model for tutors
const Tutor = mongoose.model('Tutor', tutorSchema);

// Create a tutor
app.post('/api/tutors', async (req, res) => {
    const tutor = new Tutor({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        state: req.body.state,
        password: req.body.password,
        passwordRepeat: req.body.passwordRepeat,
        editTutors: req.body.editTutors,
        saveEdit: req.body.saveEdit,
    });
    try {
        await tutor.save();
        res.send(tutor);
    } catch (error) {
        console.log(`${error} at line: ${error.lineNumber}`);
        res.sendStatus(500).send({
            message: `Error: ${error} at line: ${error.lineNumber}`
        });
    }
});

// Get a list of all tutors
app.get('/api/tutors', async (req, res) => {
    try {
        let tutors = await Tutor.find();
        res.send(tutors);
    } catch (error) {
        console.log(`${error} at line: ${error.lineNumber}`);
        res.sendStatus(500).send({
            message: `Error: ${error} at line: ${req.body.lineNumber}`
        });
    }
});

// Update tutor info
app.put('/api/tutors/:tutorID', async (req, res) => {
    try {
        let editedTutor = await Tutor.findOne({_id: req.params.tutorID});
        if (!editedTutor) {
            res.send(404);
            return;
        }
        editedTutor.name = req.body.name;
        editedTutor.email = req.body.email;
        editedTutor.age = req.body.age;
        editedTutor.state = req.body.state;
        editedTutor.editTutors = req.body.editTutors;
        editedTutor.saveEdit = req.body.saveEdit;
        await editedTutor.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(`${error} at line: ${error.lineNumber}`);
        res.sendStatus(500).send({
            message: `Error: ${error} at line: ${error.lineNumber}`
        });
    }
});

// Delete a tutor
app.delete('/api/tutors/:tutorID', async (req, res) => {
    try {
        let tutor = await Tutor.findOne({_id: req.params.tutorID});
        if (!tutor) {
            res.sendStatus(404);
            return;
        }
        await tutor.delete();
        res.sendStatus(200);
    } catch (error) {
        console.log(`${error} at line: ${error.lineNumber}`);
        res.sendStatus(500).send({
            message: `Error: ${error} at line: ${error.lineNumber}`
        });
    }
});

// Delete users under tutor
app.delete('/api/tutors/:tutorID/users', async (req, res) => {
    try {
        let tutor = await Tutor.findOne({ _id: req.params.tutorID });
        let users = await User.find({ tutor: tutor });
        if (!tutor || !users) {
            res.sendStatus(404);
            return;
        }
        for (userIt in users)
            await User.deleteOne( {_id: userIt._id} );
        res.sendStatus(200);
    } catch (error) {
        console.log(`${error} at line: ${error.lineNumber}`);
        res.sendStatus(500).send({
            message: `Error: ${error} at line: ${error.lineNumber}`
        });
    }
});

/*******************
*   User Methods   *
*******************/

// Schema for users
const userSchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tutor'
    },
    name: String,
    email: String,
    age: String,
    state: String,
    editUsers: Boolean,
    saveEdit: String,
})

// Model for users
const User = mongoose.model('User',userSchema);

// Create a user
app.post('/api/tutors/:tutorID/users', async (req, res) => {
    try {
        let tutor = await Tutor.findOne({_id: req.params.tutorID});
        if (!tutor) {
            res.sendStatus(404);
            return;
        }
        let user = new User({
            tutor: tutor,
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            state: req.body.state,
            editUsers: req.body.editUsers,
            saveEdit: req.body.saveEdit,
        });
        await user.save();
        res.send(user);
    } catch (error) {
        console.log(`${error} at line: ${error.lineNumber}`);
        res.sendStatus(500).send({
            message: `Error: ${error} at line: ${error.lineNumber}`
        });
    }
});

// Get users belonging to a tutor
app.get('/api/tutors/:tutorID/users', async (req, res) => {
    try {
        let tutor = await Tutor.findOne({_id: req.params.tutorID});
        if (!tutor) {
            res.sendStatus(404);
            return;
        }
        let users = await User.find({tutor: tutor});
        res.send(users);
    } catch (error) {
        console.log(`${error} at line: ${error.lineNumber}`);
        res.sendStatus(500).send({
            message: `Error: ${error} at line: ${error.lineNumber}`
        });
    }
});

// Update user info
app.put('/api/tutors/:tutorID/users/:userID', async (req, res) => {
    try {
        let user = await User.findOne({_id: req.params.userID, tutor: req.params.tutorID});
        if (!user) {
            res.sendStatus(404);
            return;
        }
        user.name = req.body.name;
        user.email = req.body.email;
        user.age = req.body.age;
        user.state = req.body.state;
        user.editUsers = req.body.editUsers;
        user.saveEdit = req.body.saveEdit;
        await user.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(`${error} at line: ${error.lineNumber}`);
        res.sendStatus(500).send({
            message: `Error: ${error} at line: ${error.lineNumber}`
        });
    }
});

// Delete the user
app.delete('/api/tutors/:tutorID/users/:userID', async (req, res) => {
    try {
        let user = await User.findOne({_id: req.params.userID, tutor: req.params.tutorID});
        if (!user) {
            res.sendStatus(404);
            return;
        }
        await user.delete();

        // for (userIt in users)
        //     await User.deleteOne( {_id: userIt.id} );

        res.sendStatus(200);
    } catch (error) {
        console.log(`${error} at line: ${error.lineNumber}`);
        res.sendStatus(500).send({
            message: `Error: ${error} at line: ${error.lineNumber}`
        });
    }
});

// Catch Error
app.post('/api/error/:error', async (req, res) => {
    console.log(`${req.params.error} at line: ${req.params.lineNumber}`);
    res.sendStatus(500).send({
        message: `Error: ${req.params.error} at line: ${req.params.error.lineNumber}`
    });
});

app.listen(3002, () => console.log('Server listening on port 3002!'));