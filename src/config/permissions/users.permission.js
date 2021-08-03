const ROLE = {
    ADMIN: 'admin',
    EXTRAADMIN: 'extraAdmin',
    USER: 'user'
};
module.exports = {

    
    // Chỉ có admin mới có thể thực hiện up user lên extraAdmin và
    // Không thể thay đổi role admin xuống extraadmin tức là userRole khác Admin
    // extraAdmin không thể up user lên role extraAdmin  
    // Role của người thực hiện: req.user.role
    // id của người được chỉnh role: req.params.userId
    canChangeRole: async function (user, myRole) {
        return (
            myRole === ROLE.ADMIN && user.role !== ROLE.ADMIN
        )
    },

    canDeleteUser: async function (user, myRole) {
        return (
            (myRole === ROLE.ADMIN && user.role !== ROLE.ADMIN) 
            || (myRole === ROLE.EXTRAADMIN && user.role !== ROLE.ADMIN && user.role !== ROLE.EXTRAADMIN)
        )
    },

    canChangeBannedStatus: async function (user, myRole) {
        return (
            (myRole === ROLE.ADMIN && user.role !== ROLE.ADMIN) 
            || (myRole === ROLE.EXTRAADMIN && user.role !== ROLE.ADMIN && user.role !== ROLE.EXTRAADMIN)
        )
    },

}