/*************** Global Var ***************/
var $isComicComment = $("input[type=hidden][name=isComicComment]").val()
var $isComicReply = $("input[type=hidden][name=isComicReply]").val()
var $isChapterComment = $("input[type=hidden][name=isChapterComment]").val()
var $isChapterReply = $("input[type=hidden][name=isChapterReply]").val()
var isComicDetailPage = ($isComicComment === "true") ? true : false
// If ComicDetailPage then null Else Nothing
var fetchParams = (isComicDetailPage) ? '/null' : ''
/*************** Global Var ***************/

/*************** Fetch bottom Comments when into view ***************/
var $pathname = window.location.pathname;
var $search = window.location.search

var $commentBox = $('#commentbox')
var flag = 0;
$.fn.isVisible = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
}

$(window).scroll(function () {
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
                },
                error: function(result) {
                    console.log(result)
                },
            });
        }
    }
})
/*************** Fetch bottom Comments when into view ***************/


/*************** Function ***************/
window.showInput = function (e) {
    $thisbtnbox = $(e).parents('.form-group').siblings('#buttonbox')
    $thisbtnbox.addClass('buttonbox--flex');
};

window.resetInput = function (e) {
    $thisbtnbox = $(e).parents('.buttonbox')
    $thisbtnbox.removeClass('buttonbox--flex');
    $(e).parents('form').trigger("reset");
};

window.hideReplydialog = function (e) {
    $thisreplydialog = $(e).parents('.replydialog')
    $thisreplydialog.toggleClass('d-none');
};

window.showReplyBox = function (e) {
    $thisreplybox = $(e).parents('.toolbar').siblings('#replydialog')
    $thisreplybox.toggleClass('d-none');
};

window.expander = function (e) {
    $thisExpander = $(e)
    var $thisExpanderReplies = $(e).parents('.comment').siblings('.expander__content')
    var $thisLessRepliesbtn = $(e).children('.expander__less')
    var $thisMoreRepliesbtn = $(e).children('.expander__more')

    if ($thisExpander.attr("data-expander") == 'hide') {
        $thisExpander.attr("data-expander", "show")

        $thisExpanderReplies.addClass('expander__content--show')
        $thisLessRepliesbtn.toggleClass('d-none')
        $thisMoreRepliesbtn.toggleClass('d-none')
        return
    }
    if ($thisExpander.attr("data-expander") == 'show') {
        $thisExpander.attr("data-expander", "hide")

        $thisExpanderReplies.removeClass('expander__content--show')
        $thisLessRepliesbtn.toggleClass('d-none')
        $thisMoreRepliesbtn.toggleClass('d-none')
        return
    }
};

window.editableContent = function (e) {
    $thisContentBox = $(e).parents('action-menu-renderer').siblings('.content')
    $thisContentBox.siblings('.header').hide()
    $thisContentBox.siblings('.toolbar').hide()
    $thisContentBox.find('.content__text').val("1").trigger('change');
    $thisContentBox.children('.content__text').attr('contenteditable','true');
    $thisContentBox.find('.buttonbox').toggleClass('buttonbox--flex')
};

window.normalState = function (e) {
    
    $thisContentBox = $(e).parents('comment')
    $thisContentBox.siblings('.header').show()
    $thisContentBox.siblings('.toolbar').show()
    $thisContentBox.children('.content__text').trigger("reset");
    $thisContentBox.children('.content__text').attr('contenteditable','false');
    $thisContentBox.find('.buttonbox').toggleClass('buttonbox--flex')
};

/*************** Function ***************/



/*************** Form ***************/
var $user_id = $("input[type=hidden][name=user_id]").val()
var $username = $("input[type=hidden][name=username]").val()
var $title = $("input[type=hidden][name=title]").val()
var $comicSlug = $("input[type=hidden][name=comicSlug]").val()
var $chapter = $("input[type=hidden][name=chapter]").val()
var $comicId = $("input[type=hidden][name=comicId]").val()
var formData
var loaded = false;




//  Start POST comment
window.postComment = function (form) {
    if (isComicDetailPage) {
        formData = {
            text: form.text.value,
            title: $title,
            userId: $user_id,
            userName: $username,
            comicSlug: $comicSlug,
            isComicComment: $isComicComment,
            updatedAt: new Date().toISOString()
        }
    } else {
        formData = {
            text: form.text.value,
            title: $title,
            userId: $user_id,
            userName: $username,
            comicSlug: $comicSlug,
            chapter: $chapter,
            isChapterComment: $isChapterComment,
            updatedAt: new Date().toISOString()
        }
    }
    
    $.ajax({
        type: "POST",
        url: `/comic/comment`,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            socket.emit('new_comment', response)
        },
        error: function (response) {
            console.log(response)
        }
    })
    return false;
}; 

//  Start destroy comment 
window.destroyComment = function (form) {
    if (isComicDetailPage) {
        formData = {
            comment_id: form.comment_id.value,
            comicSlug: $comicSlug,
        }
    } else {
        formData = {
            comment_id: form.comment_id.value,
            comicSlug: $comicSlug,
            chapter: $chapter,
            isChapterComment: $isChapterComment,
        }
    }
    
    if (confirm("Delete this Comment ? ?")) {
        $.ajax({
            type: "POST",
            url: `/comic/comment/destroyComment?_method=DELETE`,
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response?.error) return
                else socket.emit('delete_comment', formData)
            }
        })
    }
    return false;
}; 

