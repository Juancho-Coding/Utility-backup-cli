import fs from 'fs'
import  path from 'path'


function findFolder(folderPath: string, match: string, list: string[]){
    let folders = fs.readdirSync(folderPath, {withFileTypes: true})
    folders = folders.filter((value)=>{return value.isDirectory()}) // search only folders
    let matchedFolders = folders.filter((value)=>{return value.name.includes(match)})
    let otherFolders = folders.filter((value)=>{return !value.name.includes(match)})
    let paths = otherFolders.map(value=>path.join(value.path, value.name )) // store paths for other folders
    list.push(...matchedFolders.map(value=> path.join(value.path, value.name))) // store paths for matched folders
    return paths
}

function recursiveFindFolder(folderPath: string, match: string, list: string[], nivel: number, depth: number = 4){
    let folders = findFolder(folderPath, match, list)
    if(folders.length == 0 || nivel > depth){
        return
    }
    for(let folder of folders){
        recursiveFindFolder(folder, match, list, nivel + 1, depth)
    }
}

let files: string[] = []
recursiveFindFolder("D:\\TRABAJO",'node_modules', files, 0, 4)
console.log(files);

