import chalk from 'chalk';
import { Command } from 'commander';

export const pingCommand = new Command('ping')
  .description('Check if CLI is running')
  .action(() => {
    console.log(chalk.green('pong'));
  });
