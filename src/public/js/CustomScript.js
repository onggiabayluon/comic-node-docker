// Loader
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

let page = 'newest-places'
var url = document.location.href;
if (url.match(/\?page./)) {
    document.location = url + `#${page}`;
    if (url.match(/\#./)) document.location = url;
}

/*************** Utility ***************/
$('[data-toggle="tooltip"]').tooltip()

$('#hidden-btn').on('click', () => {
    $('#categories-content').slideToggle('slow')
});
/*************** Utility ***************/

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


/*************** Hamburger Bar  ***************/
$('#navbarSupportedContent').on('show.bs.collapse', function () {
    $('#subnav').removeClass('hide-hambuger-phone')
})
$('#navbarSupportedContent').on('hidden.bs.collapse', function () {
    $('#subnav').addClass('hide-hambuger-phone')
})
/*************** Hamburger Bar  ***************/

/*************** Subscribe form  ***************/
var $user_id = $("input[type=hidden][name=user_id]").val()
var $username = $("input[type=hidden][name=username]").val()
var $comicId = $("input[type=hidden][name=comicId]").val()

window.subscribe = function (form) {
    let subscribe = ($(form).hasClass('bookmark--subscribed') || $(form).hasClass('info-sub--subscribed')) ? 'unsub' : 'sub'
    formData = {
        userId: $user_id,
        userName: $username,
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


/*************** Search ***************/

var $searchOutput = $('.search-output')
var $searchInput = $('.search-input')
var $loaderBox = $('.loader-box')
$('.search-icon').on('click', () => {
    
    if ($searchOutput.is(":hidden") && $searchInput.is(":visible")) {
        $searchOutput.hide("slow")
    } 
    else if ($searchOutput.is(":hidden") && $searchInput.is(":hidden")) {
        $searchOutput.hide("slow")
    } 
    else {
        $searchOutput.show("slow")
    }
    $searchInput.animate({
        width: "toggle"
    });
});

$('body').on("mouseup", function(e){
    // console.log(e.target.id)
    // if(e.target.id == "search-output") return;
    
    if (!$searchInput.is(e.target) && $searchInput.has(e.target).length === 0) 
    {
        $searchOutput.hide();
    } else {
        $searchOutput.show();
    }

})

$('.search-input').on("keyup", delay(function (e) {
    if (this.value.length > 0) {
        formData = { data: this.value }
        $.ajax({
            type: 'POST',
            url:'/comic/search',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(formData),
            success: function(result) {
                $loaderBox.hide()
                $searchOutput.append(result).hide().slideDown('slow');
            },
            error: function(result) {
                console.log(result)
                $loaderBox.hide()
            },
        });
    } else {
        $loaderBox.hide()
        $searchOutput.slideToggle('slow')
    }
}, 500));

function searchingState() {
    $searchOutput.find('item, empty, left-over').remove();
    $loaderBox.show()
}
function delay(fn, ms) {
    let timer = 0
    return function (...args) {
        searchingState()
        clearTimeout(timer)
        timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
};
/*************** Search ***************/

/*************** Scroll ***************/

// var $window = $(window);
// var $pane = $('#pane1');
// var $subnav = $('#subnav')
// var $subnavContainer = $('.subnav-container')
// var $mainnav = $('#mainnav')
// var $tempnav = $('#tempnav') 

// function checkWidth() {
//     var lastScrollTop = 0;
//     var windowsize = $window.width();
//     if (windowsize > 992) {
        
//         $(window).scroll(function (event) {
//             var st = $(this).scrollTop();
            
//             if (st > lastScrollTop) {
//                 // downscroll code
//                 $subnav.removeClass('fixed-style')
//                 $subnavContainer.removeClass('subnav-container--p-0')
//                 $tempnav.addClass('d-none')
//             } else {
//                 // upscroll code
//                 if (st < 100) {
//                     $subnav.removeClass('fixed-style')
//                     $subnavContainer.removeClass('subnav-container--p-0')
//                     $tempnav.addClass('d-none')
//                 } else {
//                     $subnav.addClass('fixed-style')
//                     $subnavContainer.addClass('subnav-container--p-0')
//                     $tempnav.removeClass('d-none')
//                 }
//             }
//             lastScrollTop = st;
//         });

//     } else {
//         $(window).scroll(function (event) {

//             var st = $(this).scrollTop();
//             if (st > lastScrollTop) {
//                 // downscroll code
//                 $mainnav.removeClass('fixed-style')
//             } else {
//                 // upscroll code
//                 if (st < 100) {
//                     $tempnav.addClass('d-none')
//                     $mainnav.removeClass('fixed-style')
//                     $subnavContainer.removeClass('subnav-container--fixed')
//                 } else {
//                     $mainnav.addClass('fixed-style')
//                     $subnavContainer.addClass('subnav-container--fixed')
//                 }
                
//             }
//             lastScrollTop = st;
//         });

//     }
// };
// function reset() {
//     $('#mainnav').removeClass('fixed-style')
//     $('#subnav').removeClass('fixed-style')
//     $('.subnav-container').removeClass('subnav-container--fixed')
//     $('.subnav-container').removeClass('subnav-container--p-0')
//     $(window).unbind('scroll');
// };
// // Execute on load
// checkWidth();
// // Bind event listener
// $(window).resize(() => {
//     reset()
//     checkWidth()
// });
/*************** Scroll ***************/

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
        // autoplay: 10000,
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



// var $AllSubthumbs = $('.subthumb')
// var $mainThumb = $('.mainthumb')
// var $meta__views = $('.meta__views')
// var $meta__title = $('.meta__title')
// var currentIndex = 0
// $('.slider__item').on("mouseenter", function (e) {
//     $meta__views.html(e.target.getAttribute('data-views'));
//     $meta__title.html(e.target.getAttribute('data-title'));
    
//     $mainThumb.fadeOut('200', () => {
//         $mainThumb.attr("src", e.target.src);
//         $mainThumb.fadeIn('300');
//     })
    
// });
// // Slider Running 
// play()

// function play () {
//     $AllSubthumbs.each((i, subthumb) => {
//         //index, element, delay time
//         setDelay(i, subthumb, 7000);
//     });
// };

// function anim(subthumb) {

//     if ( currentIndex === $AllSubthumbs.length - 1 ) {
//         currentIndex = 0
//         play()
//     }

//     $meta__views.html(subthumb.getAttribute('data-views'));
//     $meta__title.html(subthumb.getAttribute('data-title'));

//     $mainThumb.fadeOut('200', () => {
//         $mainThumb.attr("src", subthumb.src);
//         $mainThumb.fadeIn('300');
//     })
// };

// function setDelay(i, subthumb, delay) {
//     setTimeout(() => {
//         anim(subthumb)
//         currentIndex++
//     }, i * delay);
// };

  


/* first slider */ 