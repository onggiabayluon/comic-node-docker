
const   $msgContainer = $('#msg-container'),
        $msgBox = $('#msg-box'),
        $loginModal = $('#loginModal'),
        $msgmodalTitle = $('#msgmodal--title'),
        $msgmodalText = $('#msgmodal--text'),
        $msgModalTitle = $('#msgmodal--title')

        
// const   $msgBoxEllipsis = $('#msg-box--ellipsis'),
//         $msgBoxSmallRounded = $('#msg-box--smallRounded'),
//         $msgBoxFail = $('#msg-box--fail'),
//         $msgBoxSuccess = $('#msg-box--success');

const appendCloneMsg = () => {
    $clonedMsgBox = $msgBox.clone()
    $msgContainer.append($clonedMsgBox)
};

const toggleLoading = () => {
    $clonedMsgBox.toggleClass('d-none')
    $clonedMsgBox.find('#msg-box--ellipsis').toggleClass('d-none')
};

const removeClonedMsg = () => {
    setTimeout(function() { 
        $msgContainer.children('#msg-box').hide("slow", function() { $(this).remove();});
    }, 5000);
};

const showErrorModal = (msg) => {
    toggleLoading()
    $clonedMsgBox.removeClass('d-none')
    $clonedMsgBox.toggleClass('message-box--danger')
    $clonedMsgBox.find('#msg-box--smallRounded').removeClass('d-none')
    $clonedMsgBox.find('#msg-box--fail').removeClass('d-none')
    
    // Change modal title and text 
    $msgmodalTitle.html(msg.status)
    $msgmodalText.html(msg.message)
    $msgModalTitle.addClass('text-danger')
    $msgModalTitle.removeClass('text-success')
};

const showSuccessModal = (msg) => {
    toggleLoading()
    $clonedMsgBox.removeClass('d-none')
    $clonedMsgBox.toggleClass('message-box--success')
    $clonedMsgBox.find('#msg-box--smallRounded').removeClass('d-none')
    $clonedMsgBox.find('#msg-box--success').removeClass('d-none')
    
    // Change modal title and text 
    $msgmodalTitle.html(msg.status)
    $msgmodalText.html(msg.message)
    $msgModalTitle.addClass('text-success')
    $msgModalTitle.removeClass('text-danger')
};

const toggleLoginModal = (msg) => {
    $loginModal.modal()
    $loginModal.find("#loginModal--title").html(msg.status)
    $loginModal.find("#loginModal--text").html(msg.message)
};

const handleErrorMsg = (response) => {
    const res = JSON.parse(response.responseText)

    if (res.error.status === 401) toggleLoginModal(res.error)
    else showErrorModal(res.error)

    return removeClonedMsg()
};

const handleSuccessMsg = (response) => {
    const res = {
        status: response.status,
        message: response.message
    }

    if (res.status === 401) toggleLoginModal(res)
    else showSuccessModal(res)
    
    return removeClonedMsg()
};