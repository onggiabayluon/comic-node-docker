addClassVisited()
function addClassVisited() {
    //filter remove empty string in array
    var visited_chapters_list = JSON.parse(localStorage.getItem('visited_chapters')).filter(items => items);
    if (visited_chapters_list == null) return

    var $cardWrapper = $('#card-wrapper')

    for (let i = 0; i < visited_chapters_list.length; i++) {
        $cardWrapper.find(`#chapter-${visited_chapters_list[i]}`).addClass('visited')
    }
}
/*************** Subscribe form  ***************/
var $comicId = $("input[type=hidden][name=comicId]").val()

window.subscribe = function (form) {
    let subscribe = ($(form).hasClass('bookmark--subscribed') || $(form).hasClass('info-sub--subscribed')) ? 'unsub' : 'sub'
    formData = {
        comicId: form.comicId.value,
        subscribeHandling: subscribe
    }

    $.ajax({
        type: "POST",
        url: '/comic/subscribe',
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            console.log(response)
            if (response.sub === true) {
                if ($(form).hasClass('bookmark')) $(form).addClass('bookmark--subscribed')
                if ($(form).hasClass('info-sub')) $(form).addClass('info-sub--subscribed')
            }
            if (response.unsub === true) {
                if ($(form).hasClass('bookmark')) $(form).removeClass('bookmark--subscribed')
                if ($(form).hasClass('info-sub')) $(form).removeClass('info-sub--subscribed')
            }
        },
        error: function (response) {
            console.log(response)
        }
    })
    return false;
};

/*************** Subscribe form  ***************/