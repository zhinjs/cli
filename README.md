# @zhinjs/cli

cli for Zhin bot，知音机器人的命令行工具

## Usage

> 初始化项目 `zhin init`

1. 打开或新建一个项目文件夹
2. 在项目文件夹下打开命令行(终端)窗口
3. 执行 `zhin init [projectName]` (若未填项目名，将在当前文件夹初始化项目)
4. 根据提示录入信息即可完成 zhin 初始化

> 启动项目 `zhin start`

5. 在项目文件夹下打开命令行(终端)窗口
6. 执行 `zhin start`
7. 等待命令执行完毕即可启动 zhin

   > 【可选】添加插件 `zhin new <pluginName>`
   >
   > 若你有自己开发插件的意图，本指令可为你创建一个模板插件

8. 在项目文件夹下打开命令行(终端)窗口
9. 执行 `zhin new <pluginName>` (请将 `<pluginName>` 替换为你的插件名)
10. 默认创建的插件为 JavaScript 语言开发，若你想创建一个 TypeScript 插件开发的模板，可添加 `-t` 声明其类型为 ts

> 【可选】发布你的插件 `zhin pub <pluginName>`
>
> 在插件开发完毕后，如果你又意愿将插件公开给其他 zhin 用户使用，可使用该命令将插件发布到npm 供他人下载
>
> 注意：ts 编写的插件在发布前需要使用 `zhin build <pluginName> 命令先将插件编译成可在 js 环境运行的插件,否则你的插件将只能在 cli 指令启动的 zhin 下运行
>
> 注意：若插件名与 npm 上已有的包名冲突且该包不是你所有，将无法上传

1. 在项目文件夹下打开命令行(终端)窗口
2. 执行 `zhin pub [pluginName]` (请将`[pluginName]`替换为你的插件名)
3. 等待命令执行完成即可发布你的插件到 npm

> 【可选】编译插件 `zhin build <pluginName>`
>
> 将 ts 编写的插件编译成可在 js 环境运行的插件

1. 在项目文件夹下打开命令行(终端)窗口
2. 执行 `zhin build <pluginName>` (请将`<pluginName>`替换为你的插件名)
3. 等待命令执行完成即可编译你的插件
