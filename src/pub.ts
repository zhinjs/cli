import {CAC} from "cac";
import {exec} from "child_process";
import {basePath,promisify, readConfig} from "@/utils";
import {resolve} from "path";
import {existsSync, readFileSync, writeFileSync} from "fs";

export function registerPubPluginCommand(cli:CAC){
    cli.command('pub <pluginName>','发布插件')
        .action(async (pluginName)=>{
            try{
                const config=readConfig()
                await transformPackageJson(resolve(basePath,config.plugin_dir,pluginName,'package.json'))
                await promisify(exec(`cd ${config.plugin_dir}/${pluginName} && npm run pub`,{cwd:basePath}))
                await restorePackageJson(resolve(basePath,config.plugin_dir,pluginName,'package.json'))
            }catch (e){
                console.error('发布失败，错误信息：',e.message)
            }
            console.log('发布插件完成')
        })
}
const backup:Map<string,string>=new Map<string, string>()
async function transformPackageJson(jsonPath){
    const str=readFileSync(jsonPath,'utf8')
    backup.set(jsonPath,str)
    if(existsSync(resolve(jsonPath,'../lib'))){
        writeFileSync(jsonPath,str.replace('src/index.ts','lib/index.js'))
    }
}
export function restorePackageJson(jsonPath){
    const str=backup.get(jsonPath)||readFileSync(jsonPath,'utf8')
    writeFileSync(jsonPath,str,'utf8')
}