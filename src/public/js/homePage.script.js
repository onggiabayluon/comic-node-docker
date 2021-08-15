
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
        : { width: 25, height: 275, wType: '%', hType: 'px'}
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
        }) /* helper */
        var $sublist = (isLoggedIn) ? await fetchSubList() : {}
        Handlebars.registerHelper('minus', (a, b) => a - b)
        var content = visited_comics_list.slice(Math.max(visited_comics_list.length - 6, 0))
        var source = $("#glides-template").html()
        var template = Handlebars.compile(source)
        var html = template({ historyItems: content, sublist: $sublist, isLoggedIn })
        //console.log(content)
        //console.log(html)
        $('#glide__slides').append(html)
        addClassVisited()
        createPseudoFrame()
        gliderjs()

    }

    /* 🛑 end local History */