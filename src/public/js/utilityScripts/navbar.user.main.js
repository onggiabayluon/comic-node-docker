/*************** Search ***************/

var $searchOutput = $('.search-output')
var $searchInput = $('.search-input')
var $loaderBox = $('.loader-box')
var $closeSearch = $('#closeSearch')

$('.search-icon , #closeSearch').on('click', () => {

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

$('body').on("mouseup", function (e) {
    // console.log(e.target.id)
    // if(e.target.id == "search-output") return;

    if (!$searchInput.is(e.target) && $searchInput.has(e.target).length === 0) {
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
            url: '/comic/search',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(formData),
            success: function (result) {
                $loaderBox.hide()
                $searchOutput.append(result).hide().slideDown('slow');
            },
            error: function (result) {
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