
/*************************** Global Var ***************************/
// Comic Info
var $isComicComment = $("input[type=hidden][name=isComicComment]").val()
var $isComicReply = $("input[type=hidden][name=isComicReply]").val()
var isComicDetailPage = ($isComicComment === "true") ? true : false
var $title = $("input[type=hidden][name=title]").val()
var $comicSlug = $("input[type=hidden][name=comicSlug]").val()
var $comicId = $("input[type=hidden][name=comicId]").val()
// Chapter Info
var $chapter = $("input[type=hidden][name=chapter]").val() || null
var $isChapterComment = $("input[type=hidden][name=isChapterComment]").val() || null
var $isChapterReply = $("input[type=hidden][name=isChapterReply]").val() || null
// Others
var formData
var $pathname = window.location.pathname;
var $search = window.location.search
var $commentBox = $('#comments-box')
var flag = 0;
// Users
var $userAvatarSrc
/*  
**   If ComicDetailPage then fetch using 
**   add route null Else add nothing 
*/
var fetchParams = (isComicDetailPage) ? '/null' : ''
/*************************** Global Var ***************************/

/*************** Fetch bottom Comments when into view OR in viewport***************/

$.fn.isVisible = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight() + 10;

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height() + 10;

    return elementBottom > viewportTop && elementTop < viewportBottom;
}
function checkStringLine (str, maxLine) {
    const line = (str.match(/\n/g) || '').length + 1
    return (line >= maxLine)
}

$(window).on('load scroll', () => {
    if ($commentBox.isVisible()) {
        if (flag == 0) {
            // do something
            flag = 1
            $.ajax({
                type: 'GET',
                url:`/fetch${$pathname}${fetchParams}/comments${$search}`,
                contentType: "application/json; charset=utf-8",
                success: function(result) {
                    $commentBox.append(result)
                    $userAvatarSrc = $commentBox.find("#my-avatar img").attr('src')

                    $('#trumbowyg-demo').trumbowyg({
                        btns: [
                            ['strong', 'em',], 
                            // ['insertImage']
                        ],
                        tagsToRemove: ['script', 'link'],
                        autogrow: true
                    })
                   
                },
                error: function(result) {
                    console.log(result)
                },
            });
        }
    }
})

/*************** Fetch bottom Comments when into view ***************/

/*************** handle fetch more comments button ***************/
window.fetchMoreComments = function (form) {
    formData = {
        page: $(form).data('page'),
        comicSlug: $comicSlug,
    }
    if (!isComicDetailPage) {
        Object.assign(formData, {
            chapter: $chapter,
            isChapterComment: $isChapterComment,
        })
    }

    $.ajax({
        type: "POST",
        url:`/fetch${$pathname}${fetchParams}/comments${$search}`,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            if (response.length !== 0) {
                $(form).data().page++
                $('.comments-replies').append(response)
            } else {
                $('#tfooter').fadeOut("slow", () => { $(this).remove();});
            }
        }
    })
    return false;
}

/*************** handle fetch more comments button ***************/



/*************** Function ***************/

window.showReplyBox = function(e) {
    $replybox = $(e).parents('.action-toolbar').siblings('.reply-box')
    $replyboxTextarea = $replybox.find(".reply-box__textarea")

    if (!$replyboxTextarea.data("create")) {
        $replybox.show()
        $replyboxTextarea.data("create", true)
        $replyboxTextarea.trumbowyg({
            btns: [
                ['strong', 'em',], 
                // ['insertImage']
            ],
            tagsToRemove: ['script', 'link'],
            autogrow: true
        })
    } else {
        $replybox.toggle()
    }
    
}

window.emptyEditor = function(e) {
    $replybox = $(e).parent(".reply-box__wrapper").closest(".reply-box").toggle()
    $trumbowygEditor = $(e).parent(".reply-box__wrapper, .submit-box__wrapper").siblings('.trumbowyg-box').find(".trumbowyg-textarea")
    // Empty Trumbowyg Editor
    $trumbowygEditor.blur(); 
    $trumbowygEditor.trumbowyg('empty')
}

window.editableContent = function (e) {

    $context = $(e).parents(".item__menu").prev(".item__body").children(".context")
    $context__text = $context.find(".context__text")
    $context__expand = $context.find(".context__expand")
    $context__wrapper = $context.find(".context__wrapper")

    $context__expand.trigger('click');
    $context__wrapper.show()
    $context__text.attr('contenteditable','true').focus()
    return false
};

