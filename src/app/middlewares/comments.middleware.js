const okToModifyThisComment = (commentDoc, userRequest, clientComment_id) => {
    try {
        if (userRequest.role === 'admin' || userRequest.role === 'extraAdmin') return [true, null]
        // Find comment index location
        const $thisDocCommentIndex = commentDoc.commentArr.findIndex(serverComment => JSON.stringify(serverComment._id) === JSON.stringify(clientComment_id))
        // This Json Comment
        const $thisServerComment = commentDoc.commentArr[$thisDocCommentIndex]
        // Compare UserIddb in db With req.user in request
        return [(JSON.stringify($thisServerComment.userId) === JSON.stringify(userRequest._id)), null]
    } catch (err) {
        console.log('Error:', err);
        return [false, err]
    }
};

const okToModifyThisReply = (commentDoc, userRequest, clientComment_id, clientReply_id) => {
    try {
        if (userRequest.role === 'admin' || userRequest.role === 'extraAdmin') return [true, null]
        // Find comment index location
        const $thisDocCommentIndex = commentDoc.commentArr.findIndex(serverComment => JSON.stringify(serverComment._id) === JSON.stringify(clientComment_id))
        // Find Reply index location
        const $thisDocReplyndex = commentDoc.commentArr[$thisDocCommentIndex].reply.findIndex(serverComment => JSON.stringify(serverComment._id) === JSON.stringify(clientReply_id))
        // This Json Reply
        const $thisServerReply = commentDoc.commentArr[$thisDocCommentIndex].reply[$thisDocReplyndex]
        // Compare UserIddb in db With req.user in request
        return [(JSON.stringify($thisServerReply.userId) === JSON.stringify(userRequest._id)), null]
    } catch (err) {
        console.log('Error:', err);
        return [false, err]
    }
};

module.exports = { okToModifyThisComment, okToModifyThisReply };