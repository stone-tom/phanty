#!/usr/bin/env bun
import { Command } from 'commander';
import { pingCommand } from './commands/ping';

const program = new Command();

program.name('cli').description('CLI for phanty operations').version('1.0.0');

program.addCommand(pingCommand);

program.parse();
