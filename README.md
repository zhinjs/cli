# @zhinjs/cli
知音机器人开发脚手架
## usage
> 初始化项目 `zhin init`
1. 打开或新建一个项目文件夹
2. 在项目文件夹下打开命令行(终端)窗口
3. 执行`zhin init`
4. 根据提示录入信息即可完成zhin初始化
> 启动项目 `zhin start`
1. 在项目文件夹下打开命令行(终端)窗口
2. 执行`zhin start`
3. 等待命令执行完毕即可启动zhin
> 【可选】添加插件 `zhin new [pluginName]`
> 
> 若你有自己开发插件的意图，本指令可为你创建一个模板插件
1. 在项目文件夹下打开命令行(终端)窗口
2. 执行`zhin new [pluginName]`(请将`[pluginName]`替换为你的插件名)
3. 默认创建的插件为ts(typescript)语言开发，若你想创建一个js(javascript)插件开发的模板，可添加`--type js`声明其类型为js

>【可选】发布你的插件 `zhin pub [pluginName]`
>
> 在插件开发完毕后，如果你又意愿将插件公开给其他zhin用户使用，可使用该命令将插件发布到https://www.npmjs.com/，供他人下载
>
> 注意：ts编写的插件在发布前需要使用`zhin build [pluginName] 命令先将插件编译成可在js环境运行的插件,否则你的插件将只能在cli指令启动的zhin下运行
> 
> 注意：若插件名与https://www.npmjs.com/上已有的包名冲突且该包不是你所有，将无法上传
1. 在项目文件夹下打开命令行(终端)窗口
2. 执行`zhin pub [pluginName]`(请将`[pluginName]`替换为你的插件名)
3. 等待命令执行完成即可发布你的插件到`https://www.npmjs.com`

>【可选】编译插件 `zhin build [pluginName]`
>
> 将ts编写的插件编译成可在js环境运行的插件
> 
1. 在项目文件夹下打开命令行(终端)窗口
2. 执行`zhin build [pluginName]`(请将`[pluginName]`替换为你的插件名)
3. 等待命令执行完成即可编译你的插件