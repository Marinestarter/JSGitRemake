const path = require('path')
const fs = require('fs')

const myGit = {
    //init Project Repo
    init(options = {}) {
        if (files.inRepo()) return;

        const myGitStructure = {
            HEAD: "refs: refs/heads/master\n",
            objects: {},
            refs: {heads: {}},
            config: '' //config file creation TODO
        }
    },
    //add to index
    add(filePath) {
        files.assertInRepo();
        //config file check

        let addedFiles = files.recursiveFileReader(filePath);

        if (addedFiles.length === 0) {
            throw new Error ("No Files added.")
        }
        else {
            addedFiles.forEach(p => myGit.updateIndex(p, { add: true }));
        }
    },

    rm(filePath) {
        files.assertInRepo();
        //config bare check

        opts = opts || {}
        let filesToRemove = index.matchingFiles(filePath)
        if (filesToRemove.length === 0) {
            throw new Error ("No matching file in repo")
        } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory() && !opts.r) {
            throw new Error ("not removing " + filePath + " recursively. To remove, use '-r'.")
        }
        else {
            let ChangestoRm = ''; //intersection util?
            if (ChangestoRm.length > 0) {
                throw new Error ("these files have changes: " + ChangestoRm.join("\n") + "\n")
            }
            else {
                filesToRemove.map(files)
            }
        }


    },
    commit() {
    },
    branch() {
    },
    checkout() {
    },
    diff() {
    },
    remote() {
    },
    fetch() {
    },
    merge() {
    },
    pull() {
    },
    push() {
    },
    status() {
    },
    updateIndex() {
    },
    writeTree() {
    },
    update_ref() {
    },
}

const refs = {}

const objects = {}

const index = {}

const files = {
    inRepo() {
        return files.myGitPath() !== undefined;
    },

    assertInRepo() {
        if (!files.inRepo()) {
            throw new Error("directory not in Repo!")
        }
    },

    myGitPath(path) {
        if (fs.existsSync(dir)) {

            while (dir !== '/') {
                configFile = path.join(dir, 'config')
                myGitDir = path.join(dir, 'myGit')

                if (fs.existsSync(myGitDir)) {
                    return myGitDir;
                }

                if (fs.existsSync(configFile) &&
                    fs.statSync(configFile).isFile() &&
                    files.read(configFile).includes("[core]")) {
                    return dir
                }
                dir = path.dirname(dir)
            }
            return null;
        }
    },

    read(filePath) {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, "utf-8")
        }
    },

    recursiveFileReader(filePath) {
        if (fs.existsSync(filePath)) {
            return [];
        } else if (fs.statSync(filePath).isFile()) {
            return [path];
        } else if (fs.statSync(filePath).isDirectory()) {
            return fs.readdirSync(filePath).reduce(function (fileList, dirChild) {
                return fileList.concat(files.recursiveFileReader(path.join(path, dirChild)));
            }, []);
        }
    }


    }

    const merge = {}

    const config = {}

    const util = {}

    const status = {}

