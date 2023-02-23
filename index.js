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

// let users = [
//     {
//         name: "John Blue",
//         id: 1,
//         favoriteMovies: [],
//     },
//     {
//         name: "Kevin McNulty",
//         id: 2,
//         favoriteMovies: ["Home Alone"],
//     },
// ]

// let movies = [
//     {
//         "Title": "Home Alone",
//         "Description": "some funny family movie from the 90s",
//         "Genre": {
//             "Name": "Comedy",
//             "Description": "Comedies are movie that 90% of the time don't make you laugh, but they can be funny.",
//         },
//         "Director": "Chris Columbus",
//     },
//     {
//         "Title": "Godfather part II",
//         "Description": "It's an epic crime film from 1974, which is partially based by the novel The Godfather by Mario Puzo.",
//         "Genre": {
//             "Name": "Crime and Drama",
//             "Description": "Crime drama is a sub-genre, that focuses on crimes and etc."
//         },
//         "Director": "Francis Ford Coppola",
//     }
// ];

// let directors = [
//     {
//         "Name": "Chris Columbus",
//         "Bio": "some bio",
//         "BirthYear": 1950,
//         "DeathYear": null,
//     },
//     {
//         "Name": "Francis Ford Coppola",
//         "Bio": "some bio about coppola",
//         "BirthYear": 1940,
//         "DeathYear": null,
//     },
//     {
//         "Name": "Stanley Kubrick",
//         "Bio": "some bio about Kubrick",
//         "BirthYear": 1936,
//         "DeathYear": 2004,
//     },
// ];


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
    //const { directorName } = req.params;
    //const director = directors.find( director => director.Name === directorName);
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
    // const newUser = req.body;

    // if(!newUser.name) {
    //     const message = 'Missing name in body request.';
    //     res.status(400).send(message);
    // } else {
    //     newUser.id = uuid.v4();
    //     users.push(newUser);
    //     res.status(201).json(newUser);
    // }

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
                        BirthDate: req.body.BirtDate
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
                return res.status(500).send('Error: ' + err);
            } 

            if (!updatedUser) {
                return res.status(400).send('No such user found.')
            } 

            return res.json(updatedUser);
        }
    );
    // if (user) {
    //     user.name = name;
    //     res.status(200).json(user);
    // } else {
    //     res.status(400).send('No such user found.')
    // }
});

// 7. endpoint allow user to add a favorite movie to their list of favorites, UPDATE
app.put('/users/:favoriteMovies', (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username})

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to favorites from the user ${id}.`)
    } else {
        res.status(400).send('no such user found')
    }
});

// 8. endpoint allow user to delete a movie from their favorites list, DELETE
app.delete('/users/:id/movies/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been deleted from favorites from the user ${id}.`)
    } else {
        res.status(400).send('no such user found')
    }
});

// 9. endpoint allow existing users to deregister, DELETE
app.delete('/users/:id/', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`User ${id} has been deleted.`)
    } else {
        res.status(400).send('no such user found')
    }
});


app.listen(8080, () =>{
    console.log('listening on port 8080');
});