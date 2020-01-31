const crypto = require('crypto');
const fs = require('fs')
const path=require('path')
const lodash=require('lodash')
require('dotenv').config();

const algorithm = process.env.DECRYPTION_CIPHER;
const key=Buffer.from(process.env.DECRYPTION_KEY,'base64');
const rootsourcedir=path.resolve(process.env.SECRET_DIR)
const destfile=path.resolve(process.env.VAULT_NAME)
const destinations={}
function crawldir(sourcedir,destpath){
	console.log('Directory:'+sourcedir)
	fs.readdirSync(sourcedir).forEach((file)=>{
		var keyName=lodash.camelCase(file.replace(/(^.+)\..+?$/,"$1"))
		if (fs.statSync(path.resolve(sourcedir,file)).isDirectory()){
			if (!fs.existsSync(path.resolve(destdir,file))) fs.mkdirSync(path.resolve(destdir,file))
				crawldir(path.resolve(sourcedir,file),destpath.concat([keyName]))
		}else{
			try{
				const cipher = crypto.createCipher(algorithm, key);
				const input = fs.readFileSync(path.resolve(sourcedir,file));
				output = cipher.update(input,'utf8','base64')+cipher.final('base64')
				destinations[[...destpath,keyName].join('.')]=output;
				console.log('Saved '+file+' as '+keyName)
			}catch(e){
				console.warn(file+' could not be processed - skipping...')
			}
		}
	})
}
	
function getSecret(secretName){
	const decryptionKey=process.env.DECRYPTION_KEY
	const cipher=process.env.DECRYPTION_CIPHER  
	var decrypter=require('crypto').createDecipher(cipher,Buffer.from(decryptionKey,'base64'))
	var decrypted=decrypter.update(secrets[secretName],'base64','utf8')
	decrypted+=decrypter.final('utf8')
	return JSON.parse(decrypted)
}	
	
crawldir (rootsourcedir,[])

fs.writeFileSync(destfile,`secrets=${JSON.stringify(destinations)}
	${getSecret.toString()}
	module.exports= getSecret
	`)
	