const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('common'));

//my favourite 10 movies
let topTenMovies = [
    {
        title: '1. Godfather part 2'
    },
    {
        title: '2. Notebook'
    },
    {
        title: '3. Harry Potter'
    },
    {
        title: '4. Lord of the Rings'
    },
    {
        title: '5. Before sunrise'
    },
    {
        title: '6. Star Wars'
    },
    {
        title: '7. It\'s a Wonderful Life'
    },
    {
        title: '8. Anastazia'
    },
    {
        title: '9. Luca'
    },
    {
        title: '10. Goodfellas'
    }
];

// the GET requests
app.get('/', (req, res) => {
    res.send('Welcome to this movie API! Here you can find my top 10 fav movies!')
});

// returns array top movies
app.get('/movies', (req, res) => {
    res.json(topTenMovies);
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops! Found an error!');
})

//listen for requests on 8080
app.listen(8080, () => {
    console.log('This app is listening on port 8080.');
});