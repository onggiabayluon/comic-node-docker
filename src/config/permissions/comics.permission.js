const ROLE = {
    ADMIN: 'admin',
    EXTRAADMIN: 'extraAdmin',
    USER: 'user'
};
module.exports = {
    canViewProject: async function (user, project) {
        var comicId_Equal_UserId = project.then(comics => { 
            if (comics.length == 0) {
                return true
            } else {
                return comics[0].userId === user.id // Check quyền sở hữu
            }
        })
        return (
            user.role === ROLE.ADMIN || await comicId_Equal_UserId
        )
    },

    scopedProjects: function (user, projects) {
        if (user.role === ROLE.ADMIN) return projects
        return projects.filter(project => project.userId === user.id)
    },

    canDeleteProject: function (user, project) {
        return user.role === ROLE.ADMIN || project.userId === user.id
    },
}