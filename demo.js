const openpgp = require('openpgp');
const fs = require('fs');
var md5 = require('md5');

var md5hash;

function createKey(name, email, passphrase){
    (async () => {
        console.log(new Date(), "creating", name, "key pair");
        const { privateKey, publicKey, secret } = await openpgp.generateKey({
            type: 'rsa', // Type of the key
            rsaBits: 4096, // RSA key size (defaults to 4096 bits)
            userIDs: [{ name: name, email: email }], // you can pass multiple user IDs
            passphrase: passphrase // protects the private key
        });

        fs.writeFileSync("keys/" + name + "_rsa_id", privateKey);
        fs.writeFileSync("keys/" + name + "_rsa_id.pub", publicKey);
    })();
}

function initKeys(){
    createKey( 'Intermediary', 'test@intermediary.com' , 'super long and hard to guess secret');
    createKey( 'Final-customer', 'test@finalcustomer.com' , 'another super long and hard to guess secret');
    createKey( 'Data-provider', 'test@dataprovider.com' , 'third super long and hard to guess secret');
}

function readPublicKey(name){
    return fs.readFileSync("keys/" + name + "_rsa_id.pub", {encoding:'utf8', flag:'r'})
}
function readPrivateKey(name){
    return fs.readFileSync("keys/" + name + "_rsa_id", {encoding:'utf8', flag:'r'})
}

function cryptFileWithTwoKeys(file){
    (async () => {
        const publicKeysArmored = [
           readPublicKey("Intermediary"),
           readPublicKey("Final-customer")
        ];
        const privateKeyArmored = readPrivateKey("Data-provider");    // encrypted private key
        const passphrase = `third super long and hard to guess secret`; // what the private key is encrypted with
        const datafile = new Uint8Array(fs.readFileSync("data/" + file).buffer) //, {encoding:'utf8', flag:'r'})
        md5hash = md5(datafile);
        console.log("hash before encryption is", md5hash);
    
        const publicKeys = await Promise.all(publicKeysArmored.map(armoredKey => openpgp.readKey({ armoredKey })));
    
        const privateKey = await openpgp.decryptKey({
            privateKey: await openpgp.readKey({ armoredKey: privateKeyArmored }),
            passphrase
        });

        console.log(datafile)

        const message = await openpgp.createMessage({ binary: datafile });
        //const message = await openpgp.createMessage( { binary: new Uint8Array([0x01, 0x01, 0x01]) });
    
        const encrypted = await openpgp.encrypt({
            message, // input as Message object
            encryptionKeys: publicKeys,
            signingKeys: privateKey, // optional,
            format: 'binary'
        });
        fs.writeFileSync("data/encrypted.data", encrypted, {encoding:'utf8'})
    })();
    
}


function decrypt(name, signer, passphrase){
    (async () => {
        // put keys in backtick (``) to avoid errors caused by spaces or tabs
        const publicKeyArmored = readPublicKey(signer);
        const privateKeyArmored = readPrivateKey(name); // encrypted private key

        const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
        const privateKey = await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
            passphrase
        });

        const encrypted = new Uint8Array(fs.readFileSync("data/encrypted.data").buffer); //, {encoding:'utf8', flag:'r'})

        const message = await openpgp.readMessage({
            binaryMessage: encrypted // parse armored message
        });

        const { data: decrypted, signatures } = await openpgp.decrypt({
                message: message,
                verificationKeys: publicKey,
                decryptionKeys: privateKey, // decrypt with password
                format: 'binary' // output as Uint8Array
            }
        );

        fs.writeFileSync("data/" + name + "_decrypted.data", decrypted)

        const hashVerification = md5(decrypted);
        console.log(name, hashVerification == md5hash ? "hash verification is correct":"wrong hash", hashVerification)

        // check signature validity (signed messages only)
        try {
            await signatures[0].verified; // throws on invalid signature
            console.log(name, "verified", signer, 'Signature is valid', signatures[0]);
        } catch (e) {
            throw new Error(name, 'Signature could not be verified');
        }
    })();
}


console.log(new Date(), "initializing private and public keys")
initKeys(); // creates keys for both three partecipants
setTimeout(function(){ // waits 5 seconds and then crypts data with created keys
    console.log(new Date(), "encrypting data")
    cryptFileWithTwoKeys("annual-enterprise-survey-2020-financial-year-provisional-csv.csv");
}, 5000)
setTimeout(function(){ // waits 5 more seconds and then decrypts data with both keys and checks signatures and md5hash
    console.log(new Date(), "decrypting data and checking md5 hashes")
    decrypt("Intermediary", 'Data-provider', 'super long and hard to guess secret');
    decrypt("Final-customer", 'Data-provider', 'another super long and hard to guess secret');
}, 10000)

