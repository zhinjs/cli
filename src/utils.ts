import path, {resolve} from "path";
import {existsSync} from "fs";
export const basePath=process.cwd()
export function hasPackageJson(){
    return existsSync(resolve(basePath,'package.json'))
}
export const defaultConfig={
    uin:1472558369,
    password: '你的密码',
    plugins:{},
    log_level:'info',
    plugin_dir:path.join(basePath,'plugins'),
    data_dir:path.join(basePath,'data'),
    delay:{},
    logConfig:{
        appenders: {
            console:{type:'console'},
            zhin: {
                type:'file',
                filename:path.join(basePath,'logs.log')
            }
        },
        categories:{
            zhin:{
                appenders:['console','zhin'],
                level:'info'
            }
        }
    },
}