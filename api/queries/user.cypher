// name: login
// Attempting to login a user using their name & hashed password
MATCH (u:User {name: {name}, password: {hash}})
RETURN u as user;
