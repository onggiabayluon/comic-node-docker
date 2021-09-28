var loaded = false
var $comicId = $("input[type=hidden][name=comicId]").val()
var $isLoggedIn = $("input[type=hidden][name=isLoggedIn]").val()

$('[data-toggle="tooltip"]').tooltip()
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

/**********  Get Auth Chapter List ************/
if ($isLoggedIn) {
    getAuthChapterList()
}

function getAuthChapterList() {
    $.ajax({
        type: "GET",
        url: `/fetch/comicdetail/getAuthChapterList`,
        data: {comicSlug: $comicSlug},
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            if (response.status !== 404) addUnlockClass(response)
        },
        error: function (response) {
            console.log(response)
        }
    })
    return false;
};

function addUnlockClass (chapters) {
    chapters.forEach(chapter_id => {
        $(`#chapter-${chapter_id}`).find(".chapter__text i").removeClass("fas fa-lock").addClass("far fa-unlock")
    });
}

/**********  Get Auth Chapter List ************/

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

/*************** Add Class Visited ***************/
(function addClassVisited() {

    //filter remove empty string in array
    var visited_chapters_list = JSON.parse(localStorage.getItem('visited_chapters')).filter(items => items);
    if (visited_chapters_list == null) return

    var $chapterWrapper = $('.chapter-wrapper')

    for (let i = 0; i < visited_chapters_list.length; i++) {
        $chapterWrapper.find(`#chapter-${visited_chapters_list[i]}`).addClass('visited')
    }

}());
/*************** Add Class Visited ***************/