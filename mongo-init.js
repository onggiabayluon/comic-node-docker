db.createUser(
    {
        user: "ducchuy",
        pwd: "mypassword",
        roles: [
            {
                role: "readWrite",
                db: "MyComic"
            }
        ]
    }
);
db.createCollection("test");