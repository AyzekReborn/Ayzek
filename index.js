import {flatten} from '@meteor-it/utils';
import XBot from '@meteor-it/xbot';
import Logger from '@meteor-it/logger';
import NodeLogger from '@meteor-it/logger/receivers/node';
Logger.addReceiver(new NodeLogger());

const POSSIBLE_MIDDLEWARES=['pre','post'];
const FAIL_STR = [
    '▄██████████████▄▐█▄▄▄▄█▌',
    '██████▌▄▌▄▐▐▌███▌▀▀██▀▀',
    '████▄█▌▄▌▄▐▐▌▀███▄▄█▌',
    '▄▄▄▄▄██████████████▀'
].join('\n');

export default class Ayzek extends XBot {
    plugins=[];
    apis=[];
    banned=[];
    shared={};
    waitLocks={};
    constructor(){
        super('ayzek');
        this.on('message',this.ayzekOnMessage.bind(this));
        // TODO: Look at xbot changes
        // this.on('title',this.ayzekOnTitle.bind(this));
        // this.on('photo',this.ayzekOnPhoto.bind(this));
        // this.on('join',this.ayzekOnJoin.bind(this));
        // this.on('leave',this.ayzekOnLeave.bind(this));
        // this.on('action',this.ayzekOnAction.bind(this));
    }

    onWaitNext(message,onCommandUseText){
        return new Promise(resolve=>{
            if(message.isUser){
                // Wait message from user
                this.waitLocks[message.uid]=[resolve,onCommandUseText];
            }else{
                // Wait a message from chat
                this.waitLocks[message.cid]=[resolve,onCommandUseText];
            }
        });
    }

    async addPluginLoader(pluginLoader){
        let currentPluginLoaderPlugins=[];
        currentPluginLoaderPlugins=await pluginLoader.load({
            ...this.shared,
            bot:this
        });
        this.plugins.push(currentPluginLoaderPlugins);
    }
    getPlugins(){
        return flatten(this.plugins);
    }
    async executeMiddlewares(event,msg,user,chat,sourceApi){
        let timing=msg.timing;
        timing.start('Get plugins');
        let plugins=this.getPlugins();
        timing.stop();
        let id=0;
        for(let plugin of plugins){
            if(!await plugin.executeMiddlewares(event,msg,user,chat,sourceApi)){
                return false;
            }
            id++;
        }
        return true;
    }
    async ayzekOnMessage(message){
        let timing=message.timing;
        timing.stop();
        if(!await this.executeMiddlewares('pre',message,message.user,message.chat,message.sourceApi))
            return;
        if(message.text.replace(/[!/]+/g,'').trim()!==''&&(message.text[0]==='/'||message.text[0]==='!')){
            message.commandPrefix=message.text[0];
            message.text=message.text.substr(1);
            await this.ayzekOnCommand(message);
        }else{
            await this.ayzekOnPlain(message);
        }
        if(!await this.executeMiddlewares('post',message,message.user,message.chat,message.sourceApi))
            this.logger.warn(`"post" event is executed and returned false. Why?`);
    }
    async ayzekOnCommand(message){
        if(this.waitLocks[message.user.uid])
            return await message.sendText(true,this.waitLocks[message.user.uid][1]);
        if(message.chat)
            if(this.waitLocks[message.chat.cid])
                return await message.sendText(true,this.waitLocks[message.chat.cid][1]);
        let text=message.text;
        let parts=flatten(text.split(' ').map(d=>d.split('\n')));
        let cmd=parts[0].toLowerCase();
        let args=parts.slice(1);
        try{
            let plugins=this.getPlugins();
            let found=false;
            for(let plugin of plugins){
                if(await plugin.executeCommands(cmd,args,message,message.user,message.chat,message.sourceApi)){
                    found=true;
                    break;
                }
            }
            if(!found){
                await message.sendText(false,'Нeизвестнaя команда! Введи /help для просмотра списка команд!');
            }
        }catch(e){
            message.sendText(false,`${FAIL_STR}\nПри исполнении команды произошла ошибка: ${e.stack}`);
            this.logger.error(e.stack);
            return;
        }
    }
    async ayzekOnPlain(message){
        if(this.waitLocks[message.user.uid]){
            this.waitLocks[message.user.uid][0](message);
            delete this.waitLocks[message.user.uid];
            return;
        }
        if(message.chat&&this.waitLocks[message.chat.cid]){
            this.waitLocks[message.chat.cid][0](message);
            delete this.waitLocks[message.chat.cid];
            return;
        }
        try{
            let plugins=this.getPlugins();
            for(let plugin of plugins){
                await plugin.executeListeners(message,message.user,message.chat,message.sourceApi);
            }
        }catch(e){
            message.sendText(false,`${FAIL_STR}\nПри исполнении обработчика произошла ошибка: ${e.stack}`);
            this.logger.error(e.stack);
            return;
        }
    }
}

