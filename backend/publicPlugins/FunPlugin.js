import {AyzekPlugin,command} from '../';
import Random from '@meteor-it/random';

import * as WHAT_START from './FunPlugin/what_start.yml';
import * as WHAT_END from './FunPlugin/what_end.yml';

import * as WHO_START from './FunPlugin/who_start.yml';
import * as WHO_END from './FunPlugin/who_end.yml';

import * as BETTER_START from './FunPlugin/better_start.yml';
import * as BETTER_END from './FunPlugin/better_end.yml';

export default class FunPlugin extends AyzekPlugin{
    static author='F6CF';
    static description='Бесполезные функции, рандом';

    @command({names:['what','что'], helpMessage: 'Узнать, что делает определённый пользователь'})
    async what(msg,args){
        let users=msg.chat.users.map(u=>`${u.firstName} ${u.lastName}`.toLowerCase());
        if(users.indexOf(args.join(' ').toLowerCase())===-1)
            return msg.sendText(true,'Этого пользователя нет в этом чате!');
        let u=args.join(' ').toLowerCase();
        let podstava;
        if(u==='александр мангустов')
            podstava='ебёт капусту.';
        if(u==='даня суслов')
            podstava='ебёт мангустов.';

        let random=new Random(args.join(' ').toLowerCase()+new Date().getMinutes()+new Date().getHours()+new Date().getDay());
        msg.sendText(true,`${random.randomArrayElement(WHAT_START)} ${podstava||random.randomArrayElement(WHAT_END)}`);
    }
    @command({names:['or','чтолучше','whatbetter'], helpMessage: 'Поможет определиться с выбором'})
    async or(msg,args){
        let u=args.join(' ').toLowerCase().split('или').map(e=>e.trim()).sort();
        if(u.length<=1){
            return msg.sendText(true,'Нет выбора');
        }
        let random=new Random(u.sort().join('|2'));
        msg.sendText(true,`${random.randomArrayElement(BETTER_START)} ${random.randomArrayElement(u)} ${random.randomArrayElement(BETTER_END)}`);
    }
    @command({names:['who','кто'], helpMessage:'Аналог функции из других ботов'})
    async who(msg,args){
        if(!msg.chat)
            return msg.sendText(true,'Ты один здесь!');
        if(args.length===0)
            return msg.sendText(true,'Щито? Ты ничего не написал!');
        let pr=args.map(a=>a.toLowerCase());
        if((pr[0]==='у'&&pr[1]==='кого')||(pr[0]==='кого')||(pr[0]==='кто'))
            return msg.sendText(true,'Я не разбираюсь в лексическом анализе, но ты определённо не умеешь строить предложения!');
        pr=pr.sort().join(',')+msg.chat.users.map(u=>u.firstName+u.lastName).join(';qq');
        let random=new Random(pr);
        let fullUsers;
        if(args.length===1)
            fullUsers=msg.chat.users.filter(u=>u.firstName===args[0]).map(user=>`[id${user.targetId}|${user.firstName} ${user.lastName}]`);
        if(!fullUsers||fullUsers.length===0)
            fullUsers=[...msg.chat.users.map(user=>`[id${user.targetId}|${user.firstName} ${user.lastName}]`),...WHO_END];
        msg.sendText(true,random.randomArrayElement(WHO_START)+' '+random.randomArrayElement(fullUsers));
    }
}