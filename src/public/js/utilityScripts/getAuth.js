const hotkeyright = $('#hotkeyright');
$.ajax({
    type: "GET",
    url: '/fetch/getAuth',
    // data: JSON.stringify(formData),
    // contentType: "application/json; charset=utf-8",
    success: function (response) {
        hotkeyright.append(response)
    },
    error: function (response) {
        console.log(response)
    }
})