export class AyzekPlugin{
    _logger;
    _handlers;
    bot;
    influx;
    mongo;
    redis;
    file;
    get handlers(){
        if(this._handlers)
            return this._handlers;
        return this._handlers={
            commands:[],
            regex:[],
            middlewares:{

            },
            events:{

            }
        };
    }
    get logger(){
        if(this._logger)
            return this._logger;
        return this._logger=new Logger(this.constructor.name);
    }
    //Stats
    getCommandCount(){
        return Object.keys(this.commands).length;
    }
    getListenerCount(){
        return Object.keys(this.listeners).length;
    }
    //Regex
    addListener(listener){
        this.handlers.regex.push(listener);
    }
    getListeners(text,user,chat,sourceApi){
        let filtered=(this.handlers.regex.filter(lis=>lis.canHandle(text))).filter(lis=>lis.filter(user,chat,sourceApi));
        return filtered;
    }
    async executeListeners(msg,user,chat,sourceApi){
        let handlers=this.getListeners(msg.text,user,chat,sourceApi);
        for(let handler of handlers){
            await handler.execute(this,msg);
        }
    }
    //Event
    addEventListener(event,listener){
        if(!this.handlers.events[event])
            this.handlers.events[event]=[];
        this.handlers.events[event].push(listener);
    }
    //Middlewares
    addMiddleware(event,listener){
        this.hasMiddlewares=true;
        if(!this.handlers.middlewares[event])
            this.handlers.middlewares[event]=[];
        this.handlers.middlewares[event].push(listener);
    }
    getMiddlewares(event,user,chat,sourceApi){
        let filtered= (this.handlers.middlewares[event]||[]).filter(middleware=>middleware.filter(user,chat,sourceApi));
        return filtered;
    }
    async executeMiddlewares(event,msg,user,chat,sourceApi){
        let middlewares=this.getMiddlewares(event,user,chat,sourceApi);
        for(let middleware of middlewares){
            let middlewareResult=await middleware.execute(this,msg);
            if(middlewareResult!==true&&middlewareResult!==false)
                throw new Error('Middleware must return true (to continue execution) or false (to stop execution)!');
            if(!middlewareResult)
                return false; // Do NOT execute command
        }
        return true; // Do command execution
    }
    //Commands
    hasCommand(command){
        return this.handlers.commands.filter(cmd=>cmd.canHandle(command)).length!==0;
    }
    getCommands(command,user,chat,sourceApi){
        let filtered=(this.handlers.commands.filter(cmd=>cmd.canHandle(command))).filter(cmd=>cmd.filter(user,chat,sourceApi));
        return filtered;
    }
    async executeCommands(command,args,msg,user,chat,sourceApi){
        let commands=this.getCommands(command,user,chat,sourceApi);
        if(commands.length>1)
            throw new Error('Have you modified command list manually?');
        if(commands.length===0)
            return false;
        // TODO: Handle state
        await commands[0].execute(this,msg,args);
        return true;
    }
    addCommand(listener){
        this.handlers.commands.push(listener);
    }
}

