// SET active to category
const pathname = window.location.pathname
const categoryParam = pathname.split('/').pop()
const $category = $('.category')
$category.removeClass('active')
$category.find(`a[href*="${categoryParam}"]`).parent().addClass('active')

// SET checked to label input
const searchParam = window.location.search
const hrefElement = (searchParam.includes('page'))
    ? searchParam.replace('?page=', '?').replace(/[0-9]/, "").replace(/&/, "")
    : searchParam

switch (searchParam) {
    case '':
        $(`a[href="?"] input`).prop('checked', true);
        break;
    case `${searchParam}`:
        $(`a[href="${hrefElement}"] input`).prop('checked', true);
        break;
    default:
        $(`a[href="?"] input`).prop('checked', true);
        break;
}