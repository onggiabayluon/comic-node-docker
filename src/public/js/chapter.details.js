/*************** Fetch Comments ***************/

var $pathname = window.location.pathname;
var $search = window.location.search
var element_position = $('#commentbox').offset().top;
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
                url:`/fetch${$pathname}/comments${$search}`,
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

/*************** Fetch Comments ***************/

/* local History */
var $chapterId          = $("input[type=hidden][name=chapterId]").val()
var $comicId            = $("input[type=hidden][name=comicId]").val()
var $comicSlug          = $("input[type=hidden][name=comicSlug]").val()
var $chapter            = $("input[type=hidden][name=chapter]").val()
var $title              = $("input[type=hidden][name=title]").val()
var $thumbnail          = $("input[type=hidden][name=thumbnail]").val()

var href                = window.location.href.split('/chapter');
var chapterUrl          = window.location.href
var comicUrl            = href[0]
var visited_comics      = JSON.parse(localStorage.getItem('visited_comics'));
var visited_chapters    = JSON.parse(localStorage.getItem('visited_chapters'));
var newComicList
        
var this_visit = {
    chapterNameList: [{chapter:  $chapter, _id: $chapterId}],
    title: $title,
    comicUrl: comicUrl,
    comicId: $comicId,
    chapterUrl: chapterUrl,
    comicSlug: $comicSlug,
    thumbnail: $thumbnail
}

if (visited_chapters == null) {

    visited_chapters = [$chapterId]

    localStorage.setItem('visited_chapters', JSON.stringify(visited_chapters));

} else {

    var isvisited = chapterisvisited(visited_chapters)
    
    if (isvisited != true) {

        newChapterList = appendObjTo(visited_chapters, $chapterId)

        localStorage.setItem('visited_chapters', JSON.stringify(newChapterList));
    }
}


/* if not have visited_comics -> add it with chapters */
if (visited_comics == null) {

    localStorage.setItem('visited_comics', JSON.stringify([this_visit]));
    
} else { 
    /* if have local_slug -> check if isviewed */

    var visitResult  = isViewed(visited_comics)

    if (visitResult.visit_thiscomic === false && visitResult.visit_thischapter === false) { 
        
        newComicList = appendObjTo(visited_comics, this_visit)

        localStorage.setItem('visited_comics', JSON.stringify(newComicList));

    }  
    if (visitResult.visit_thiscomic === true && visitResult.visit_thischapter === false) {
        // false: replace new and save

        const newchapterNameList = [...visited_comics[comic_index].chapterNameList, {chapter: $chapter, _id: $chapterId}] // construct old chapter list '[]'
        //console.table(newchapterNameList)
        this_visit.chapterNameList = newchapterNameList // replace old chapter list '[]'
        
        newComicList = [...visited_comics.filter(x => x.comicSlug != $comicSlug), this_visit] // replace old visited comics '[]'
        
        localStorage.setItem('visited_comics', JSON.stringify(newComicList));

    }
};

function isViewed(visited_comics) {
    var result = {
        visit_thiscomic: false,
        visit_thischapter: false,
        comic_index: 0,
        chapter_index: 0
    }
    for (let i = 0; i < visited_comics.length; i++) {
        if (visited_comics[i].comicSlug === $comicSlug) {
            result.visit_thiscomic = true
            comic_index = i 
            for (let j = 0; j < visited_comics[i].chapterNameList.length; j++) {
                if (visited_comics[i].chapterNameList[j].chapter === $chapter) {
                    result.visit_thischapter = true
                    break;
                }
            }
        }
    }
    return result
};

function appendObjTo(thatArray, newObj) {
    const frozenObj = Object.freeze(newObj);
    return Object.freeze(thatArray.concat(frozenObj));
};

function chapterisvisited(visited_chapters) {
    var result = false
    for (let i = 0; i < visited_chapters.length; i++) {
        if (visited_chapters[i] === $chapterId) {
            result = true
            break
        }
    }
    return result
}
/* 🛑 End local History */



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
        isChapterReply: $isChapterReply,
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
        isChapterReply: $isChapterReply,
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