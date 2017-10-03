import {AyzekPlugin,middleware} from '../../';
import AJSON from '@meteor-it/ajson';

export default class State extends AyzekPlugin{
    static description='Хранилище состояния пользователей.';
    stateCache=new Map()

    async loadStateFor(userChat,idField){
        if(this.stateCache.has(userChat[idField])){
            userChat.state=this.stateCache.get(userChat[idField]);
            return;
        }
        this.logger.warn(`State for ${userChat[idField]} is not cached`);
        let loadedState=await this.redis.hget('ayzek.state',userChat[idField]);
        if(!loadedState)
            loadedState={};
        else
            loadedState=AJSON.parse(loadedState);
        this.stateCache.set(userChat[idField],loadedState);
        userChat.state=loadedState;
        this.logger.warn(`Now loaded and added to cache`);
        return;
    }

    @middleware({event:'pre'})
    async pre(data){

        let uid=data.user.uid;
        let waits=[];
        waits.push(this.loadStateFor(data.user,'uid'));
        if(data.chat)
            waits.push(this.loadStateFor(data.chat,'cid'));
        if(data.replyTo)
            waits.push(this.loadStateFor(data.replyTo.sender,'uid'));

        await Promise.all(waits);
        if(data.chat){
            data.state=data.chat.state;
        }else{
            data.state=data.user.state;
        }
        return true;
    }
    @middleware({event:'post'})
    async post(data){
        let waiting=[
            this.redis.hset('ayzek.state',data.user.uid,AJSON.stringify(data.user.state)),
        ];
        if(data.chat){
            waiting.push(this.redis.hset('ayzek.state',data.chat.cid,AJSON.stringify(data.chat.state)));
        }
        if(data.replyTo)
            waiting.push(this.redis.hset('ayzek.state',data.replyTo.sender.uid,AJSON.stringify(data.replyTo.sender.state)));
        await Promise.all(waiting);
        return true;
    }
}
