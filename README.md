## Movie API

This is a node.js project built with express which contains the whole API for the myFlix Application.

## Prerequisites

- Install Node.js
- Install mongodb

## Installation

1. Clone the repository.
2. Navigate to the project directory in the terminal.
3. Run `npm install` to install the necessary dependencies.
4. Setup mongoDB database and tables

## Technologies Used

- Node.js
- Express
- Mongoose (mongoDB)

# Defining endpoints

**1. return all movies READ
endpoint:**

/movies

**2. return movie by title READ
endpoint:**

/movies/:title

**3. return genre by genre name READ
endpoint:**

/movies/genre/:genreName

**4. return data about a director by name READ
endpoint:**

/directors/:directorName

**5. allow new user to register CREATE
endpoint:**

/users

**6. allow users to update their user name UPDATE
endpoint:**

/users/:Username

**7. allow users to add a movie to their list of favorites UPDATE/CREATE
endpoint:**

/users/:Username/:MovieId

**8. allow users to remove a movie from their list of favorites DELETE
endpoint:**

/users/:Username/:MovieId

**9. allow existing user to deregister DELETE
endpoint:**

/users/:Username
