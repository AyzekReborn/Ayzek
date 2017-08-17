import {AyzekPlugin,listener} from '../';
import {File} from '@meteor-it/xbot';
import {emit} from '@meteor-it/xrest';
import Random from '@meteor-it/random';

const random=new Random();

export default class QuickSearchPlugin extends AyzekPlugin{
    static author='F6CF';
    static description='Защита бота от падений';
    a=123;
    @listener({regexes:[/\.gif$/i,/\.гиф$/i],helpMessage:'Поиск гифок'})
    async gifSearch(msg,match){
        let find=msg.text.slice(0,msg.text.lastIndexOf('.'));
        let {body}=await emit(`GET https://api.tenor.com/v1/search`,{
            query:{
                q: find,
                key: 'LIVDSRZULELA' // Public api key, all users have same
            }
        });
        if(body.results.length===0)
            return await msg.sendText(true,'Гифка не найдена D:');
        let gif=random.randomArrayElement(body.results);
        if(!gif.media)
            return await msg.sendText(true,'Гифка не найдена D:');
        // Ugly code... Special for vk
        try{
            let buffer=await emit(`GET ${gif.media[0].gif.url}`);
            await msg.sendFile(true,'',await File.fromBuffer(buffer.raw,find+'.gif','image/gif'));
        }catch(e){
            try{
                let buffer=await emit(`GET ${gif.media[0].mediumgif.url}`);
                await msg.sendFile(true,'',await File.fromBuffer(buffer.raw,find+'.gif','image/gif'));
            }catch(e){
                try{
                    let buffer=await emit(`GET ${gif.media[0].nanogif.url}`);
                    await msg.sendFile(true,'',await File.fromBuffer(buffer.raw,find+'.gif','image/gif'));
                }catch(e){
                    return await msg.sendText(true,'Ёбаный рот этого казино');
                }
            }
        }
    }
}