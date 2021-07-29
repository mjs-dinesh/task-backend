const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secret = 'd6F3Efeq'


function encrypt(text){
  var cipher = crypto.createCipher(algorithm, secret)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm, secret)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

 module.exports = {encrypt,decrypt}