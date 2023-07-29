import {CAC} from "cac";
import {resolve} from "path";
import {Config, makeDir, readConfig, replace, saveTo} from "@/utils";

export interface BasePackage {
    name: string
    setup?:boolean
    version: string
    files?:string[]
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
    tsConfig?:Tsconfig,
    clientIndex:string,
    demoVue:string,
    index:string
}
const templateMap:Map<string,Template>=new Map<string, Template>();
const tsDemoVue=`<template>
    <div>
        <h1>{{name}}</h1>
        <p>这是一个使用 TypeScript 开发的插件</p>
    </div>
</template>
<script lang="ts" setup>
</script>
`
const jsDemoVue=`<template>
    <div>
        <h1>{{name}}</h1>
        <p>这是一个使用 JavaScript 开发的插件</p>
    </div>
</template>
<script setup>
</script>
`
const tsIndex=`import {defineExtension, ZhinWeb} from "@zhinjs/client";

export default defineExtension((web: ZhinWeb) => {
    web.addPage({
        path: '/test-client',
        name: "test-client",
        component: () => import('./test-client.vue'),
        position: 'left'
    })
})`
const jsIndex=`import {defineExtension} from "@zhinjs/client";
/**
    * @param {import("@zhinjs/client").ZhinWeb} web
    */
export default defineExtension((web)=>{
    web.addPage({
        path:'/{{name}}',
        name:"{{name}}",
        component:()=>import('./{{name}}.vue'),
        position:'left'
    })
})`
templateMap.set('ts',{
    package:{
        name:'zhin-plugin-{{name}}',
        version:'0.0.1',
        main:'src/index',
        description:'{{name}} plugin',
        keywords: [
            "{{name}}",
            "plugin",
            "zhin"
        ],
        files:[
            "LICENSE",
            "README.md",
            "dist",
            "src/**/*.js",
            "src/**/*.d.ts",
            "client",
            "lib",
        ],
        scripts:{
            build:"zhin-client build",
            pub:"npm publish --access public"
        }
    },
    tsConfig:{
        compilerOptions:{
            outDir: "./src",
            rootDir: "./src",
            baseUrl: ".",
            target: "ES2020",
            esModuleInterop: true,
            module: "commonjs",
            declaration: true
        },
        include: ["./src/"]
    },
    index:`import {Plugin,Context} from 'zhin';
import * as path from 'path'

export const name='{{name}}';
export function install (this:Plugin,ctx:Context){
    // 如果该插件有web页面，请取消注释下面这行
    // ctx.console.addEntry(path.resolve(__dirname,ctx.zhin.isDev?'../client/index.ts':'../dist'))
    // 在这儿实现你的插件逻辑
    // 功能样例：
    //1.定义指令
    /*
    ctx.command('test')
        .option('-f [bar:string]')
        .action(({session,options})=>{
            console.log('options',options);
            return 'hello world'
        })
    */
    // 2.定义中间件
    /*
    ctx.middleware(async (session,next)=>{
        if(true){ //需要判断的条件
        //逻辑执行代码
        }else{
            next() // 不 next，则不会流入下一个中间件
        }
    });
    */
    // 3. 监听事件
    /*
    ctx.on(eventName,callback);
    ctx.once(eventName,callback);
    ctx.on(eventName,callback);
    */
    // 4. 定义服务
    /*
    ctx.service('serviceName',{}) // 往 ctx 上添加可全局访问的属性
    */
    // 5. 添加自定插件副作用(在插件卸载时需要执行的代码)
    // 如果不需要，可以不return
    /*
    return ()=>{
        // 如果你使用过 react 的 useEffect ，那你应该知道这是在干嘛
        // 函数内容将会在插件卸载时自动卸载
    }
    */
}`,
    clientIndex:tsIndex,
    demoVue:tsDemoVue
});
templateMap.set('tss',{
    package:{
        name:'zhin-plugin-{{name}}',
        version:'0.0.1',
        setup:true,
        main:'src/index',
        description:'{{name}} plugin',
        keywords: [
            "{{name}}",
            "plugin",
            "zhin"
        ],
        files:[
            "LICENSE",
            "README.md",
            "dist",
            "src/**/*.js",
            "src/**/*.d.ts",
            "client",
            "lib",
        ],
        scripts:{
            build:"zhin-client build",
            pub:"npm publish --access public"
        }
    },
    tsConfig:{
        compilerOptions:{
            outDir: "./src",
            rootDir: "./src",
            baseUrl: ".",
            target: "ES2020",
            esModuleInterop: true,
            module: "commonjs",
            declaration: true
        },
        include: ["./src/"]
    },
    index:`import {useContext} from 'zhin';
import * as path from 'path'    
const ctx=useContext()

// 如果该插件有web页面，请取消注释下面这行
// ctx.console.addEntry(path.resolve(__dirname,ctx.zhin.isDev?'../client/index.ts':'../dist'))

//1.定义指令
/*
ctx.command('test')
    .option('-f [bar:string]')
    .action(({session,options})=>{
        console.log('options',options);
        return 'hello world'
    })
*/
// 2.定义中间件
/*
ctx.middleware(async (session,next)=>{
    if(true){ //需要判断的条件
        //逻辑执行代码
    }else{
        next() // 不 next，则不会流入下一个中间件
    }
});
*/
// 3. 监听事件
/*
ctx.on(eventName,callback);
ctx.once(eventName,callback);
ctx.on(eventName,callback);
*/
// 4. 定义服务
/*
ctx.service('serviceName',{}) // 往 ctx 上添加可全局访问的属性
*/
// 5. 添加自定插件副作用(在插件卸载时需要执行的代码)
// 如果不需要，可以不return
/*
ctx.on('dispose',()=>{
    // 如果你使用过 react 的 useEffect ，那你应该知道这是在干嘛
    // 函数内容将会在插件卸载时自动卸载
})
*/
`,
    clientIndex:tsIndex,
    demoVue:tsDemoVue
})
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
        files:[
            "LICENSE",
            "README.md",
            "dist",
            "src/**/*.js",
            "src/**/*.d.ts",
            "client",
            "lib",
        ],
        scripts:{
            build:"zhin-client build",
            pub:"npm publish --access public"
        }
    },
    index:`const path = require('path')
    
module.exports={
    name:'{{name}}',
    /**
    * 
    * @param ctx {import('zhin').Context} zhin 的上下文
    * @return dispose {import('zhin').Dispose|void}
    */
    install(ctx){
        // 如果该插件有web页面，请取消注释下面这行
        // ctx.console.addEntry(path.resolve(__dirname,ctx.zhin.isDev?'./client/index.ts':'./dist'))
        // 在这儿实现你的插件逻辑
        // 功能样例：
        // 1.定义指令
        /*
        ctx.command('test')
            .option('-f [bar:string]')
            .action(({session,options})=>{
                console.log('options',options);
                return 'hello world'
            })
        */
        // 2.定义中间件
        /*
        ctx.middleware(async (session,next)=>{
            if(true){ //需要判断的条件
            //逻辑执行代码
            }else{
                next() // 不 next，则不会流入下一个中间件
            }
        });
        */
        // 3. 监听事件
        /*
        ctx.on(eventName,callback);
        ctx.once(eventName,callback);
        ctx.on(eventName,callback);
        */
        // 4. 定义服务
        /*
        ctx.service('serviceName',{}) // 往 ctx 上添加可全局访问的属性
        */
        // 5. 添加自定插件副作用(在插件卸载时需要执行的代码)
        // 如果不需要，可以不return
        /*
        return ()=>{
            // 如果你使用过 react 的 useEffect ，那你应该知道这是在干嘛
            // 函数内容将会在插件卸载时自动卸载
        }
        */
    }
}`,
    clientIndex:jsIndex,
    demoVue:jsDemoVue
})
templateMap.set('jss',{
    package:{
        name:'zhin-plugin-{{name}}',
        version:'0.0.1',
        setup:true,
        main:'index.js',
        description:'{{name}} plugin',
        keywords: [
            "{{name}}",
            "plugin",
            "zhin"
        ],
        files:[
            "LICENSE",
            "README.md",
            "dist",
            "src/**/*.js",
            "src/**/*.d.ts",
            "client",
            "lib",
        ],
        scripts:{
            build:"zhin-client build",
            pub:"npm publish --access public"
        }
    },
    index:`const {useContext}=require('zhin');
const path = require('path')

const ctx=useContext()

// 如果该插件有web页面，请取消注释下面这行
// ctx.console.addEntry(path.resolve(__dirname,ctx.zhin.isDev?'./client/index.ts':'./dist'))
// 在这儿实现你的插件逻辑
// 功能样例：
// 1.定义指令
/*
ctx.command('test')
    .option('-f [bar:string]')
    .action(({session,options})=>{
        console.log('options',options);
        return 'hello world'
    })
*/
// 2.定义中间件
/*
ctx.middleware(async (session,next)=>{
    if(true){ //需要判断的条件
        //逻辑执行代码
    }else{
        next() // 不 next，则不会流入下一个中间件
    }
});
*/
// 3. 监听事件
/*
ctx.on(eventName,callback);
ctx.once(eventName,callback);
ctx.on(eventName,callback);
*/
// 4. 定义服务
/*
ctx.service('serviceName',{}) // 往 ctx 上添加可全局访问的属性
*/
// 5. 添加自定插件副作用(在插件卸载时需要执行的代码)
// 如果不需要，可以不return
/*
ctx.on('dispose',()=>{
    // 如果你使用过 react 的 useEffect ，那你应该知道这是在干嘛
    // 函数内容将会在插件卸载时自动卸载
})
*/`,
    clientIndex:jsIndex,
    demoVue:jsDemoVue
})
export default function registerNewPluginCommand(cli:CAC){
    cli.command('new <pluginName>','新建插件')
        .option('-t,--typescript','是否使用 ts 开发',{default:false})
        .option('-s,--setup','是否使用 setup 模式开发',{default:false})
        .option('-w,--web','是否包含web功能',{default:false})
        .action((pluginName,options)=>{
            try{
                const config=readConfig()
                if(options.t||options.typescript){
                    return createTsTemplate(config,pluginName,options)
                }
                return createJsTemplate(config,pluginName,options)
            }catch (e){
                console.error('新建出错，错误信息：',e.message)
            }
            console.log('新建插件完成')
        })
}
export async function createJsTemplate(config:Config,name:string,options:{
    setup?:boolean
    s?:boolean
    web?:boolean
    w?:boolean
}){
    const pluginDir=resolve(process.cwd(),config.plugin_dir,name)
    const template=templateMap.get(`js${options.setup||options.s?'s':''}`)
    // 建立文件夹
    makeDir(pluginDir)
    if(options.web||options.w){
        const clientDir=resolve(pluginDir,'client')
        makeDir(clientDir)
        saveTo(resolve(clientDir,'index.ts'),replace(template.clientIndex,[
            'name',
            name
        ]))
        saveTo(resolve(clientDir,`${name}.vue`),replace(template.demoVue,[
            'name',
            name
        ]))
    }
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
export async function createTsTemplate(config:Config,name:string,options:{
    setup?:boolean
    s?:boolean
    web?:boolean
    w?:boolean
}){
    const pluginDir=resolve(process.cwd(),config.plugin_dir,name)
    const template=templateMap.get(`ts${options.setup||options.s?'s':''}`)
    // 建立插件文件夹
    makeDir(pluginDir)
    const sourceDir=resolve(pluginDir,'src')
    if(options.web||options.w){
        const clientDir=resolve(pluginDir,'client')
        // 建立web文件夹
        makeDir(clientDir)
        // 创建模板文件index.html
        saveTo(resolve(clientDir,'index.ts'),replace(template.clientIndex,[
            'name',
            name
        ]))
        // 创建模板文件index.ts
        saveTo(resolve(clientDir,`${name}.vue`),replace(template.demoVue,[
            'name',
            name
            ]
        ))
        // 创建tsconfig.json
        saveTo(resolve(clientDir,'tsconfig.json'),JSON.stringify(template.tsConfig,null,4))
    }
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
