import {CAC} from "cac";
import {resolve} from "path";
import {Config, makeDir, readConfig, replace, saveTo} from "@/utils";

export interface BasePackage {
    name: string
    version: string
    description: string
}
export type Dict<T extends any=any,K extends string|symbol=string>={
    [P in K]:T
}
export type DependencyType = 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies'
export interface PackageJson extends BasePackage, Partial<Record<DependencyType, Record<string, string>>> {
    main?: string
    bin?: string | Dict<string>
    scripts:Dict<string>
    keywords: string[]
}
export interface Tsconfig {
    extends?: string
    compilerOptions?: {
        outDir?:string,
        rootDir?: string,
        baseUrl?: string,
        target?: string,
        esModuleInterop?: boolean,
        module?: string,
        declaration?: boolean,
    }
    include?:string[]
}
export interface Template{
    package:PackageJson,
    tsConfig?:Tsconfig
    index:string
}
const templateMap:Map<string,Template>=new Map<string, Template>()
templateMap.set('ts',{
    package:{
        name:'zhin-plugin-{{name}}',
        version:'0.0.1',
        main:'src/index.ts',
        description:'{{name}} plugin',
        keywords: [
            "{{name}}",
            "plugin",
            "zhin"
        ],
        scripts:{
            build:"tsc --project tsconfig.json && tsc-alias -p tsconfig.json",
            pub:"npm publish --access public"
        }
    },
    tsConfig:{
        compilerOptions:{
            outDir: "./lib",
            rootDir: "./src",
            baseUrl: ".",
            target: "ES2020",
            esModuleInterop: true,
            module: "commonjs",
            declaration: true
        },
        include: ["./src/"]
    },
    index:`import {Plugin,App} from 'zhin';
export const name='{{name}}';
export function install (this:Plugin,app:App){
    // 在这儿实现你的插件逻辑
    // 功能样例：
    //1.定义指令
    /*
    app.command('test')
        .option('foo','-f <bar:string>')
        .action(({event,options})=>{
            console.log('options',options);
            return 'hello world'
        })
    */
    // 2.定义中间件
    /*
    app.middleware(async (event,next)=>{
        if(true){ //需要判断的条件
        //逻辑执行代码
        }else{
            next() // 不next，则不会流入下一个中间件
        }
    });
    */
    // 3. 监听事件
    /*
    app.on(eventName,callback);
    app.once(eventName,callback);
    app.on(eventName,callback);
    */
    // 4. 定义服务
    /*
    app.service('serviceName'，{}) // 往bot上添加可全局访问的属性
    */
    // 5. 添加自定插件副作用(在插件卸载时需要执行的代码)
    // 如果不需要，可以不return
    /*
    return ()=>{
        // 如果你使用过react的useEffect 那你应该知道这是在干嘛
        // 函数内容将会在插件卸载时自动卸载
    }
    */
}`
});
templateMap.set('js',{
    package:{
        name:'zhin-plugin-{{name}}',
        version:'0.0.1',
        main:'index.js',
        description:'{{name}} plugin',
        keywords: [
            "{{name}}",
            "plugin",
            "zhin"
        ],
        scripts:{
            pub:"npm publish --access public"
        }
    },
    index:`module.exports={
    name:'{{name}}',
    install(app){
        // 在这儿实现你的插件逻辑
        // 功能样例：
        // 1.定义指令
        /*
        app.command('test')
            .option('foo','-f <bar:string>')
            .action(({event,options})=>{
                console.log('options',options);
                return 'hello world'
            })
        */
        // 2.定义中间件
        /*
        app.middleware(async (event,next)=>{
            if(true){ //需要判断的条件
            //逻辑执行代码
            }else{
                next() // 不next，则不会流入下一个中间件
            }
        });
        */
        // 3. 监听事件
        /*
        app.on(eventName,callback);
        app.once(eventName,callback);
        app.on(eventName,callback);
        */
        // 4. 定义服务
        /*
        app.service('serviceName'，{}) // 往bot上添加可全局访问的属性
        */
        // 5. 添加自定插件副作用(在插件卸载时需要执行的代码)
        // 如果不需要，可以不return
        /*
        return ()=>{
            // 如果你使用过react的useEffect 那你应该知道这是在干嘛
            // 函数内容将会在插件卸载时自动卸载
        }
        */
    }
}`
})
export default function registerNewPluginCommand(cli:CAC){
    cli.command('new <pluginName>','新建插件')
        .option('-t,--typescript','插件类型 (ts/js)',{default:'js'})
        .action((pluginName,options)=>{
            try{
                const config=readConfig()
                if(options.t||options.typescript){
                    return createTsTemplate(config,pluginName)
                }
                return createJsTemplate(config,pluginName)
            }catch (e){
                console.error('新建出错，错误信息：',e.message)
            }
            console.log('新建插件完成')
        })
}
export async function createJsTemplate(config:Config,name:string){
    const pluginDir=resolve(process.cwd(),config.plugin_dir,name)
    const template=templateMap.get('js')
    // 建立文件夹
    makeDir(pluginDir)
    // 创建package.json
    saveTo(resolve(pluginDir,'package.json'),replace(JSON.stringify(template.package,null,4),[
        'name',
        name
    ]))
    // 创建模板文件index.js
    saveTo(resolve(pluginDir,'index.js'),replace(template.index,[
        'name',
        name]
    ))
}
export async function createTsTemplate(config:Config,name:string){
    const pluginDir=resolve(process.cwd(),config.plugin_dir,name)
    const template=templateMap.get('ts')
    // 建立插件文件夹
    makeDir(pluginDir)
    const sourceDir=resolve(pluginDir,'src')
    // 建立源码文件夹
    makeDir(sourceDir)
    // 创建package.json
    saveTo(resolve(pluginDir,'package.json'),replace(JSON.stringify(template.package,null,4),[
        'name',
        name
    ]))
    // 创建模板文件index.ts
    saveTo(resolve(sourceDir,'index.ts'),replace(template.index,[
        'name',
        name]
    ))
    // 创建tsconfig.json
    saveTo(resolve(pluginDir,'tsconfig.json'),JSON.stringify(template.tsConfig,null,4))
}