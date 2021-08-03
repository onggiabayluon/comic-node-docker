
function SearchHandler(dataFetched, search, matchList, source, templateObjProperty, filterProperty, callback) {
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
    Handlebars.registerHelper('replaceHyphenIntoSpace', function (str) {
        str = str.toString().replace(/-/g, ' ');
        return  str;// replace '-' -> space 
    })
    var html = ''
    var renderTemplate = Handlebars.compile(source);
    var templateObj = new Object()

    // Search Stuff and then filter it
    var searchStuffs = async searchText => {
        // Get matches to current text input
        searchText.toLowerCase()
        let matches = dataFetched.filter(dataFetched => {
            const regex = new RegExp(`^${searchText}`, 'gi');
            return filterProperty(dataFetched, regex)
        })
        
        if (searchText.length === 0) {
            matches = [];
            outputHtml(dataFetched)
        }
        outputHtml(matches)
    }

    // render HBS template to html
    const outputHtml = matches => {
        templateObj[`${templateObjProperty}`] = matches
        if (matches.length > 0) {
            html = renderTemplate(templateObj);
            matchList.innerHTML = html
        }
    }

    search.addEventListener('input', () => {
        searchStuffs(search.value).then(callback)
    })
}
