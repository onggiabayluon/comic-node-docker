/*-- Lazy loader Image --*/
var targets =[].slice.call(
    document.querySelectorAll(".lazy > source")
   )
const imgOptions = {
    threshhold: 1, // 1 là toàn bộ bức ành
    rootMargin: "0px 0px 0px 0px",
}

const lazyLoadSearch = () => {
    var targets2 =[].slice.call(
        document.querySelectorAll(".lazy > source")
    )
    targets2.forEach(target => {
        let lazyImage = target
        lazyImage.srcset = lazyImage.dataset.srcset;
        lazyImage.nextElementSibling.src = lazyImage.dataset.srcmain;
    })
}

if ("IntersectionObserver" in window) {
    const lazyLoad = target => {
        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                //console.log('😍');
                if (entry.isIntersecting) {
                    
                    let lazyImage = entry.target;
                    // lazyImage.media = autoMedia
                    lazyImage.srcset = lazyImage.dataset.srcset;
                    lazyImage.nextElementSibling.src = lazyImage.dataset.srcmain;
                    lazyImage.parentElement.classList.remove("lazy");
                    
                    observer.disconnect();
                }
    
            });
        }, imgOptions);
    
        io.observe(target)
    };
    
    targets.forEach(lazyLoad);
} else {
    // Not supported, load all images immediately
    lazyImages.forEach(function (image) {
        image.nextElementSibling.src = image.nextElementSibling.dataset.srcset;
    });
}

/*-- End Lazy loader Image --*/