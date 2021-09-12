/*************** Loader ***************/
// $(window).on('load', function () {
//     // PAGE IS FULLY LOADED  
//     // FADE OUT YOUR OVERLAYING DIV
//     $('#loader').fadeOut("slow");
    
//     let page = 'newest-places'
//     var url = document.location.href;
//     if (url.match(/\?page./)) {
//         document.location = url + `#${page}`;
//         if (url.match(/\#./)) document.location = url;
//     }
    
// });
/*************** Loader ***************/

let page = 'newest-places'
var url = document.location.href;
if (url.match(/\?page./)) {
    document.location = url + `#${page}`;
    if (url.match(/\#./)) document.location = url;
} 

/*************** Tooltip ***************/
$('[data-toggle="tooltip"]').tooltip()

$('#hidden-btn').on('click', () => {
    $('#categories-content').slideToggle('slow')
});
/*************** Tooltip ***************/

/*************** Rand Colors  ***************/
$(function(){
    $items = $('item comic-info-back')
    for (var i = 0; i < $items.length; i++) {
        randomColor = Math.floor(Math.random() * 16777215).toString(16);
        $($items[i]).css("background", "#" + randomColor)
    }
});
/*************** Rand Colors  ***************/


/*************** Categories Function  ***************/
window.drop = function (e) {
    let categoriesOuter = $('#categories-outer')
    categoriesOuter.slideToggle('slow')
};
/*************** Categories Function  ***************/


/*************** glide js ***************/
if ($("#glide_1 .glide__slide").length > 0) {
    new Glide("#glide_1", {
        // type: 'carousel',
        gap: 15,
        rewind: false,
        bound: true,
        perView: 1,
        direction: 'ltr',
        // breakpoints: {
        //     600: { perView: 2},
        //     900: { perView: 3 },
        //     1200: { perView: 2 },
        // },
    }).mount();
}
if ($("#glide_banner .glide__slide").length > 0) {
    var $backgroundBanner = $('#background-banner')
    var glide = new Glide("#glide_banner", {
        type: 'carousel',
        bound: true,
        rewind: true,
        focusAt: 0,
        perView: 1,
        startAt: 0,
        autoplay: 5000,
        direction: 'ltr',
        breakpoints: {
            1200: { perView: 1, gap: 10, peek: {
                before: 250,
                after: 250
            }},
            1000: { perView: 1, gap: 10, peek: {
                before: 150,
                after: 150
            }},
            750: { perView: 1, gap: 10, peek: {
                before: 130,
                after: 130
            }},
            650: { perView: 1, gap: 0, peek: {
                before: 0,
                after: 0
            }},
            // afterTransition : function(event) {
            //     console.log(event.index); // the current slide number
            // } 
        },
    })
    glide.mount();
    // glide.on('run', () => {
    //     $src = $('#glide_banner .glide__slide--active').next().find('img').attr('src')
    //     $backgroundBanner.css('background-image', 'url(' + $src + ')').hide().fadeIn(1000);
    //     console.log('move called')
    //     // this.__changeActiveProject(glide.index)
    // })
}
// gliderjs()
if ($("#glide_2 .glide__slide").length > 0) {
    gliderjs()
}

function gliderjs() {
    // Glider
    new Glide("#glide_2", {
        gap: 0,
        rewind: false,
        bound: true,
        perView: 5,
        direction: 'ltr',
        breakpoints: {
            450: { perView: 3},
            600: { perView: 3},
            900: { perView: 3 },
            1200: { perView: 4 },
        },
    }).mount();
}

/*************** glide js ***************/


/*************** local History ***************/
var $href = window.location.href.split('#')[0];
var $user_id = $("input[type=hidden][name=user_id]").val()
var isLoggedIn = ($user_id) ? true : false


constructHistory()

function addClassVisited() {

    //filter remove empty string in array
    var visited_chapters_list = JSON.parse(localStorage.getItem('visited_chapters')).filter(items => items);
    if (visited_chapters_list == null) return

    var $glide2 = $('#glide_2')
    var $newestplaces = $('#lastest-update-places')

    for (let i = 0; i < visited_chapters_list.length; i++) {
        $glide2.find(`#chapter-${visited_chapters_list[i]}`).addClass('visited')
        $newestplaces.find(`#chapter-${visited_chapters_list[i]}`).addClass('visited')
    }

}

function fetchSubList() {
    if ($user_id) {
        return $sublist = getData(`${$href}fetch/sublist`)
    }
    return
}

function createPseudoFrame() {
    let glide__slides = $('#glide_2 #glide__slides')
    let glideLength = glide__slides.children().length
    let child = $('#glide_2 #glide__slides .glide__slide:first-child')
    let { width, height, wType, hType } = (glideLength > 0)
        ? { width: child.innerWidth(), height: child.innerHeight(), wType: 'px', hType: 'px' }
        : { width: 25, height: 275, wType: '%', hType: 'px' }
    do {
        glide__slides.append(`<div class="glide__slide" style="width:${width}${wType};height:${height}${hType};"><div style="width:100%;height:100%;border: 1px solid var(--border-color);"></div></div>`);
        $("b").clone().prependTo("p");
        glideLength++
    } while (glideLength < 5)
}

async function constructHistory() {
    var visited_comics_list = JSON.parse(localStorage.getItem('visited_comics'));
    if (visited_comics_list == null) return createPseudoFrame()

    /* helper */
    Handlebars.registerHelper('ifCond', function (a, operator, b, options) {
        switch (operator) {
            case '==':
                return (a == b) ? options.fn(this) : options.inverse(this);
            case '===':
                return (a === b) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (a != b) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (a !== b) ? options.fn(this) : options.inverse(this);
            case '<':
                return (a < b) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (a <= b) ? options.fn(this) : options.inverse(this);
            case '>':
                return (a > b) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (a >= b) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (a && b) ? options.fn(this) : options.inverse(this);
            case '||':
                return (a || b) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    })
    Handlebars.registerHelper('limitlast', (arr, limit) => {
        if (!Array.isArray(arr)) { return []; }
        return arr.slice(arr.length - limit, arr.length);
    })
    Handlebars.registerHelper('chapterText', (str) => {
        str = str.toString().replace(/-/g, ' ').replace("apter", '.');
        return str && str[0].toUpperCase() + str.slice(1);// replace '-' -> space 
    })
    Handlebars.registerHelper('compareListId', function (a, list, options) {
        let result = false
        for (i = 0; i < list.length; i++) {
            if (JSON.stringify(list[i]) === JSON.stringify(a)) {
                result = true
                break;
            }
        }
        return result
    })
    Handlebars.registerHelper('minus', (a, b) => a - b)
    /* helper */

    var $sublist = (isLoggedIn) ? await fetchSubList() : {}
    var content = visited_comics_list.slice(Math.max(visited_comics_list.length - 6, 0))
    var source = $("#glides-template").html()
    var template = Handlebars.compile(source)
    var html = (isLoggedIn)
        ? template({ historyItems: content, sublist: $sublist, isLoggedIn })
        : template({ historyItems: content, isLoggedIn })
    $('#glide__slides').append(html)
    addClassVisited()
    createPseudoFrame()
    gliderjs()

}

/*************** local History ***************/