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
            if (response.loggedIn == false) {
                console.log(response)
                return
            }
            if (response.success == true) {
                $('.msg-success').removeClass('d-none')
                $('.rateCount .countNum').html((parseInt($('.rateCount .countNum').html(), 10) || 0) + 1)
                $(".rate").trigger("click");
            }
            else {
                $('.msg-fail').removeClass('d-none')
                $(".rate").trigger("click");
            }
        }
    })
    loaded = true;
    return false;
};
/**********  POST handlingRate ************/