window.closeEditable = function(e) {
    $context = $(e).closest(".context")
    $context__text = $context.find(".context__text")
    $context__wrapper = $context.find(".context__wrapper")

    $context__wrapper.hide()
    $context__text.attr('contenteditable','false').blur(); 
};
window.focusOutAfterSubmit = function(e) {
    $form = $(e)
    $textarea = $form.find("textarea")
    $replybox = $form.closest(".reply-box")

    $replybox.toggle()
    $textarea.blur()
    $textarea.trumbowyg('empty')
};

/*************** Function ***************/



/*************** Form ***************/

// UTILITY FUNCTION TO GET JSON FROM JQUERY SERIALIZE 
$.fn.serializeToJson = function (extraData) {
   
    /**
     * Get form key and value
     * Remove form.text value from textarea cuz its value contain
     * tag that cannot send to server
    */
    var unindexed_array = this.serializeArray()
    // .filter((a) => a.name !== 'text');

    // convert unindexed_array to my custom object format 
    // { name: "title", value: "hehehhe"} => { title: "hehehhe"}
    function formatObj(formArray) {
        var returnArray = {};
        for (var i = 0; i < formArray.length; i++){
            returnArray[formArray[i]['name']] = formArray[i]['value'];
        }
        return returnArray;
    }

    return {...formatObj(unindexed_array), ...extraData}
}

function getTruncatedPart(element) {
    var btnExpand = $(element)
    var p = $(element).siblings(".context__text");
    var isShowing = (p.hasClass("dynamic-ellipsis")) ? true : false

    if (isShowing) {
        // If is showing then turn into no show
        btnExpand.html("Read Less").css("text-decoration", "underline")
        p.removeClass("dynamic-ellipsis").toggleClass("context__text--transition")
    } else {
        // If now show then turn into showing
        btnExpand.html("Read More").css("text-decoration", "unset")
        p.addClass("dynamic-ellipsis").toggleClass("context__text--transition")
    }
}

//  Start POST comment
window.postComment = function (form) {
    let textareaValue = form.querySelector('.trumbowyg-editor').innerText
    form.text.value = textareaValue

    if (textareaValue.length <= 1) {
        alert("type more than 1 character")
        return false
    }

    appendCloneMsg()
    toggleLoading()
    
    formData = {
        "title": $title,
        "comicSlug": $comicSlug,
        "isComicDetailPage": true,
    }
    if (!isComicDetailPage) {
        Object.assign(formData, {
            chapter: $chapter,
            isComicDetailPage: false,
        })
    }

    if (isComicDetailPage) formData = $(form).serializeToJson(formData)
    else formData = $(form).serializeToJson(formData)

    $.ajax({
        type: "POST",
        url: `/comic/comment`,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            focusOutAfterSubmit(form)
            handleSuccessMsg(response)
            socket.emit('new_comment', response)
        },
        error: function (response) {
            focusOutAfterSubmit(form)
            handleErrorMsg(response)
        }
    })
    return false;
}; 

//  Start POST reply
window.postReply = function (form) {
    let textareaValue = form.querySelector('.trumbowyg-editor').innerText
    form.text.value = textareaValue

    if (textareaValue.length <= 1) {
        alert("type more than 1 character")
        return false
    }

    appendCloneMsg()
    toggleLoading()

    formData = {
        "text": textareaValue,
        "title": $title,
        "comicSlug": $comicSlug,
        "isComicDetailPage": true,
    }
    if (!isComicDetailPage) {
        Object.assign(formData, {
            chapter: $chapter,
            isComicDetailPage: false,
        })
    }

    if (isComicDetailPage) formData = $(form).serializeToJson(formData)
    else formData = $(form).serializeToJson(formData)

    $.ajax({
        type: "POST",
        url: `/comic/reply`,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            focusOutAfterSubmit(form)
            handleSuccessMsg(response)
            socket.emit('new_reply', {html: response, comment_id: formData.comment_id}) 
        },
        error: function (response) {
            focusOutAfterSubmit(form)
            handleErrorMsg(response)
        }
    })
    return false;
}; 

//  Start destroy comment 
window.destroyComment = function (form) {

    formData = {
        "comicSlug": $comicSlug,
        "isComicDetailPage": true,
    }
    if (!isComicDetailPage) {
        Object.assign(formData, {
            chapter: $chapter,
            isComicDetailPage: false,
        })
    }

    if (isComicDetailPage) formData = $(form).serializeToJson(formData)
    else formData = $(form).serializeToJson(formData)

    if (confirm("Delete this Comment ? ?")) {
        appendCloneMsg()
        toggleLoading()
        $.ajax({
            type: "POST",
            url: `/comic/comment/destroyComment?_method=DELETE`,
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                handleSuccessMsg(response)
                socket.emit('delete_comment', formData)
            },
            error: function (response) {
                handleErrorMsg(response)
            }
        })
    }
    return false;
}; 

