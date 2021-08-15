const path  = require('path');
const redis = require(path.resolve('./src/config/redis'))
const Comic = require('../app/models/Comic')
const { promisify } = require("util");

const handlingUpdate = async () => {
    try {

        const [keys, error1] = await getRedisKeys()
        if (error1) return { error: error1 }

        const [counts, error2] = await getRedisCounts(keys)
        if (error2) return { error: error2 }

        const [dbResult, error3] = await updateMongodb(keys, counts)
        if (error3) return { error: error3 }

        const [delResult, error4] = await delRedisKey(keys)
        if (error4) return { error: error4 }
        // const getRedisStuff = await Promise.all([keys, counts, dbUpdate])

        return { DbUpdate: dbResult, Del: delResult }
        // return { DbUpdate: dbResult }

    } catch (err) { console.log(err) }
};


const getRedisKeys = async () => {
    // log(1)
    var keys = await promisify(redis.client.keys).bind(redis.client)('*count:*');
    if (!keys || keys.length == 0) return [null, 'keys not exist in Redis']
    else return [keys, null]
};

const getRedisCounts = async (keys) => {
    // log(2)
    var batchArr = []
    for (let key of keys) { batchArr.push(['pfcount', key]) }

    var batch = redis.client.batch(batchArr);
    var counts = await promisify(batch.exec).call(batch)
    // log(counts)

    if (!counts || counts.length == 0) return [null, 'counts not exist in Redis']
    return [counts, null]
};

const updateMongodb = async (keys, counts) => {
    // Variables
    const newKeysArr = [], bulkUpdateOfComics = [], filtered = [], b = {};

    // Get comicslug and view
    keys.forEach((element, index) => {
        const [othersTxt, newKeys] = element.split(':');
        newKeysArr.push({ key: newKeys, count: counts[index] })
    });

    // Merge same comic 
    // for (var key in newKeysArr) {
    //     var oa = newKeysArr[key], ob = b[oa.key];
    //     if (!ob) filtered.push(ob = b[oa.key] = {});
    //     for (var k in oa) ob[k] = k === 'key' ? oa.key : (ob[k] || 0) + oa[k];
    // }

    // update
    let dd = new Date().getDate();

    for (const i of newKeysArr) {
        log(newKeysArr)
        bulkUpdateOfComics.push({
            updateOne: {
                "filter": { "slug": i.key },
                "update": [{ 
                    $addFields: {
                        "view.dayView.thisDay": dd,
                        "view.totalView": {
                            $cond: {
                                if: { $gt: [ "$view.totalView", null ] },
                                then: { $add: [ i.count, "$view.dayView.view" ] },
                                else: { $add: [ i.count, 0 ] }
                            }
                        },
                        "view.dayView.view": {
                            $cond: {
                                if: { $eq: [ "$view.dayView.thisDay", dd ] },
                                then: { $add: [ "$view.dayView.view", i.count ] },
                                else: 0
                            }
                        },
                    }
                }], 
                "upsert": true,
                "timestamps": false,
            }
        })
    }

    var writeResult = await Comic.bulkWrite(bulkUpdateOfComics)
    return [`Modify ${writeResult.nModified} Comics in db Successfully`, null]
};

const delRedisKey = async (keys) => {
    // log(4)
    var delResult = await promisify(redis.client.del).bind(redis.client)(keys);
    if (delResult < 1) return [null, 'keys not exist in Redis to Delete']
    else return [`Delete ${delResult} Keys in Redis Successfully`, null]
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const log = data => console.log(data)

module.exports = { handlingUpdate };