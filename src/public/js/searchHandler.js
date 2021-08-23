
function SearchHandler(dataFetched, search, matchList, source, templateObjProperty, filterProperty, callback) {
    Handlebars.registerHelper('CalcTimeEnglish', function (UploadedTime) {
        var earlierDate = new Date(UploadedTime);
        var currentTime = new Date();
        var oDiff = new Object();

        //  Calculate Differences
        //  -------------------------------------------------------------------  //
        var nTotalDiff = currentTime.getTime() - earlierDate.getTime();

        oDiff.days = Math.floor(nTotalDiff / 1000 / 60 / 60 / 24);
        nTotalDiff -= oDiff.days * 1000 * 60 * 60 * 24;

        oDiff.hours = Math.floor(nTotalDiff / 1000 / 60 / 60);
        nTotalDiff -= oDiff.hours * 1000 * 60 * 60;

        oDiff.minutes = Math.floor(nTotalDiff / 1000 / 60);
        nTotalDiff -= oDiff.minutes * 1000 * 60;

        oDiff.seconds = Math.floor(nTotalDiff / 1000);
        //  -------------------------------------------------------------------  //

        //  Format Duration
        //  -------------------------------------------------------------------  //


        // ngày > 30 thì xuất ra ngày,tháng, số giờ VD: 12/3 15:00
        // getMonth trả về giá trị bắt đầu từ 0 VD: january getmonth() = 0, february = 1 nên phải +1
        var returnedText = new Object();
        if (oDiff.days >= 30) {

            returnedText.years = earlierDate.getFullYear()
            returnedText.month = earlierDate.getMonth() + 1
            returnedText.days = earlierDate.getDate()
            returnedText.hours = earlierDate.getHours()
            returnedText.minutes = earlierDate.getMinutes()

            //  Format Month
            var monthtext = '00';
            if (returnedText.month > 0) { monthtext = String(returnedText.month); }
            if (monthtext.length == 1) { monthtext = '0' + monthtext };

            //  Format Days
            var daytext = '00';
            if (returnedText.days > 0) { daytext = String(returnedText.days); }
            if (daytext.length == 1) { daytext = '0' + daytext };

            //  Format Hours
            var hourtext = '00';
            if (returnedText.hours > 0) { hourtext = String(returnedText.hours); }
            if (hourtext.length == 1) { hourtext = '0' + hourtext };

            //  Format Minutes
            var mintext = '00';
            if (returnedText.minutes > 0) { mintext = String(returnedText.minutes); }
            if (mintext.length == 1) { mintext = '0' + mintext };

            // 15:00 03/06/2020
            var FormatText = hourtext + ':' + mintext + ' ' +
                monthtext + '/' + daytext + '/' + returnedText.years

            returnedText.finalText = FormatText;
            return returnedText.finalText;
        } else if (oDiff.days > 0 && oDiff.days < 29) {
            // ngày < 30 xuất 

            //  Format Days
            var daytext = '0';
            if (oDiff.days > 0) { daytext = String(oDiff.days); }

            // VD: 29 days ago
            var FormatText = daytext + " days ago"

            returnedText.finalText = FormatText;
            return returnedText.finalText;
        }

        if (oDiff.days == 0) {
            if (oDiff.hours == 0) {
                if (oDiff.minutes == 0) {
                    //  Không có days và hours và minutes
                    //  Format Seconds
                    var sectext = '00';
                    if (oDiff.seconds > 0) { sectext = String(oDiff.seconds); }
                    if (sectext.length == 1) { sectext = '0' + sectext };

                    // 1 giây trước
                    var FormatText = sectext + ' ' + 'seconds ago'

                    returnedText.finalText = FormatText;
                    return returnedText.finalText;

                } else if (oDiff.minutes > 0 && oDiff.minutes <= 60) {
                    //  Không có days và hours
                    //  Format Minutes
                    var mintext = '00';
                    if (oDiff.minutes > 0) { mintext = String(oDiff.minutes); }
                    if (mintext.length == 1) { mintext = '0' + mintext };

                    // 1 phút trước
                    var FormatText = mintext + ' ' + 'mins ago'

                    returnedText.finalText = FormatText;
                    return returnedText.finalText;
                }
            }

            //  Không có days 
            //  Format Hours
            var hourtext = '00';
            if (oDiff.hours > 0) { hourtext = String(oDiff.hours); }


            // 1 giờ trước
            var FormatText = hourtext + ' ' + 'hours ago'

            returnedText.finalText = FormatText;
            return returnedText.finalText;
        }
    });

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
    });

    Handlebars.registerHelper('replaceHyphenIntoSpace', function (str) {
        str = str.toString().replace(/-/g, ' ');
        return  str;// replace '-' -> space 
    });
    
    var html = ''
    var renderTemplate = Handlebars.compile(source);
    var templateObj = new Object()

    // Search Stuff and then filter it
    var searchStuffs = async searchText => {
        // Get matches to current text input
        searchText.toLowerCase()
        let matches = dataFetched.filter(dataFetched => {
            const regex = new RegExp(`${searchText}`, 'gi');
            console.log(regex)
            return filterProperty(dataFetched, regex)
        })
        console.log(matches)
        
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