//  Start destroy reply 
window.destroyReply = function (form) {
    
    formData = {
        comicSlug: $comicSlug,
        isComicDetailPage: true,
    }
    if (!isComicDetailPage) {
        Object.assign(formData, {
            chapter: $chapter,
            isComicDetailPage: false,
        })
    }

    if (isComicDetailPage) formData = $(form).serializeToJson(formData)
    else formData = $(form).serializeToJson(formData)

    
    if (confirm("Delete this Reply ?")) {
        appendCloneMsg()
        toggleLoading()
        $.ajax({
            type: "POST",
            url: `/comic/comment/destroyReply?_method=DELETE`,
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                handleSuccessMsg(response)
                socket.emit('delete_reply', formData)
            },
            error: function (response) {
                handleErrorMsg(response)
            }
        })
    }
    return false;
}; 

// Start edit Comment 
window.editComment = function (form) {
    
    let textareaValue = form.querySelector('.context__text').innerText
    form.text.value = textareaValue

    if (textareaValue.length <= 1) {
        alert("type more than 1 character")
        return false
    }

    appendCloneMsg()
    toggleLoading()
    formData = {
        comment_id: form.comment_id.value,
        title: $title,
        comicSlug: $comicSlug,
        isComicDetailPage: true,
        isComment: true,
    }
    if (!isComicDetailPage) {
        Object.assign(formData, {
            isComicDetailPage: false,
        })
    }

    if (isComicDetailPage) formData = $(form).serializeToJson(formData)
    else formData = $(form).serializeToJson(formData)
    
    $.ajax({
        type: "POST",
        url: '/comic/comment/edit?_method=PUT',
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            handleSuccessMsg(response)
            closeEditable(form)
            socket.emit('edited_comment', response)
        },
        error: function (response) {
            handleErrorMsg(response)
        }
    })
    return false;
};
// Start edit reply
window.editReply = function (form) {
    let textareaValue = form.querySelector('.context__text').innerText
    form.text.value = textareaValue

    if (textareaValue.length <= 1) {
        alert("type more than 1 character")
        return false
    }

    appendCloneMsg()
    toggleLoading()

    formData = {
        comment_id: form.comment_id.value,
        reply_id: form.reply_id.value,
        text: form.text.value,
        title: $title,
        comicSlug: $comicSlug,
        isComicDetailPage: true,
        isReply: true,
    }
    if (!isComicDetailPage) {
        Object.assign(formData, {
            chapter: $chapter,
            isComicDetailPage: false,
        })
    }
    
    $.ajax({
        type: "POST",
        url: '/comic/comment/edit?_method=PUT',
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            handleSuccessMsg(response)
            closeEditable(form)
            socket.emit('edited_reply', response)
        },
        error: function (response) {
            handleErrorMsg(response)
        }
    })
    return false;
};
/***************  Form ***************/



/*************** Socket IO ***************/
var socket = io()
socket.emit('join', $comicSlug);

socket.on('new_comment', response => {
    $('.comments-replies').prepend(response)
    $('.comments-replies > :nth-child(1)').css('display','block').hide().show("slow")
});

socket.on('new_reply', response => {
    $(`#comments-replies-${response.comment_id}`).append(response.html)
    $(`#comments-replies-${response.comment_id} > :last-child`).css('display','block').hide().show("slow")
});

socket.on('delete_comment', formData => {
    $(`#comments-replies-${formData.comment_id}`).css('display','block').slideUp("slow", function() { $(this).remove();});
})

socket.on('delete_reply', formData => {
    $(`#reply-${formData.reply_id}`).css('display','block').slideUp("slow", function() { $(this).remove();});
})

socket.on('edited_comment', formData => {
    const $thiscommentsReplies = $(`#comments-replies-${formData.comment_id}`)
    const $context__text = $thiscommentsReplies.find('.context__text')
    const $context__expand = $thiscommentsReplies.find('.context__expand')

    if (!checkStringLine(formData.text)) {
        $thiscommentsReplies.find('.context__text').addClass("dynamic-ellipsis")
        $context__text.css('--ellipsis-value', 4)
        $context__expand.removeClass("d-none")
    }
    $context__text.html(formData.text)
})
socket.on('edited_reply', formData => {
    const $thiscommentsReplies = $(`#reply-${formData.reply_id}`)
    const $context__text = $thiscommentsReplies.find('.context__text')
    const $context__expand = $thiscommentsReplies.find('.context__expand')

    if (!checkStringLine(formData.text)) {
        $thiscommentsReplies.find('.context__text').addClass("dynamic-ellipsis")
        $context__text.css('--ellipsis-value', 4)
        $context__expand.removeClass("d-none")
    }
    
    $context__text.html(formData.text)
})
/*************** Socket IO ***************/