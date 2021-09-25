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

const pathname = window.location.pathname;
const chapter = pathname.split('/').pop()
$(`option[data-chapter=${chapter}]`).attr('selected', true);



