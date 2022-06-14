#! /bin/bash
colls=( comics chapters categories comments users rates configs )

username=ducchuy
password=mypassword
dbname=mydb

for c in ${colls[@]}
do
    mongoimport --host mongo -u ${username} -p ${password} --authenticationDatabase admin --db ${dbname} --collection $c --type json --file /mongo-seed/$c.json --jsonArray
done
