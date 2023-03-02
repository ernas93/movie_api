const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
const { send } = require('express/lib/response');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/movieappdb', {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

app.use(bodyParser.json());

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');


// 1. endpoint return all movies; READ
app.get('/movies', (req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 2. endpoint return movie by title; READ
app.get('/movies/:title', (req, res) => {
    Movies.findOne({ Title: req.params.title})
    .then((movie) => {
        if (movie) {
            res.json(movie);
        } else {
            res.status(400).send('no such movie found')
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 3. endpoint get genre by genre name; READ
app.get('/movies/genre/:genreName', (req, res) => {
    Movies.findOne({'Genre.Name': req.params.genreName})
    .then((movie) => {
        if (movie) {
            res.json(movie.Genre)
        } else {
            res.status(400).send('no such genre found')
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
});

// 4. endpoint director; READ
app.get('/directors/:directorName', (req, res) => {
    Movies.findOne({'Director.Name': req.params.directorName})
    .then((movie) => {
        if (movie) {
            res.status(200).json(movie.Director);
        } else {
            res.status(400).send('no such director found')
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
});

// 5. endpoint add new user, CREATE
app.post('/users', (req, res) => {
    Users.findOne({Username: req.body.Username})
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists.');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        BirthDate: req.body.BirthDate
                    })
                    .then((user) => {
                        if (user) {
                            res.status(200).json(user)
                        } else {
                            res.status(400).send('user not defined')
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(500).send('Error: ' + err);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        })
});

// 6. endpoint update users name, UPDATE
app.put('/users/:Username', (req, res) => {
    if (!req.body.Username) {
        res.status(400).send('Error: missing body params');
    }
    
    Users.findOneAndUpdate({ Username: req.params.Username }, 
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                BirthDate: req.body.BirthDate
            }
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else if (!updatedUser) {
                res.status(400).send(req.params.Username + ' was not found.');
            } else {
                res.json(updatedUser);
            }
        }
    )
});

// 7. endpoint allow user to add a favorite movie to their list of favorites, UPDATE
// UPDATE LATER
app.put('/users/:Username/:MovieId', (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username }, 
        { $push: { FavoriteMovies: req.params.MovieId }},
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else if (!updatedUser) {
                res.status(400).send(req.params.Username + ' was not found.');
            } else {
                res.json(updatedUser);
            }
        }
    );
});

// 8. endpoint allow user to delete a movie from their favorites list, DELETE
app.delete('/users/:Username/:MovieId', (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieId } },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else if (!updatedUser) {
                res.status(400).send(req.params.Username + ' was not found.');
            } else {
                res.json(updatedUser)
            }
        }
        )
});

// 9. endpoint allow existing users to deregister, DELETE
app.delete('/users/:Username/', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found.');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


app.listen(8080, () =>{
    console.log('listening on port 8080');
});