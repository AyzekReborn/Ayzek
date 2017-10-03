import {WebpackPluginLoader} from '@meteor-it/plugin-loader';
import {AyzekPlugin,Listener} from '../';
import scopedHttpClient from 'scoped-http-client';

function wrapMsg(message,match){
    return {
        send(text){
            message.sendText(false,text);
        },
        reply(text){
            message.sendText(true,text)
        },
        http(url){
            return scopedHttpClient.create(url)
        },
        match
    }
}
function hubotToAyzek(module,file):AyzekPlugin{
    let hubotPluginClass=(class extends AyzekPlugin{});
    Object.defineProperty(hubotPluginClass, "name", { value: file});
    Object.defineProperty(hubotPluginClass, "author", { value: 'Поддержка Hubot плагинов'});
    Object.defineProperty(hubotPluginClass, "description", { value: 'Данный плагин подключён с помощью поддержки плагинов Hubot'});
    let brain={
        data:{},
        set(key,data){
            brain.data[key]=data;
        },
        get(key){
            return brain.data[key];
        }
    };
    let hubotPlugin=new hubotPluginClass();
    let keyId=0;
    let robot={
        respond(regex,callback){
            let listener=new Listener({
                helpMessage:'Hubot не поддерживает описания',
                regexes:[regex]
            });
            let id=keyId++;
            let txtId='hubotListener'+id;
            listener.setKey(txtId);
            hubotPlugin[txtId]=(msg)=>{
                callback(wrapMsg(msg,msg.text.match(regex)));
            }
            hubotPlugin.addListener(listener);
        },
        // TODO: Difference between respond and hear?
        hear(regex,callback){
            robot.respond(regex,callback);
        },
        brain
    };
    module(robot);
    return hubotPlugin;
}
export default class HubotPluginSystem extends WebpackPluginLoader {
    async customReloadLogic(key, module, reloaded) {
        this.logger.ident(key);
        if (!reloaded) {
            this.logger.log(`${key} is loading`);
            if (module.default)
                module = module.default;
            let plugin=hubotToAyzek(module,key);
            plugin.file=key;
            this.plugins.push(plugin);
        }
        else {
            this.logger.log(`${key} is reloading`);
            if (module.default)
                module = module.default;
            let plugin=hubotToAyzek(module,key);
            plugin.file=key;
            let alreadyLoaded = this.plugins.filter(pl => pl.file === key);
            if (alreadyLoaded.length === 0) {
                this.logger.warn('This plugin wasn\'t loaded before, may be reload is for fix');
            }
            else {
                this.logger.log('Plugin was loaded before, unloading old instances');
                let instances = this.plugins.length;
                for(let alreadyLoadedPlugin of alreadyLoaded){
                    // // Deinit plugin
                    // if(!alreadyLoadedPlugin.deinit){
                    //     this.logger.log('Plugin has no deinit() method, skipping call');
                    // }else{
                    //     this.logger.log('Calling deinit()');
                    //     await alreadyLoadedPlugin.deinit();
                    // }
                    // Remove from list
                    this.plugins.splice(this.plugins.indexOf(alreadyLoadedPlugin), 1);
                }
                let newInstances = this.plugins.length;
                if (instances - newInstances !== 1) {
                    this.logger.warn('Eww... found non 1 plugin instance in memory. May be it is error? Instances found=' + (instances - newInstances));
                }
                else {
                    this.logger.log('Plugin unloaded');
                }
            }
            // if (!plugin.init) {
            //     this.logger.log('Plugin has no deinit() method, skipping call');
            // }else{
            //     this.logger.log('Calling init()');
            //     await plugin.init();
            // }
            this.plugins.push(plugin);
        }
        this.logger.deent();
    }
}