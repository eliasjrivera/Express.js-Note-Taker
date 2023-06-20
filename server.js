// packages/imports needed for this application
const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;

const app = express();

const notes = require('./db/db.json');

// helper method for generating unique ids
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
    if (title && text && id) {
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

    // rewrites db.json and note list
    fs.writeFileSync('./db/db.json', JSON.stringify(noteList));
    res.json(noteList);
});

// port listening
app.listen(PORT, () =>
    console.log(`Server listening at http://localhost:${PORT}`)
);