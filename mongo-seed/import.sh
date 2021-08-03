#! /bin/bash
colls=( comics chapters categories comments users )

for c in ${colls[@]}
do
    mongoimport --host mongo -u "ducchuy" -p "mypassword" --authenticationDatabase admin --db mydb --collection $c --type json --file /mongo-seed/$c.json --jsonArray
done
