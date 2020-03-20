/*eslint-env node*/

const got =require('got')
const categories={	airway:'Airway',
cc:'Critical Care',
ci:'Critical incidents',
ds:'Day surgery',
ed:'Education & training',
ent:'Ear, nose & throat',
eq:'Equipment',
gs:'General surgery',
gyn:'Gynaecology',
mgt:'Management',
obs:'Obstetrics',
ortho:'Orthopaedics',
pain:'Pain',
pom:'Peri-operative medicine',
qi:'Quality improvement',
reg:'Regional',
trauma:'Trauma',
urol:'Urology',
vasc:'Vascular',
other:'Other'}

const { sample, sampleSize }=require('lodash')
const { createHash } =require('crypto')
const PouchDB=require('pouchdb')
const fs=require('fs')
var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Argparse example'
});
parser.addArgument(
  [ '-u', '--users' ],
  {
    help: 'number of (non-admin) users to add'
  }
);
parser.addArgument(
  [ '-a', '--admins' ],
  {
    help: 'number of admin users to add'
  }
);
parser.addArgument(
  ['-p','--projects'],
  {
    help: 'projects to add'
  }
)

parser.addArgument(
    ['-d','--dbname'],
    {
        help: 'database name',
        defaultValue:'testdatabase'
    }
)
;
var args = parser.parseArgs();
console.dir(args);

function makeFakeUser(user) {
    const usertypes = ['FY1',
        'FY2',
        'ACCS',
        'Core',
        'Int',
        'Higher',
        'SAS',
        'Consultant']
    return {
        _id: 'user ' + user.login.md5,
        userName: user.username,
        realName: `${user.name.first} ${user.name.last}`,
        email: user.email,
        category: sample(usertypes)
    }
}

function makeFakeProject(lipsum, allusers) {
    const userids = {}
    var users = sampleSize(allusers, 5)
    const needslead = (Math.random() > 0.5)
    if (users.length == 1) {
        userids.leaders = needslead ? [] : [users[0]._id]
        userids.proposers = [users[0]._id]
        userids.involved = []
    } else {
        userids.leaders = needslead ? [] : [users[0]._id]
        userids.proposers = [users[1]._id]
        userids.involved = users.slice(2).map(u => u._id)
    }
    const dates = ([
        new Date(Date.now() - (Math.random() * 31536000000)).toISOString(),
        new Date(Date.now() - (Math.random() * 31536000000)).toISOString(),
        new Date(Date.now() - (Math.random() * 31536000000)).toISOString(),
        new Date(Date.now() + 15000000000 - (Math.random() * 31536000000)).toISOString()
    ]).sort()
    const cats = Object.keys(categories)
    const flags = [
		sample(['needsVetting', 'isVetted']),
		needslead ? 'needsLead' : null,
		Math.random() > 0.5 ? 'isRecruiting' : null,
		dates[3] < new Date().toISOString() ? 'isCompleted' : null,
		sample(['hasCaldicott', 'maybeCaldicott', 'pendingCaldicott', 'notCaldicott']),
		sample(['hasResearch', 'maybeResearch', 'pendingResearch', 'notResearch']),
		Math.random() > 0.5 ? 'criticalIncident' : null,
		Math.random() > 0.1 ? 'canDisplay' : 'hidden'
    ].filter((f) => (f !== null))
    return {
        _id: 'project ' + createHash('md5').update(lipsum).digest('hex'),
        title: lipsum.split(' ', 5).join(' '),
        people: userids,
        description: lipsum,
        dates: { proposed: dates[0], start: dates[1], finish: dates[3] },
        methodology: lipsum,
        category: sampleSize(cats, (Math.random() * 5) | 0 + 1),
        email: lipsum.split(' ', 2).join('@') + '.com',
        lastUpdated: dates[2],
        lastUpdatedBy: userids.proposers[0],
        flags
    }
}

async function populateDB({ dbname, users = 0, admins = 0, projects = 0 }) {
    const database=new PouchDB(dbname)
    const cats = Object.entries(categories).map(c => ({ _id: 'category ' + c[0], name: c[1] }))
    var newusers = [], newprojects = []
    if ((users + admins) > 0) {
        console.log('adding random users...')
        newusers = (JSON.parse((await got(`https://randomuser.me/api/?results=${users + admins}&nat=gb`)).body).results
            .map((rawuser, index) => {
                const newuser = makeFakeUser(rawuser)
                if (index > users) newuser.isAdmin = true
                return newuser
            }))


    }
    console.log(newusers)
    if (projects > 0) {
        console.log('adding random project info')
        if (newusers.length == 0) throw 'need fake users to generate fake projects'
        const rawlipsum=(await got(`https://lipsum.com/feed/json?what=paragraphs&amount=${projects}`)).body
        console.log(rawlipsum)
        const lipsum=JSON.parse(rawlipsum)
        

        newprojects = (lipsum.feed.lipsum.split('\n')
            .map((lipsum) => {
                return makeFakeProject(lipsum, newusers)

            }))

    }
    console.log('populating database')
    return `
	const testdata=${JSON.stringify(newusers.concat(newprojects).concat(cats))};
	export default testdata
	`
}
const path=require('path')
populateDB(args).then((data)=>fs.promises.writeFile(path.resolve(__dirname,'testdata.js'),data))