export class Listener {
    key;
    regexes;
    filter;
    helpMessage;
    constructor({helpMessage,filter=(user,chat,adapter)=>true,regexes=[/[\s\S]*/g]}){
        if(!helpMessage)
            throw new Error('helpMessage is not defined!');
        if(filter.length!==3)
            throw new Error('filter() function must receive 3 arguments! I.e (user,chat,adapter)=>true');
        this.helpMessage=helpMessage;
        this.filter=filter;
        this.regexes=regexes;
    }
    canHandle(text){
        for(let regex of this.regexes)
            if(regex.test(text))
                return true;
        return false;
    }
    setKey(key){
        this.key=key;
    }
    async execute(pluginContext,msg){
        let matches=[1];
        for(let regex of this.regexes)
            if(regex.test(msg.text)===true){
                matches=msg.text.match(regex);
                break;
            }
        return await pluginContext[this.key](msg,matches.slice(1));
    }
}
class Command {
    names;
    helpMessage;
    filter;
    args;
    states={};
    constructor({names=[],helpMessage,args=[],filter=(user,chat,adapter)=>true}){
        if(names.length===0)
            throw new Error('names.length === 0!');
        if(!helpMessage)
            throw new Error('helpMessage is not defined!');
        if(filter.length!==3)
            throw new Error('filter() function must receive 3 arguments! I.e (user,chat,adapter)=>true');
        if(!(names instanceof Array))
            throw new Error('names must be array of strings!');
        for(let commandName of names){
            if(commandName.indexOf(' ')+1)
                throw new Error(`Command "${commandName}" contains space!`);
        }
        this.names=names;
        this.helpMessage=helpMessage;
        this.args=args;
        this.filter=filter;
    }
    addState(name,key){
        if(this.states[name])
            throw new Error('State '+name+' already exists!');
        this.states[name]=key;
    }
    canHandle(name){
        return this.names.indexOf(name)!==-1;
    }
    async execute(pluginContext,msg,args){
        // TODO: State locks
        return await pluginContext[this.states.initial](msg,args);
    }
}
class Middleware {
    filter;
    key;
    fun;
    constructor({key,event,fun,filter=(user,chat,adapter)=>true}){
        if(!key)
            throw new Error('key is not defined!');
        if(filter.length!==3)
            throw new Error('filter() function must receive 3 arguments! I.e (user,chat,adapter)=>true');
        this.key=key;
        this.fun=fun;
        this.event=event;
        this.filter=filter;
    }
    async execute(pluginContext, msg){
        return await pluginContext[this.key](msg);
    }
}
export function command(data) {
    return function(target,key,descriptor) {
        const command=new Command(data);
        command.addState('initial',key);
        target.addCommand(command);
        return descriptor;
    };
}
export function commandState(name,state) {
    return function(target,key,descriptor) {
        let command=target.findCommand(name);
        if(!command)
            throw new Error('Command is not defined!');
        command.addState(state,key);
        return descriptor;
    };
}

export function listener(data) {
    return function(target,key,descriptor) {
        const listener=new Listener(data);
        listener.setKey(key);
        target.addListener(listener);
        return descriptor;
    };
}
export function on(event,filter=(user,chat,adapter)=>true){
    return function(target,key,descriptor) {
        if(filter.length!==3)
            throw new Error('filter() function must receive 3 arguments! I.e (user,chat,adapter)=>true');
        target.logger.debug(`on(Event: ${event},Key: ${key}) executed`);
        target.addEventListener(event,{key,filter});
        return descriptor;
    };
}
export function middleware(data){
    return function(target,key,descriptor) {
        console.log(target);
        if(!data.event)
            throw new Error('event is not defined!');
        const middleware=new Middleware({
            ...data,
            key
        });
        target.addMiddleware(data.event,middleware);
        return descriptor;
    };
}

if(require.main.filename===__filename){
    new Logger('ERR').error('Create your own starter class!');
    process.exit(0);
}
process.on('unhandledException',e=>{
    console.error(e.stack);
});
process.on('unhandledRejection',e=>{
    console.error(e.stack);
});

process.on('uncaughtException',e=>{
    console.error(e.stack);
});
process.on('uncaughtRejection',e=>{
    console.error(e.stack);
});