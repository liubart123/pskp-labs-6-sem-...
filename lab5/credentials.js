const credit = require('./credit.json')

const getCreadential = user=>{
    let found = credit.find(el=>el.name==user);
    return found;
}
const verifyPass=(p1,p2)=>{
    return p1==p2;
}

module.exports = {
    getCreadential,
    verifyPass
}