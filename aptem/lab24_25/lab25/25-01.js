//https://ru.stackoverflow.com/questions/935212/powershell-выполнение-сценариев-отключено-в-этой-системе
// npm init --y
// npm : Невозможно загрузить файл C:\Users\Admin\AppData\Roaming\npm\npm.ps1, так как выполнение сценариев отключено в этой системе. Для получен
// ия дополнительных сведений см. about_Execution_Policies по адресу https:/go.microsoft.com/fwlink/?LinkID=135170.
// строка:1 знак:1
// + npm init --y
// + ~~~
//     + CategoryInfo          : Ошибка безопасности: (:) [], PSSecurityException
//     + FullyQualifiedErrorId : UnauthorizedAccess



//https://stackoverflow.com/questions/18233835/creating-an-x509-v3-user-certificate-by-signing-csr
//Creating an x509 v3 user certificate by signing CSR
//иначе генерировался v1, а в нём нет дополнений (те же DNS)




//примерн так монжо сгенерировать сертификат по запросу, ключу и расширениям
//openssl x509 -req -days 365 -in cert-sign-req-gav.csr -signkey secured-private-key-gav.key -out cert-gav.crt -extfile extensions-gav.ext

//после этого открыл .crt и нажал установить (выбрал глобальные)
//под "глобальные" я имел в виду, что происходила установка не под ткущего пользователя, а на компьютер
//не уверен, это то обязательно, но выбирал в качестве хранилища "Доверенные корневые центры сертификации"

//при заупске главное н забыть указать порт, атккак иначе перекинет на простой localhost, а там iis будет


// если указать в качестве адреса localhost:<port>, то будет проблма:
// Your connection is not private
// Attackers might be trying to steal your information from localhost (for example, passwords, messages, or credit cards).

// NET::ERR_CERT_COMMON_NAME_INVALID

//свзяана эта проблема с тем, что в расширениях сертификата в DNS именах нет localhost

//воТ, что будет при этм выводиться в ноебработанных ошибках:
//Error: 8544:error:14094416:SSL routines:ssl3_read_bytes:sslv3 alert certificate unknown:c:\ws\deps\openssl\openssl\ssl\record\rec_layer_s3.c:1544:SSL alert number 46


const https = require('https');

const express = require('express');

const fs = require('fs');

const app = express();

const PORT = 5000;

app.get('/', (req, res, next) => {

    res.send('Secured by https');
})

app.use((err, req, res, next) => {
    console.error(err.message);
    res.json({message: err.message});
})

//при использовании ключа, который был защищён (des с паролем)
// _tls_common.js:149
//       c.context.setKey(key, passphrase);
//                 ^
// Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt
//     at Object.createSecureContext (_tls_common.js:149:17)
//     at Server.setSecureContext (_tls_wrap.js:1323:27)
//     at Server (_tls_wrap.js:1181:8)
//     at new Server (https.js:66:14)
//     at Object.createServer (https.js:91:10)
//     at Object.<anonymous> (E:\Programs\Microsoft Visual Studio\Projects\PSCP\lab-https\22-01.js:39:22)
//     at Module._compile (internal/modules/cjs/loader.js:1076:30)
//     at Object.Module._extensions..js (internal/modules/cjs/loader.js:1097:10)
//     at Module.load (internal/modules/cjs/loader.js:941:32)
//     at Function.Module._load (internal/modules/cjs/loader.js:782:14) {
//   opensslErrorStack: [ 'error:0906A065:PEM routines:PEM_do_header:bad decrypt' ],
//   library: 'digital envelope routines',
//   function: 'EVP_DecryptFinal_ex',
//   reason: 'bad decrypt',
//   code: 'ERR_OSSL_EVP_BAD_DECRYPT'
// }

const path = require('path');

const RESOURCE_PRIVATE_KEY_PATH = '/LLH.key';
const RESOURCE_CERTIFICATE_PATH = '/LLH.crt';

//когда случайно использовал не ту пару ключ-сертификат
//Error: error:0B080074:x509 certificate routines:X509_check_private_key:key values mismatch
const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, RESOURCE_PRIVATE_KEY_PATH)),
    cert: fs.readFileSync(path.join(__dirname, RESOURCE_CERTIFICATE_PATH))
}, app);



process.on('uncaughtException', (err) => {
    console.error(JSON.stringify(err));
})



//NET::ERR_CERT_COMMON_NAME_INVALID будет отдаваться, если зайти на localhost, так как не совпадает CN (common name) с посещаемым доменом

//из Edge просто не обрабатывало (н могло найти), но в ID работало адекватно (localhost - опасно, а ca-lab22-... - нормально)

server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} port`);
})

server.on('secureConnection', (tlsSocket) => {
    console.dir(tlsSocket);
})

server.on('tlsClientError', (err, tlsSocket) => {
  
    console.error(`${err.name}: ${err.message}`);
    // console.dir(tlsSocket);
})