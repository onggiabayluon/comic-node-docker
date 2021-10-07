
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
var $noRender           = $("input[type=hidden][name=noRender]").val()

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
        this_visit.thumbnail = $thumbnail // replace new thumbnail every new chapter
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

/*************************** Chapter Select Option ***************************/
const pathname = window.location.pathname;
const chapter = pathname.split('/').pop()
$("[data-chapter='" + chapter + "']").attr('selected', true);

/*************************** Chapter Select Option ***************************/


/*************************** Unlock chapter function ***************************/
function initLazy(chapters) {
    $('#l-unlock-container').remove()
    $('#images-container').removeClass('d-none')
    const { storage_url, chapterdoc, img_format } = chapters
    const pictures = document.querySelectorAll(".intrinsic__picture")
    pictures.forEach((picture, index) => {
        var img = chapterdoc.image[index]
        picture.children[0].setAttribute("data-srcset", `${storage_url}/${img.url}${img_format.sm}`); 
        picture.children[1].setAttribute("data-srcset", `${storage_url}/${img.url}${img_format.lg}`); 
        picture.children[2].setAttribute("data-src", `${storage_url}/${img.url}${img_format.md}`); 
    });
    lazySizes.init();
};

window.unlockChapter = function (form) {
    appendCloneMsg()
    toggleLoading()
    $('#confirm-modal').modal('hide');
    let formData = {
        chapterSlug: form.chapterSlug.value,
        chapter_id: form.chapter_id.value,
        chapter: chapter
    }
    $.ajax({
        url: "/users/unlockChapter",
        type: "POST",
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            handleSuccessMsg({message: 'Unlock Chapter Successfully', status: 200})
            initLazy(response)
        },
        error: function (response) {
            handleErrorMsg(response)
        }
    });
    return false;
}; 
/*************************** Unlock chapter function ***************************/

/*************************** Run lazyload if no need to fetch render ***************************/

if ($noRender) {
    // chapterLazyLoad()
} else {
    getAuthChapter()
}

/*************************** Run lazyload if no need to fetch render ***************************/


/*************************** getAuth chapter ajax ***************************/

function getAuthChapter() {
    $.ajax({
        url: `/fetch/getAuthChapter/${$comicSlug}/${$chapterId}`,
        type: "GET",
        data: {chapterName: $chapter, noRender: $noRender},
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            $('#auth-container').append(response).ready(function () {
                if (response.withoutLazyload) return;
                else { 
                    initLazy(response)
                } 
            });
        },
        error: function (response) {
            console.log(response)
        }
    });
};

/*************************** getAuth chapter ajax ***************************/


