#!/usr/bin/env node

import {cac,CAC} from "cac";
import registerInitCommand from "@/init";
import registerStartCommand from "@/start";
import registerNewPluginCommand from "@/new";
import registerDeployCommand from '@/deploy'
import registerBuildPluginCommand from "@/build";
import registerPubPluginCommand from "@/pub";
const cli:CAC=cac()
    .version(require('../package.json').version)
if(process.argv.length===2){
    cli.outputHelp()
}
registerInitCommand(cli)
registerStartCommand(cli)
registerNewPluginCommand(cli)
registerBuildPluginCommand(cli)
registerPubPluginCommand(cli)
registerDeployCommand(cli)
cli.help()
cli.parse()
