/*-- Lazy loader Image --*/
const targets = document.querySelectorAll('.image--loader');
const imgOptions = {
    threshhold: 1, // 1 là toàn bộ bức ành
    rootMargin: "0px 0px 6000px 0px",
}
const baseUrl = `https://api.cloudimagewall.xyz`
var flag = 0;
var finalSize = 0
function querry(clientWidth) {
        if (flag == 0) {
            function setFlag() {
               flag = 1
            };
            var mediaQueries = {
                desktop: 1000,
                tablets: 690,
                phone: 400,
            };
            var clientWidthString = clientWidth
            if (clientWidthString >= 850) {
                var size = mediaQueries.desktop  //  >= 850
            } else
                if (clientWidthString >= 550 && clientWidthString < 850) {
                    var size = mediaQueries.tablets //  [550, 850) 
                } else
                    if (clientWidthString < 550) {
                        var size = mediaQueries.phone // < 550
                    }
                    setFlag()
        }else if (flag == 1) {
            return 0
        }
        return parseInt(size) 

    }

const lazyLoad = target => {
        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                //console.log('😍');
                if (entry.isIntersecting) {
                    var img = new Image ();
                    img = entry.target; // Current Image
                    const src = img.getAttribute('data-bg');
                    
                    {
                       
                        const { clientWidth, clientHeight } = img
                        console.log("img WIDTH: " + clientWidth)
                        const pixelRatio = window.devicePixelRatio || 1.0
                        function setFinalSize() {
                            finalSize = finalSize + querry(clientWidth)
                        };
                        setFinalSize();
                        // console.log(pixelRatio)
                        const imageParams = `fit-in/${finalSize}x0/filters:quality(75)/filters:autojpg()`
                        //const imageParams = `w_${100 * Math.round(finalSize * pixelRatio / 100)},h_${100 * Math.round(finalSize * pixelRatio / 100)},q_auto,c_fill,f_auto`
                        //,g_auto nhận diện tiêu điểm ảnh
                        const url = `${baseUrl}/${imageParams}/${img.dataset.bg}`
                        img.src = `${url}`
                        img.classList.remove('imgPlaceholder--loader')
                        //img.style.backgroundImage = `url('${url}')`
                    }   
                    observer.disconnect();
                }
            });
        }, imgOptions);

        io.observe(target)
    };

    targets.forEach(lazyLoad);
/*-- End Lazy loader Image --*/