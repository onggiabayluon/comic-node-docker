var loaded = false
var $comicId = $("input[type=hidden][name=comicId]").val()

/*************** star rating ***************/
$(function() {
    $('#rating').starrr({
        change: function(e, value){
            if (value) {
                handlingRate(value)
                $('.your-choice-was').show();
                $('.choice').text(value);
            } else $('.your-choice-was').hide();
        }
    });
});

/*************** star rating ***************/

/**********  POST handlingRate ************/
window.handlingRate = function (rateVal) {
    if (loaded) return;

    appendCloneMsg()
    toggleLoading()

    formData = {
        rateVal: rateVal,
        comicId: $comicId,
        updatedAt: new Date().toISOString()
    }
    $.ajax({
        type: "POST",
        url: `/comic/rate`,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {

            handleSuccessMsg(response)
            
            if (response.success == true) {
                $('.msg-success').removeClass('d-none')
                $('.rateCount .countNum').html((parseInt($('.rateCount .countNum').html(), 10) || 0) + 1)
                $(".rate").trigger("click");
            }
            else {
                $('.msg-fail').removeClass('d-none')
                $(".rate").trigger("click");
            }
        },
        error: function (response) {
            handleErrorMsg(response)
        }
    })
    loaded = true;
    return false;
};
/**********  POST handlingRate ************/
(function getSubsribeStatus() {
    $.ajax({
        async: true,
        type: "POST",
        url: `/fetch/getSubsbribeStatus`,
        data: JSON.stringify({comicId: $comicId}),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            let isSubscribed = (response.isSub) ? response.isSub : ""
            
            if (isSubscribed) $("#subscribe-btn").addClass("bookmark--subscribed");
            else $("#subscribe-btn").removeClass("bookmark--subscribed");
        },
        error: function (response) {
            console.log(response)
        }
    })
    return false;
}());

// $.when(getAuth(), getSubsribeStatus())
// .then();