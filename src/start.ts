import {CAC} from "cac";
import {basePath, promisify} from "@/utils";
import {exec} from "child_process";

export default function registerStartCommand(cli:CAC){
    cli.command('start','启动知音')
        .action(async ()=>{
            try{
                await promisify(exec(`cd ${basePath} && npm run start:zhin`))
            }catch (e) {
                console.error('启动失败')
                console.error('检查依赖是否正确安装')
                console.error('错误信息：',e)
            }
        })
}