import fs from "fs";
import path from "path";
import { Command, OptionValues } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";

import { deleteFolders } from "./utility_delete";

/**
 * Finds the folders inside a directory whose name match with a string and stores them
 * @param folderPath base folder to look
 * @param match string to match folder's name
 * @param list string array to store the found folders
 * @returns folder's array which don't match
 */
function findFolder(folderPath: string, match: string, list: string[]) {
    const excludedFolders = ["src", "dist", ".git"];
    let folders = fs.readdirSync(folderPath, { withFileTypes: true });
    folders = folders.filter((value) => {
        return value.isDirectory();
    }); // list with only the folders inside path
    let matchedFolders = folders.filter((value) => {
        return value.name.includes(match);
    });
    let otherFolders = folders.filter((value) => {
        return !value.name.includes(match) || excludedFolders.some((item) => item === value.name);
    });
    let paths = otherFolders.map((value) => path.join(value.path, value.name)); // store paths for other folders
    list.push(...matchedFolders.map((value) => path.join(value.path, value.name))); // store paths for matched folders
    return paths;
}

/**
 * Search for folders names recursively to match a string
 * @param folderPath base folder to start looking
 * @param match string name to match folder name
 * @param list string array to store the found folders
 * @param level current level of depth
 * @param depth maximum depth level
 * @returns none, folder's paths are stored in list
 */
function recursiveFindFolder(
    folderPath: string,
    match: string,
    list: string[],
    level: number,
    depth: number = 4
) {
    let folders = findFolder(folderPath, match, list);
    // base case
    if (folders.length == 0 || level > depth) {
        return;
    }
    for (let folder of folders) {
        recursiveFindFolder(folder, match, list, level + 1, depth);
    }
}

/**
 * Action to be executed for find-folders subcommand
 * @param str argument received
 * @param options options received
 */
function findFoldersAction(str: string, options: OptionValues) {
    let openFolder: fs.Dir | null = null;
    try {
        let folders: string[] = [];
        openFolder = fs.opendirSync(str); // test if folder exists
        recursiveFindFolder(str, "node_modules", folders, 0, 4);
        if (options.force) {
            deleteFolders(folders);
            return;
        }
        if (options.delete) {
            inquirer
                .prompt([
                    {
                        type: "checkbox",
                        name: "folders",
                        message: "Select the folders you want to delete",
                        choices: folders,
                    },
                ])
                .then((answers: { folders: string[] }) => {
                    deleteFolders(folders);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    } catch (error) {
        console.log(
            chalk.red("An error occured with the path selected, check the path and try again")
        );
    } finally {
        // cleans the base folder when open
        if (openFolder !== null) {
            openFolder.close();
        }
    }
}

// create the command line interface
const program = new Command();
program
    .name("utility-cli")
    .description("Utitlity functions for backup preparation")
    .version("0.0.1");
program
    .command("find-folders")
    .description(
        "find non vital folders (node_modules) in each project for deletion before making a backup"
    )
    .argument("<string>", "base path")
    .option("-d, --delete", "Gives the option to delete the folders")
    .option("-f, --force", "Deletes all folders found without prior validation")
    .action(findFoldersAction);
program.parse();
