
// var _getAttribute = 'getAttribute';
// var sourceSrcset = source[_getAttribute]("data-srcset");
// if(sourceSrcset){
//     source.setAttribute('srcset', sourceSrcset);
// }
// console.log(sourceSrcset)

(function ($) {

    var pluginName = 'testPlug'

    // object creation
    function testPlug(element, options) {

        // Defaults:
        this.defaults = {
            defaultStringSetting: 'Hello World',
            defaultIntSetting: 1
        };

        // Extending options:
        this.opts = $.extend({}, this.defaults, options);

        // Privates:
        this.$element = $(element);
    }

    // Separate functionality from object creation
    testPlug.prototype = {

        init: function () {
            var _this = this;
            return _this
        },

        //My method description
        hello: function () {
            var _this = this,
                text = _this.defaults.defaultStringSetting
            alert(text)
            return this
        },
        callAgain: function () {
            var _this = this
               console.log(_this.defaults.defaultStringSetting + '2')
        }
    };

    // The actual plugin
    $.fn.myMethod = function (options) {
        if (this.length) {
            // Each element from selector $("")
            return this.each(function () {
                // var rev = new testPlug(this, options);
                // console.log(rev)

                // rev.init() 
                // rev.hello().callAgain()
                // var da = $(this).data('testPlug', rev);
                // console.log(da)
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new testPlug(this, options));
                }
                
            });
        }
    };
})(jQuery);

console.log(
    $("#chapter-6158171414cd430a109178c8").myMethod({
        testOptions: 'testOpt'
    })
)

// Bind 
// $('.buttons').on('click', 'button', function(){
//     // do something here
// });