const resolvers = {
  Query: {
    getLoggedInUser(parent,args,ctx,info){
		console.log('logged-in user')
		console.log(ctx)
          return {
            userName:"String",
            realName:"String",
            email:"String@string",
            category:"consultant",
            isAdmin:true
          }
      },
    getProject() {return null},
    projectList(){return []},
    allUsers() {return []},
    getUser(){return null}
  }
}
export default resolvers
