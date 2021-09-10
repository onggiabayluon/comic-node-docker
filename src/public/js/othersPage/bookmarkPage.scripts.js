addClassVisited()
function addClassVisited() {
    //filter remove empty string in array
    var visited_chapters_list = JSON.parse(localStorage.getItem('visited_chapters')).filter(items => items);
    if (visited_chapters_list == null) return

    var $cardWrapper = $('#card-wrapper')

    for (let i = 0; i < visited_chapters_list.length; i++) {
        $cardWrapper.find(`#chapter-${visited_chapters_list[i]}`).addClass('visited')
    }
}
