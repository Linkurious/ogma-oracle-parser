#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import inquirer from "inquirer";
import oracledb from "oracledb";
import { writeFile } from "fs/promises";
import path from "path";
import { generateTypes } from "./generate-types";
import { generateSchema } from "../";
import { version } from "../package.json";

const program = new Command();

program
  .name("Ogma-Oracle-Parse CLI")
  .version(version)
  .description(
    "A CLI to generate types for your Ogma project with Oracle Graph DB"
  )
  .helpOption(false);

program
  .command("help")
  .description("Show help menu")
  .action(async () => {
    console.clear();
    console.log(chalk.bold.blue("\n💡 Ogma Oracle Parser - Help Menu\n"));

    await inquirer
      .prompt([
        {
          type: "list",
          name: "helpSection",
          message: chalk.yellow("Select a topic to learn more:"),
          choices: [
            { name: "Usage Instructions", value: "usage" },
            { name: "Build Command", value: "build" },
            { name: "Environment Variables", value: "env" },
            { name: "Exit", value: "exit" },
          ],
        },
      ])
      .then((answers) => {
        switch (answers.helpSection) {
          case "usage":
            console.log(chalk.cyan("\n📌 Usage Instructions:"));
            console.log(
              chalk.green("  npx @linkurious/ogma-oracle-parser help")
            );
            console.log(
              chalk.green("  npx @linkurious/ogma-oracle-parser build\n")
            );
            break;

          case "build":
            console.log(chalk.cyan("\n🔨 Build Command:"));
            console.log(
              chalk.green("  npx @linkurious/ogma-oracle-parser build\n")
            );
            console.log(
              chalk.yellow(
                "\n✨ The build process includes an interactive prompt."
              )
            );
            console.log(
              chalk.yellow(
                "💡 You can customize the default values in the interactive build prompt via the `.env` file.\n"
              )
            );
            break;

          case "env":
            console.log(chalk.cyan("\n⚙️  Environment Variables:"));
            console.log(
              chalk.yellow(
                "💡 You can customize the default values in the interactive build prompt via the `.env` file.\n"
              )
            );
            console.log(
              chalk.yellow(
                "Create a .env file at the root of your project with:"
              )
            );
            console.log(
              chalk.green(`
DB_HOST=localhost
DB_USER=graphuser
DB_PASS='Welcome_1234#'
DB_PORT=1521
DB_SERVICE=freepdb1
NODE_PORT=1337
              `)
            );
            break;
          case "exit":
            console.log(chalk.gray("\nExiting help menu..."));
            break;
        }
      });
  });

program
  .command("build")
  .description("Generates types for your Ogma project")
  .action(async () => {
    const env = dotenv.config().parsed || {};
    const defaults = {
      user: env.DB_USER || "system",
      password: env.DB_PASS || "oracle",
      port: env.DB_PORT || "1521",
      service: env.DB_SERVICE || "orcl",
      host: env.DB_HOST || "localhost",
      outputFile: env.OUTPUT_FILE || "./types.ts",
    };
    const options = await inquirer.prompt([
      {
        type: "input",
        name: "user",
        message: "What user in the DB should I use?",
        default: defaults.user,
      },
      {
        type: "input",
        name: "password",
        message: "What password should I use?",
        default: defaults.password,
      },
      {
        type: "input",
        name: "port",
        message: "What port should I use?",
        default: defaults.port,
      },
      {
        type: "input",
        name: "service",
        message: "What service should I use?",
        default: defaults.service,
      },
      {
        type: "input",
        name: "host",
        message: "What host should I use?",
        default: defaults.host,
      },
      {
        type: "input",
        name: "outputFile",
        message: "What output file should I use?",
        default: defaults.outputFile,
      },
    ]);
    const connectString =
      options.host + ":" + options.port + "/" + options.service;
    const conn = await oracledb.getConnection({
      user: options.user,
      password: options.password,
      connectString,
    });
    const schema = await generateSchema(conn);
    const types = generateTypes(schema);
    await writeFile(path.resolve(options.outputFile), types);
    console.log("Types saved to", path.resolve(options.outputFile));
    console.log("Types generated successfully! 🎉");
  });

program.parse(process.argv);
