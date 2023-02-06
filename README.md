# defining endpoints

# 1. return all movies READ
endpoint: /movies

# 2. return movie by title READ
endpoint: /movies/:title

# 3. return movies by genre READ
endpoint: /movies/genre/:genreName

# 4. return data about a director by name READ
endpoint: /directors/:directorName

# 5. allow new user to register CREATE
endpoint: /users

# 6. allow users to update their user name UPDATE
endpoint: /users/:id/name/:name

# 7. allow users to add a movie to their list of favorites UPDATE/CREATE
endpoint: /users/:id/movies/:movieTitle

# 8. allow users to remove a movie from their list of favorites DELETE
endpoint: /users/:id/movies/:movieTitle

# 9. allow existing user to deregister DELETE
endpoint: /users/:id