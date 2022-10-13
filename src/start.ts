import {CAC} from "cac";

export default function registerStartCommand(cli:CAC){
    cli.command('start','启动知音')
        .action(async ()=>{
            try{
                require('zhin').createWorker()
            }catch (e) {
                console.error('启动失败')
                console.error('检查依赖是否正确安装')
                console.error('错误信息：',e)
            }
        })
}