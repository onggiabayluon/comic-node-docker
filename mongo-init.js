db.createUser(
    {
        user: "ducchuy2",
        pwd: "mypassword2",
        roles: [
            {
                role: "readWrite",
                db: "mydb2"
            }
        ]
    }
);
db.createCollection("test");