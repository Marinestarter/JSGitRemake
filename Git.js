const crypto = require('crypto');
const path = require("path");
const fs = require('fs');

//SHA1 hashing of objects
function sha1(data) {
    return crypto.createHash('sha1').update(data).digest('hex');
}

//Git 'blob' class, used for individual elements
class Blob {
    constructor(content) {
        this.content = content
        this.id = sha1(content)
        this.writeToDisk();
    }

    writeToDisk() {
        let objectPath = path.join('.gitReal', 'objects', this.id)
        if (!fs.existsSync(objectPath)) {
            fs.writeFileSync(objectPath, this.content);
        }
    }
}

//Git 'tree' class, a storage of 'blobs'
class Tree {
    constructor(entries = {}) {
        this.entries = {};
    }

    addEntry(name, obj) {
        this.entries[name] = obj.id;
    }

    getHash() {
        return sha1(JSON.stringify(this.entries));
    }

    writeToDisk() {
        let treeData = JSON.stringify(this.entries);
        let hash = sha1(treeData);
        let objectPath = path.join('.gitReal', 'objects', hash)
        if (!fs.existsSync(objectPath)) {
            fs.writeFileSync(objectPath, treeData);
        }
        return hash;
    }

    static load(hash) {
        let objectPath = path.join('.gitReal', 'objects', hash);
        if (!fs.existsSync(objectPath)) return null;
        let entries = JSON.parse(fs.readFileSync(objectPath, 'utf-8'));
        return new Tree(entries);
    }
}

class Commit {
    constructor(parent, tree, message) {
        this.parent = parent ? parent.id : null
        this.tree = tree.getHash()
        this.message = message
        this.id = sha1(this.tree + (this.parent || '') + message)
        this.writeToDisk()
    }

    writeToDisk() {
        let commitData = JSON.stringify(
            {
                parent: this.parent,
                message: this.message,
                tree: this.tree,
            });

        let objectPath = path.join('.gitReal', 'objects', this.id);
        if (!fs.existsSync(objectPath)) {
            fs.writeFileSync(objectPath, commitData)
        }
    }

    static load(hash) {
        let objectPath = path.join('.gitReal', 'objects', hash);
        if (!fs.existsSync(objectPath)) return null;
        let data = JSON.parse(fs.readFileSync(objectPath, 'utf-8'));
        let tree = Tree.load(data.tree);
        return new Commit(data.parent, tree, data.message);
    }
}

class Branch {
    constructor(name, commit = null) {
        this.name = name;
        this.commit = commit;
    }
}

class Git {
    constructor(name) {
        this.repoPath = path.join(process.cwd(), '.GitReal'); // Ensure this matches your intended folder
        this.objectsPath = path.join(this.repoPath, 'objects');
        this.refsPath = path.join(this.repoPath, 'refs/heads');
        this.headPath = path.join(this.repoPath, 'HEAD');
        this.indexPath = path.join(this.repoPath, 'index');

        // If repo directory does not exist, initialize it
        if (!fs.existsSync(this.repoPath)) {
            this.initRepo();
        }

        this.loadHead(); // Now this should work safely
        this.index = this.loadIndex();
    }

    initRepo() {
        console.log("Initializing Gitlet repository...");

        fs.mkdirSync(this.repoPath, {recursive: true});
        fs.mkdirSync(this.objectsPath, {recursive: true});
        fs.mkdirSync(this.refsPath, {recursive: true});

        // Create default branch and files
        fs.writeFileSync(this.headPath, 'master');  // Default branch
        fs.writeFileSync(this.indexPath, JSON.stringify({}));  // Empty index
        fs.writeFileSync(path.join(this.refsPath, 'master'), ''); // Empty commit reference

        console.log("Repository initialized.");
    }

    loadHead() {
        if (!fs.existsSync(this.headPath)) {
            console.log("HEAD file missing, initializing repository...");
            this.initRepo(); // Ensure it's set up properly
        }
        this.HEAD = fs.readFileSync(this.headPath, 'utf-8').trim();
    }

    loadIndex() {
        if (!fs.existsSync(this.indexPath)) {
            return {}; // If index file doesn't exist, return an empty index
        }
        return JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
    }

    addFile(name, content) {
        let blob = new Blob(content);
        let index = JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
        index[name] = blob.id;
        fs.writeFileSync(this.indexPath, JSON.stringify(index));
    }

    commit(message) {
        let index = JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
        let tree = new Tree(index);
        let commit = new Commit(this.getLastCommit(), tree, message);

        // Update branch reference
        let branchPath = path.join(this.refsPath, this.HEAD);
        fs.writeFileSync(branchPath, commit.id);

        // Clear index
        fs.writeFileSync(this.indexPath, JSON.stringify({}));
        return commit;
    }

    getLastCommit() {
        let branchPath = path.join(this.refsPath, this.HEAD);
        if (fs.existsSync(branchPath)) {
            let commitHash = fs.readFileSync(branchPath, 'utf-8').trim();
            return commitHash ? Commit.load(commitHash) : null;
        }
        return null;
    }

    checkout(branchName) {
        if (this.branches[branchName]) {
            console.log(`Switching to Existing Branch: ${branchName}`)
            this.HEAD = this.branches[branchName]
        } else {
            console.log(`Switching to New Branch: ${branchName}`)
            this.branches[branchName] = new Branch(branchName, this.HEAD.commit);
            this.HEAD = this.branches[branchName];
        }    // Load the last commit’s files into index

        if (this.HEAD.commit) {
            let lastCommit = this.HEAD.commit;
            let lastTree = this.objects[lastCommit.tree]; // Retrieve the tree object
            this.index = {}; // Clear index
            for (let name in lastTree.entries) {
                this.index[name] = lastTree.entries[name]; // Restore files
            }

            console.log("Restored files from last commit.");
        } else {
            this.index = {}; // New branch, no commits yet
            console.log("New branch has no commits yet.");
        }
    }

    log() {
        let commit = this.HEAD.commit;
        let history = [];
        while (commit) {
            history.push(commit)
            commit = commit.parent ? this.objects[commit.parent] : null;
        }
        return history
    }

    status() {
        console.log("Staged Files:", Object.keys(this.index));
    }
}


let repo = new Git("test");
console.log(repo)