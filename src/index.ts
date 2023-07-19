#!/usr/bin/env node

import {cac,CAC} from "cac";
import registerInitCommand from "@/init";
import registerNewPluginCommand from "@/new";
import registerDeployCommand from '@/deploy'
import registerBuildPluginCommand from "@/build";
import registerPubPluginCommand from "@/pub";
const cli:CAC=cac()
    .version(require('../package.json').version)
registerInitCommand(cli)
registerNewPluginCommand(cli)
registerBuildPluginCommand(cli)
registerDeployCommand(cli)
registerPubPluginCommand(cli)
cli.help()
cli.parse()
