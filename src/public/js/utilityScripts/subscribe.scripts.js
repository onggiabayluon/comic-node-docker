window.subscribe = function (form) {
    appendCloneMsg()
    toggleLoading()
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

            handleSuccessMsg(response)

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

            handleErrorMsg(response)

        }
    })
    return false;
};