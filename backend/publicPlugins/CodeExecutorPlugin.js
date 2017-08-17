import {AyzekPlugin,command} from '../';
import {promisify} from 'util';
import {exec} from 'child_process';

export default class CodeExecutorPlugin extends AyzekPlugin{
    static author='F6CF';
    static description='Для разработчиков';
    @command({names:['exec'],helpMessage:'Выполнить код'})
    async exec(msg,args){
        let lang=args[0];
        if(!['js','python2','python3','c','cpp','bash'].includes(lang))
            return await msg.sendText(true,'Неверный язык!');
        let code=msg.text.substr(msg.text.indexOf(lang)+lang.length+1);
        let dockerCommand=`docker run -c 153 -m=20480 -e LANG=${lang} -e CODE="${Buffer.from(code).toString('base64')}" eval`;
        try{
            let data=await promisify(exec)(dockerCommand,{
                timeout: 30000,
                maxBuffer: 2000,
                killSignal:9
            });
            await msg.sendText(true,`${data.stdout.trim()}\n${data.stderr.trim()}`.trim());
        }catch(e){
            if(e.message.includes('maxBuffer'))
                await msg.sendText(true,'Вывод команды не влез в лимит! (2000 символов)');
            else
                await msg.sendText(true,'Команда не выполнилась за 30 секунд');
        }
    }
}