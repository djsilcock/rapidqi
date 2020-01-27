
module.exports=function(source){ 
  const decryptionKey=Json=process.env.DECRYPTION_KEY
  const cipher=process.env.DECRYPTION_CIPHER || 'aes-192-cbc'
  
  var decrypter=require('crypto').createDecipher(cipher,Buffer.from(decryptionKey,'base64'))
  var decrypted=decrypter.update(source,'base64','utf8')
  var decrypted+=decrypter.final('utf8')
  console.log('decrypted:'+decrypted)
  return decrypted
}
