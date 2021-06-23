const crypto =require('crypto');


module.exports.cipherFile = (rs,ws,key)=>
{
    const alg ='aes-256-cbc';
    const piv = Buffer.alloc(16,0);
    const pk = key? key:crypto.randomBytes(32);
    const ch = crypto.createCipheriv(alg,pk,piv);
    rs.pipe(ch).pipe(ws);
}

module.exports.decipherFile = (rs,ws,key,iv,cb)=>
{
    const alg ='aes-256-cbc';
    const piv = iv?iv:Buffer.alloc(16,0);
    const dch = crypto.createDecipheriv(alg,key,piv);
    rs.pipe(dch).pipe(ws);
}