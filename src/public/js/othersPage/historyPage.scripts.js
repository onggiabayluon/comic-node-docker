var $href = window.location.href;
var $user_id = $("input[type=hidden][name=user_id]").val()
var isLoggedIn = ($user_id) ? true : false
/* local History */

constructHistory()

function addClassVisited() {

    //filter remove empty string in array
    var visited_chapters_list = JSON.parse(localStorage.getItem('visited_chapters')).filter(items => items);
    if (visited_chapters_list == null) return

    var $glide2 = $('#glide_2')
    var $lastestupdateplaces = $('#lastest-update-places')

    for (let i = 0; i < visited_chapters_list.length; i++) {
        $glide2.find(`#chapter-${visited_chapters_list[i]}`).addClass('visited')
        $lastestupdateplaces.find(`#chapter-${visited_chapters_list[i]}`).addClass('visited')
    }

}

function constructHistory() {
    var visited_comics_list = JSON.parse(localStorage.getItem('visited_comics'));
    if (visited_comics_list == null) return

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
    Handlebars.registerHelper('limit', (arr, limit) => {
        if (!Array.isArray(arr)) { return []; }
        return arr.slice(0, limit);
    })
    Handlebars.registerHelper('replaceHyphenIntoSpace', (str) => {
        str = str.toString().replace(/-/g, ' ').replace("apter", '.');
        return str && str[0].toUpperCase() + str.slice(1);// replace '-' -> space 
    })

    var content = visited_comics_list
    var source = $("#history-template").html()
    var template = Handlebars.compile(source)
    var html = template({ comics: content })
    $('#lastest-update-places').append(html).slideDown('slow')
    addClassVisited()
}