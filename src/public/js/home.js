$(document).ready(function () {
    var sortMenu = $("#sort-menu");
    var button = $('#sort-button');

    $(document).click(function (event) {

        if (!sortMenu.is(event.target) && !sortMenu.has(event.target).length && !button.is(event.target)) {
            sortMenu.removeClass('open-menu');
            button.removeClass('button-background');
        }
    });
    button.click(function () {

        if (!sortMenu.hasClass('open-menu')) {
            sortMenu.addClass('open-menu');
            button.addClass('button-background')
        } else if (sortMenu.hasClass('open-menu')) {
            sortMenu.removeClass('open-menu');
            button.removeClass('button-background');
        }
    })

    var showLessMore = $('#see-more-less__checkbox');
    var showLessMoreLabel = $('.see-more-less__label');
    var followedContainer = $('.followed-comic-container');
    showLessMore.change(function () {
        if ($(this).is(':checked')) {
            followedContainer.addClass('less-container');
            showLessMoreLabel.addClass('less-label')
        } else {
            followedContainer.removeClass('less-container');
            showLessMoreLabel.removeClass('less-label')
        }
    })

    // truyen vua xem
    var showLessMore2 = $('#see-more-less__checkbox2');
    var showLessMoreLabel2 = $('.see-more-less__label2');
    var watchedContainer = $('.watched-comic-container');
    showLessMore2.change(function () {
        if ($(this).is(':checked')) {
            watchedContainer.addClass('less-container');
            showLessMoreLabel2.addClass('less-label')
        } else {
            watchedContainer.removeClass('less-container');
            showLessMoreLabel2.removeClass('less-label')
        }
    })
    var showLessMore3 = $('#see-more-less__checkbox3');
    var showLessMoreLabel3 = $('.see-more-less__label3');
    var smallWatchedContainer = $('.small-watched-comic-container');
    showLessMore3.change(function () {
        if ($(this).is(':checked')) {
            smallWatchedContainer.addClass('small-less-container');
            showLessMoreLabel3.addClass('less-label')
        } else {
            smallWatchedContainer.removeClass('small-less-container');
            showLessMoreLabel3.removeClass('less-label')
        }
    })
    var showLessMore4 = $('#see-more-less__checkbox4');
    var showLessMoreLabel4 = $('.see-more-less__label4');
    var smallFollowedContainer = $('.small-followed-comic-container');
    showLessMore4.change(function () {
        if ($(this).is(':checked')) {
            smallFollowedContainer.addClass('small-less-container');
            showLessMoreLabel4.addClass('less-label')
        } else {
            smallFollowedContainer.removeClass('small-less-container');
            showLessMoreLabel4.removeClass('less-label')
        }
    })

    var height = $('.nav-bar__top').innerHeight();
    $(window).scroll(function () {
        if ($(this).scrollTop() >= height) {
            $('.nav-bar__bottom').addClass('sticky-nav');

        } else {
            $('.nav-bar__bottom').removeClass('sticky-nav');

        }
    });

})