//  Start POST reply
window.postReply = function (form) {
    if (isComicDetailPage) {
        formData = {
            comment_id: form.comment_id.value,
            text: form.text.value,
            title: $title,
            userId: $user_id,
            userName: $username,
            comicSlug: $comicSlug,
            updatedAt:  new Date().toISOString()
        }
    } else {
        formData = {
            comment_id: form.comment_id.value,
            isChapterReply: $isChapterReply,
            text: form.text.value,
            title: $title,
            userId: $user_id,
            userName: $username,
            comicSlug: $comicSlug,
            chapter: $chapter,
            updatedAt:  new Date().toISOString()
        }
    }
    
    $.ajax({
        type: "POST",
        url: `/comic/reply`,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            hideReplydialog(form)
            socket.emit('new_reply', response) 
        },
        error: function (response) {
            console.log(response)
        }
    })
    return false;
}; 

//  Start destroy reply 
window.destroyReply = function (form) {
    if (isComicDetailPage) {
        formData = {
            reply_id: form.reply_id.value,
            comment_id: form.comment_id.value,
            comicSlug: $comicSlug,
        }
    } else {
        formData = {
            reply_id: form.reply_id.value,
            comment_id: form.comment_id.value,
            comicSlug: $comicSlug,
            chapter: $chapter,
            isChapterReply: $isChapterReply,
        }
    }
    
    if (confirm("Delete this Reply ?")) {
        $.ajax({
            type: "POST",
            url: `/comic/comment/destroyReply?_method=DELETE`,
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response?.error) return
                else socket.emit('delete_reply', formData)
            }
        })
    }
    return false;
}; 

// Start edit Comment 
window.editCommentForm = function (form) {
    $thisVal = $(form).parent().find('.content__text').html()
    form.text.value = $thisVal

    if (isComicDetailPage) {
        formData = {
            comment_id: form.comment_id.value,
            text: form.text.value,
            title: $title,
            userId: $user_id,
            userName: $username,
            comicSlug: $comicSlug,
            updatedAt: new Date().toISOString(),
            isComicComment: $isComicComment,
        }
    } else {
        formData = {
            comment_id: form.comment_id.value,
            text: form.text.value,
            title: $title,
            userId: $user_id,
            userName: $username,
            comicSlug: $comicSlug,
            chapter: $chapter,
            updatedAt: new Date().toISOString(),
            isChapterComment: $isChapterComment,
        }
    }
    
    
    $.ajax({
        type: "POST",
        url: '/comic/comment/edit?_method=PUT',
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            normalState(form)
            socket.emit('edited_comment', response)
        }
    })
    return false;
};
// Start edit reply
window.editReplyForm = function (form) {
    $thisVal = $(form).parent().find('.content__text').html()
    form.text.value = $thisVal
    
    if (isComicDetailPage) {
        formData = {
            comment_id: form.comment_id.value,
            reply_id: form.reply_id.value,
            text: form.text.value,
            title: $title,
            userId: $user_id,
            userName: $username,
            comicSlug: $comicSlug,
            updatedAt: new Date().toISOString(),
            isComicReply: $isComicReply,
        }
    } else {
        formData = {
            comment_id: form.comment_id.value,
            reply_id: form.reply_id.value,
            text: form.text.value,
            title: $title,
            userId: $user_id,
            userName: $username,
            comicSlug: $comicSlug,
            chapter: $chapter,
            updatedAt: new Date().toISOString(),
            isChapterReply: $isChapterReply,
        }
    }
    
    
    $.ajax({
        type: "POST",
        url: '/comic/comment/edit?_method=PUT',
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            normalState(form)
            socket.emit('edited_reply', response)
        }
    })
    return false;
};
/***************  Form ***************/



/*************** Socket IO ***************/
var socket = io()
socket.emit('join', $comicSlug);

socket.on('new_comment', response => {
    $('#commentcontainer').prepend(response)
    $('#commentcontainer > :nth-child(1)').css('display','block').hide().show("slow")
});

socket.on('new_reply', response => {
    
    $(`#comment-${formData.comment_id}`).append(response)
    $(`#comment-${formData.comment_id} > :last-child`).css('display','block').hide().show("slow")
});

socket.on('delete_comment', formData => {
    $(`#comment-${formData.comment_id}`).css('display','block').slideUp("slow", function() { $(this).remove();});
})

socket.on('delete_reply', formData => {
    $(`#reply-${formData.reply_id}`).css('display','block').slideUp("slow", function() { $(this).remove();});
})

socket.on('edited_comment', formData => {
    $(`#comment-${formData.comment_id}`).find('.content__text').hide().show("slow");
})
socket.on('edited_reply', formData => {
    $(`#reply-${formData.reply_id}`).find('.content__text').hide().show("slow");
})
/*************** Socket IO ***************/


/*************** handle fetch more comments button ***************/
var _sort = window.location.search;
window.fetchMoreComments = function (form) {
    if (isComicDetailPage) {
        formData = {
            page: $(form).data('page'),
            comicSlug: $comicSlug,
        }
    } else {
        formData = {
            page: $(form).data('page'),
            comicSlug: $comicSlug,
            chapter: $chapter,
            isChapterComment: $isChapterComment,
        }
    }
    
    $.ajax({
        type: "POST",
        url: `/comic/comment/fetch${_sort}`,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            if (response) {
                $(form).data().page++
                $('#commentcontainer').append(response)
            } else {
                $('.tfooter__btn').fadeOut("slow", () => { $(this).remove();});
            }
        }
    })
    return false;
}

/*************** handle fetch more comments button ***************/