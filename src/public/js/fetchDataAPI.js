// function
async function getData(fetchAPIUrl) {
    let data = fetch(fetchAPIUrl)
    .then(function(response) {
        //Parse to json
        return response.json();
    })
    return data
}