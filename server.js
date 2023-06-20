// packages/imports needed for this application
const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;

const app = express();

const notes = require('./db/db.json');

// Helper method for generating unique ids
const uuid = require('./helpers/uuid');


// middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET route for homepage
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET route for notes html
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

//GET route to read/return the db.json file 
app.get("/api/notes", (req, res) => {
    res.sendFile(path.join(__dirname, '/db/db.json'));
});

// POST request to add a note
app.post('/api/notes', (req, res) => {
    // log that a POST request was received
    console.info(`${req.method} request received to add a note`);

    // destructuring assignment for the items in req.body
    const { title, text, id } = req.body;

    // if all the required properties are present
    if (title && text) {
        // variable for the object we will save
        const newReview = {
            title,
            text,
            id: uuid(),
        };

        // obtain existing reviews
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                // convert string into JSON object
                const parsedReviews = JSON.parse(data);

                // add a new review
                parsedReviews.push(newReview);

            // write updated reviews back to the file
            fs.writeFile(
                    './db/db.json',
                    JSON.stringify(parsedReviews, null, 4),
                    (writeErr) =>
                        writeErr
                            ? console.error(writeErr)
                            : console.info('Successfully updated reviews!')
                );
            }
        });

        const response = {
            status: 'success',
            body: newReview,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting review');
        }
    });


// note delete
app.delete('/api/notes/:id', (req, res) => {
    // parse out list of notes from db.json
    let noteList = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'));
    // an object containing properties mapped to the named route parameters
    // in this case the id of the notes made, available as a string
    let noteId = (req.params.id).toString();

    // returns ids that do no match as a new array, and deletes the ids that match
    // != operator checks whether its two operands are not equal
    noteList = noteList.filter(selected => {
        return selected.id != noteId;
    });

    // updates db.json and note list
    fs.writeFileSync("./db/db.json", JSON.stringify(noteList));
    res.json(noteList);
});

// port listening
app.listen(PORT, () =>
    console.log(`Server listening at http://localhost:${PORT}`)
);



//-----------------TODO---------------
// WHEN I click on the link to the notes page
// THEN I am presented with a page with existing notes listed in the left-hand column, plus empty fields to enter a new note title and the note’s text in the right-hand column

// WHEN I enter a new note title and the note’s text
// THEN a Save icon appears in the navigation at the top of the page

// WHEN I click on the Save icon
// THEN the new note I have entered is saved and appears in the left-hand column with the other existing notes

// WHEN I click on an existing note in the list in the left-hand column
// THEN that note appears in the right-hand column

// WHEN I click on the Write icon in the navigation at the top of the page
// THEN I am presented with empty fields to enter a new note title and the note’s text in the right-hand column