import {CAC} from "cac";
import {execSync} from "child_process";
import {basePath, readConfig} from "@/utils";

export function registerBuildPluginCommand(cli:CAC){
    cli.command('build <pluginName>','编译插件')
        .action(async (pluginName)=>{
            try{
                const config=await readConfig()
                await execSync(`cd ${config.plugin_dir}/${pluginName} && npm run build`,{cwd:basePath,stdio:[0,1,2]})
            }catch (e){
                console.error('编译失败，错误信息：',e.message)
            }
            console.log('编译插件完成')
        })
}