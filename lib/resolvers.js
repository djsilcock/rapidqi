
import {get,update,fromPairs} from 'lodash'
const resolvers = {
  Query: {
    getLoggedInUser(parent,args,{User,currentuser},info) {     //(parent,args,ctx,info)
      return User.getById(currentuser)
    },

    getProject(parent,{id},{Project}) {
      return Project.getById(id)},

    projectList(parent,args,{Project,currentuser}){
      const where={}
      if (!currentuser?.isAdmin) {where.isVetted=false; where.canDisplay='Yes'}

      return Project.where(where)
    },
    getUser(parent,{id},{User}){
      return User.getById(id)
    },
    async allUsers(parent,args,{User}) {
      const users=await User.where({})
      return users.map((s)=>({id:s._id,...s}))
    },
  },
  Mutation:{
    async addProject(parent,{proj},{User,Project,currentuser},info){
      /*Expected input:
     
    input ProjectInput{
      title: String!
      people: {
        proposers:[ID]
        leaders:[ID]
        involved:[ID]
        new:[{
          id:ID
          realName:String
          email:String
          category:StaffType
          }]
        }
      description: String!
      methodology: String!
      category: [ID]
      othertags: String
      email: String
      advertise: YesNoPending
      mm_or_ci: YesNoPending
      caldicott: YesNoPending
      research: YesNoPending
      dates: {
        proposed: Date
        start: Date
        finish: Date
        }
      candisplay: YesNoPending
      }
        */
      
      const newpeople=fromPairs(await Promise.all((get(proj,'people.new') ?? [])
        .map(async ({id,realName,email,category})=>{
          return [id,await User.insert({realName,email,category})]
        })));

      ['people.proposers','people.leaders','people.involved'].forEach(
        (peopletype)=>update(proj,peopletype,
          (people)=>people.map(
            (personid)=>get(newpeople,personid,personid)
          )
        )
    )
    proj.lastUpdatedBy=currentuser
    proj.isVetted=!!proj.lastUpdatedBy.isAdmin
    proj.lastUpdated=new Date().toISOString()
    return Project.insert(proj)
  }
}} 
export default resolvers
