import got from 'got'
import categories from './lib/taglist'
import { sample, sampleSize } from 'lodash'
import { createHash } from 'crypto'

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
        realName: `${user.first} ${user.last}`,
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
    const flags = [sample('needsVetting', null),
    needslead ? 'needsLead' : null,
    Math.random() > 0.6 ? 'isRecruiting' : null,
    dates[3] < new Date().toISOString() ? 'isCompleted' : null,
    sample(['hasCaldicott', 'maybeCaldicott', 'pendingCaldicott', 'notCaldicott']),
    sample(['hasResearch', 'maybeResearch', 'pendingResearch', 'notResearch']),
    Math.random() > 0.5 ? 'criticalIncident' : null,
    Math.random() > 0.3 ? 'canDisplay' : null
    ].filter((f) => (f !== null))
    return {
        _id: 'project ' + createHash(lipsum),
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

async function populateDB(database, { users = 0, admins = 0, projects = 0 }) {
    const cats = Object.entries(categories).map(c => ({ _id: 'category ' + c[0], name: c[1] }))
    var newusers = [], newprojects = []
    if ((users + admins) > 0) {
        newusers = (JSON.parse((await got(`https://randomuser.me/api/?results=${users + admins}&nat=gb`)).body).results
            .map((rawuser, index) => {
                const newuser = makeFakeUser(rawuser)
                if (index > users) newuser.isAdmin = true
            }))


    }
    if (projects > 0) {
        if (newusers.length == 0) throw 'need fake users to generate fake projects'
        newprojects = (JSON.parse((await got(`https://lipsum.com/feed/json?what=paragraphs&amount=${projects}`)).body).feed.lipsum.split('\n')
            .map((lipsum) => {
                return makeFakeProject(lipsum, newusers)

            }))

    }
    return Promise.all([
        database.bulkDocs(newusers),
        database.bulkDocs(newprojects),
        database.bulkDocs(cats)
    ])
}

export default populateDB