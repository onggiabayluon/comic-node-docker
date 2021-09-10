var hotkeyright = $('#hotkeyright');
var runTenTime = 0;
(function getAuth() {
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
}());


// (function waitForUserAvatar(){
//     runTenTime++
//     if (runTenTime < 10 && typeof $userAvatarSrc !== "undefined"){
//         //variable exists, do what you want
//         console.log($userAvatarSrc)
//     }
//     else {
//         setTimeout(waitForUserAvatar, 1000);
//     }
// }());