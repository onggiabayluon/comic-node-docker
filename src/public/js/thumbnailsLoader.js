/*-- Lazy loader Image --*/
const targets = document.querySelectorAll('.thumbnailsLoader');
const baseUrl = `https://api.cloudimagewall.xyz`


async function awaitGetImages() {
    await getImages()
}
function getImages() {
    const targets2 = document.querySelectorAll('.thumbnailsLoader');
    targets2.forEach(target => {
        console.log(target)
        const imageParams = `fit-in/130x0/filters:quality(75)/filters:autojpg()`
        const url = `${baseUrl}/${imageParams}/${target.dataset.bg}`
        target.src = `${url}`
    })
}

const imgOptions = {
    threshhold: 1, // 1 là toàn bộ bức ành
    rootMargin: "0px 0px 0px 0px",
}


const lazyLoad = target => {
    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                var img = new Image();
                img = entry.target; // Current Image
                
                const { clientWidth, clientHeight } = img
                const pixelRatio = window.devicePixelRatio || 1.0
                const imageParams = `fit-in/130x0/filters:quality(75)/filters:autojpg()`
                const url = `${baseUrl}/${imageParams}/${img.dataset.bg}`
                img.src = `${url}`

                observer.disconnect();
            }
        });
    }, imgOptions);

    io.observe(target)
};

targets.forEach(lazyLoad);
/*-- End Lazy loader Image --*/

