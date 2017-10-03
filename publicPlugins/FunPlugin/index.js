import {AyzekPlugin,command} from '../../';
import Random from '@meteor-it/random';
import {what, who, better} from './phrazes.yml';

export default class FunPlugin extends AyzekPlugin{
    static author='F6CF';
    static description='Бесполезные функции, рандом';

    @command({names:['what','что'], helpMessage: 'Узнать, что делает определённый пользователь'})
    async what(msg,args){
        let users=msg.chat.users.map(u=>`${u.firstName} ${u.lastName}`.toLowerCase());
        if(users.indexOf(args.join(' ').toLowerCase())===-1)
            return msg.sendText(true,'Этого пользователя нет в этом чате!');
        let random=new Random(args.join(' ').toLowerCase()+new Date().getMinutes()+new Date().getHours()+new Date().getDay());
        msg.sendText(true,`${random.randomArrayElement(what.start)} ${random.randomArrayElement(what.end)}`);
    }
    @command({names:['or','чтолучше','whatbetter'], helpMessage: 'Поможет определиться с выбором'})
    async or(msg,args){
        let u=args.join(' ').toLowerCase().split('или').map(e=>e.trim()).sort();
        if(u.length<=1){
            return msg.sendText(true,'Нет выбора');
        }
        let random=new Random(u.sort().join('|2'));
        msg.sendText(true,`${random.randomArrayElement(better.start)} ${random.randomArrayElement(u)}${random.randomArrayElement(better.end)}`);
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
            fullUsers=[...msg.chat.users.map(user=>`[id${user.targetId}|${user.firstName} ${user.lastName}]`)];
        msg.sendText(true,random.randomArrayElement(who.start)+' '+random.randomArrayElement(fullUsers));
    }
}