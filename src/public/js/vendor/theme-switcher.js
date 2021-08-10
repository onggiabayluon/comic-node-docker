
let duration = 0.4;
let isDay = true;


let back = document.getElementById('back');
let front = document.getElementById('front');
let switchTime = () => {

    back.setAttribute('href', '#' + (isDay ? 'day' : 'night'));
    front.setAttribute('href', '#' + (isDay ? 'night' : 'day'));
}

let switchToggle = document.getElementById('input');
switchToggle.addEventListener('change', () => toggle())

let toggle = () => {
    isDay = switchToggle.checked == true;
    if (isDay) {
        circleAnim('light')
        setTheme('light')
    } else {
        circleAnim('dark')
        setTheme('dark')
    }
};

let circleAnim = (theme) => {
    if(theme == 'light') {
        $( "#circle" ).animate({"cx": 19}, "slow");
        switchTime()
    } 
    if(theme == 'dark') {
        $( "#circle" ).animate({"cx": 37}, "slow");
        switchTime()
    }
}
// function to set a given theme/color-scheme
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.body.className  = themeName;
}
// function to toggle between light and dark theme
// function toggleTheme() {
//     if (localStorage.getItem('theme') === 'dark') {
//         circleAnim('light');
//         setTheme('light');
//     } else {
//         circleAnim('dark');
//         setTheme('dark');
//     }
// }
// Immediately invoked function to set the theme on initial load
(function () {
    if (localStorage.getItem('theme') === 'dark') {
        switchToggle.checked = false
        toggle()
        setTheme('dark');
    } else {
        setTheme('light');
    }
 })();

