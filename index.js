const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
const { send } = require('express/lib/response');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/movieappdb', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());

let auth = require('./auth')(app);

const passport = require('passport');
const { session } = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

/**
 * Gets all the movies
 * @name getMovies
 * @kind function
 */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Gets a movie by title
 * @name getMovie
 * @param {string} title title
 * @kind function
 */
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        if (movie) {
          res.json(movie);
        } else {
          res.status(400).send('no such movie found');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Gets a genre
 * @name getGenre
 * @param {string} genreName genreName
 * @kind function
 */
app.get(
  '/movies/genre/:genreName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
      .then((movie) => {
        if (movie) {
          res.json(movie.Genre);
        } else {
          res.status(400).send('no such genre found');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Gets a director by Name
 * @name getDirector
 * @param {string} directorName directorName
 * @kind function
 */
app.get(
  '/directors/:directorName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => {
        if (movie) {
          res.status(200).json(movie.Director);
        } else {
          res.status(400).send('no such director found');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Allow new users to register
 * @name registerUser
 * @param {string} Username username
 * @param {string} Password password
 * @param {string} Email email
 * @kind function
 */
app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed'
    ).isAlphanumeric(),
    check('Password', 'Password is required').notEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail(),
  ],
  (req, res) => {
    // check for validation errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists.');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashPassword,
            Email: req.body.Email,
            BirthDate: req.body.BirthDate,
          })
            .then((user) => {
              if (user) {
                res.status(200).json(user);
              } else {
                res.status(400).send('user not defined');
              }
            })
            .catch((err) => {
              console.error(err);
              res.status(500).send('Error: ' + err);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

/**
 * Updates a existing user
 * @name updateUser
 * @param {string} Username username
 * @param {string} Password password
 * @param {string} Email email
 * @kind function
 */
app.put(
  '/users/:Username',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed'
    ).isAlphanumeric(),
    check('Password', 'Password is required').notEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //check for validation errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashPassword,
          Email: req.body.Email,
          BirthDate: req.body.BirthDate,
        },
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
    );
  }
);

/**
 * Adds a favorite movie to a user
 * @name addFavoriteMovie
 * @param {string} Username username
 * @param {string} MovieId movieid
 * @kind function
 */
app.put(
  '/users/:Username/:MovieId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieId } },
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
  }
);

/**
 * Removes a favorite movie for a user
 * @name removeFavoriteMovie
 * @param {string} Username username
 * @param {string} MovieId movieid
 * @kind function
 */
app.delete(
  '/users/:Username/:MovieId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Deletes a user
 * @name deleteUser
 * @param {string} Username username
 * @kind function
 */
app.delete(
  '/users/:Username/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  }
);

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port: ' + port);
});
