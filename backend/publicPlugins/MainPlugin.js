import {AyzekPlugin,command} from '../';

const PLUGINS_HELP=`/plugins - просмотр списка плагинов\n/plugins disable <название> - отключение плагина\n/plugins enable <название> - включение плагигна`;

export default class MainPlugin extends AyzekPlugin{
    static description='Плагин для управления плагинами.';
    @command({
        names: ['plugins', 'плагины'],
        helpMessage: 'Просмотр списка плагинов'
    })
    async plugins(msg, args) {
        if(args.length!==0){
            if(args[0]==='disable'){

            }else if(args[0]==='enable'){

            }else{
                await msg.sendText(true, 'Неверная команда!\n'+PLUGINS_HELP);
            }
        }else{
            let bot=this.bot;
            let plugins=bot.plugins.reduce((a,b)=>[...a,...b]).sort(comparePluginName).map(pl=>[pl.constructor.name,pl.constructor.author,pl.constructor.description]);
            let descs=plugins.map(([name,author,desc],id)=>`📕${name} от ${author}\n   ${desc}\n`).join('');
            descs=descs.replace(/DOT/g,'.');
            await msg.sendText(true, descs+'\n'+PLUGINS_HELP);
        }
    }
    @command({
        names: ['help', 'commands', 'команды','помощь','справка'],
        helpMessage: 'Просмотр списка плагинов'
    })
    async help(msg, args) {
        let bot=this.bot;
        let plugins=bot.plugins.reduce((a,b)=>[...a,...b]).sort(comparePluginName);
        let descs=``;
        plugins.forEach((plugin,id)=>{
            descs+=`📕${plugin.constructor.name} от ${plugin.constructor.author}\n`;
            plugin.handlers.commands.map(command=>`   🚌${command.names.map(cmd=>`${msg.commandPrefix}${cmd}`).sort().join(', ')} - ${command.helpMessage}`).sort().forEach(cmd=>{
                descs+=`${cmd}\n`;
            });
            plugin.handlers.regex.map(regex=>`   🤔${regex.regexes.map(regex=>regex.toString())} - ${regex.helpMessage}`).sort().forEach(regex=>{
                descs+=`${regex}\n`;
            });
        });
        descs=descs.replace(/DOT/g,'.');
        msg.sendText(true, descs);
    }
}

function comparePluginName(a,b) {
    if (a.constructor.name < b.constructor.name)
        return -1;
    if (a.constructor.name > b.constructor.name)
        return 1;
    return 0;
}
