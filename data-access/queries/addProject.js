mutation addProject($project: ProjectInput!) {
  addProject(project: $project) {
    id
    title
    people {
      leaders {
        id
        realName
        userName
      }
      involved {
        id
        realName
        userName
      }
    }
    description
    category {
      name
    }
    flags
  }
}
