import {CAC} from "cac";
import {execSync} from "child_process";
import {readConfig} from "@/utils";

export default function registerBuildPluginCommand(cli:CAC){
    cli.command('build <pluginName>','编译插件')
        .action(async (pluginName)=>{
            try{
                const config=await readConfig()
                execSync(`cd ${config.plugin_dir}/${pluginName} && npm run build`,{stdio:"inherit"})
            }catch (e){
                console.error('编译失败，错误信息：',e.message)
            }
            console.log('编译插件完成')
        })
}