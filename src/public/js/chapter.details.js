



$('#remove').on("click", function() {
    $("option").eq(0).hide();
});

/*************** Function ***************/
window.showInput = function (e) {
    $thisbtnbox = $(e).parents('.form-group').siblings('#buttonbox')
    $thisbtnbox.addClass('buttonbox--flex');
}

window.resetInput = function (e) {
    $thisbtnbox = $(e).parents('.buttonbox')
    $thisbtnbox.removeClass('buttonbox--flex');
    $(e).parents('form').trigger("reset");
}

window.hideReplydialog = function (e) {
    $thisreplydialog = $(e).parents('.replydialog')
    $thisreplydialog.toggleClass('d-none');
}

window.showReplyBox = function (e) {
    $thisreplybox = $(e).parents('.toolbar').siblings('#replydialog')
    $thisreplybox.toggleClass('d-none');
}


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
}

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
var $isChapterComment = $("input[type=hidden][name=isChapterComment]").val()
var $isChapterReply = $("input[type=hidden][name=isChapterReply]").val()
var $title = $("input[type=hidden][name=title]").val()
var $comicSlug = $("input[type=hidden][name=comicSlug]").val()
var $chapter = $("input[type=hidden][name=chapter]").val()
var formData

//  Start POST comment
window.postComment = function (form) {
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
    $.ajax({
        type: "POST",
        url: `/comic/comment`,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            socket.emit('new_comment', response)
        }
    })
    return false;
}; 

//  Start destroy comment 
window.destroyComment = function (form) {
    formData = {
        comment_id: form.comment_id.value,
        comicSlug: $comicSlug,
        chapter: $chapter,
        isChapterComment: $isChapterComment,
    }
    if (confirm("Delete this Comment ? ?")) {
        $.ajax({
            type: "POST",
            url: `/comic/comment/destroyComment?_method=DELETE`,
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                socket.emit('delete_comment', formData)
            }
        })
    }
    return false;
}; 

//  Start POST reply
window.postReply = function (form) {
    formData = {
        comment_id: form.comment_id.value,
        text: form.text.value,
        title: $title,
        userId: $user_id,
        userName: $username,
        comicSlug: $comicSlug,
        chapter: $chapter,
        updatedAt:  new Date().toISOString()
    }
    $.ajax({
        type: "POST",
        url: `/comic/reply`,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            hideReplydialog(form)
            socket.emit('new_reply', response) 
        }
    })
    return false;
}; 

//  Start destroy reply 
window.destroyReply = function (form) {
    formData = {
        reply_id: form.reply_id.value,
        comment_id: form.comment_id.value,
        comicSlug: $comicSlug,
        chapter: $chapter,
        isChapterReoly: $isChapterReply,
    }
    if (confirm("Delete this Reply ?")) {
        $.ajax({
            type: "POST",
            url: `/comic/comment/destroyReply?_method=DELETE`,
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                socket.emit('delete_reply', formData)
            }
        })
    }
    return false;
}; 

// Start edit Comment 
window.editCommentForm = function (form) {
    $thisVal = $(form).parent().find('.content__text').html()
    form.text.value = $thisVal
    
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
var room = $comicSlug + '@' + $chapter
socket.emit('join', room);

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


/*************** fetch ***************/
var _sort = window.location.search;
window.fetchMoreComments = function (form) {
    formData = {
        page: $(form).data('page'),
        comicSlug: $comicSlug,
        chapter: $chapter,
        isChapterComment: $isChapterComment,
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

/*************** fetch ***************/