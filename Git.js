const crypto = require('crypto');
//SHA1 hashing of objects
function sha1(data) {
    return crypto.createHash('sha1').update(data).digest('hex');
}
//Git 'blob' class, used for individual elements
class Blob {
    constructor(content) {
        this.content = content
        this.id = sha1(content)
    }
}
//Git 'tree' class, a storage of 'blobs'
class Tree {
    constructor() {
        this.entries = {};
    }
    addEntry(name, obj){
        this.entries[name] = obj;
    }
    getHash() {
        return sha1(JSON.stringify(this.entries));
    }
}

class Commit {
    constructor(parent, tree, message) {
        this.parent = parent ? parent.id : null
        this.tree = tree.getHash()
        this.message = message
        this.id = sha1(this.tree + (this.parent || '' ) + message)}
}

class Branch {
    constructor(name, commit = null) {
        this.name = name;
        this.commit = commit;
    }
}

class Git {
    constructor(name) {
        this.name = name;
        this.branches = {};
        this.objects = {};
        this.HEAD = new Branch('master');
        this.branches['master']= this.HEAD;
    }

    commit(message) {
    let tree = new Tree();
    let commit = new Commit(this.HEAD.commit, tree, message);
    console.log(tree);
    this.objects[commit.id] = commit;
    this.HEAD.commit = commit;
    return commit;
    }
    checkout(branchName) {
        if(this.branches[branchName]) {
            console.log(`Switching to Existing Branch: ${branchName}`)
            this.HEAD = this.branches[branchName]
        } else {
            console.log(`Switching to New Branch: ${branchName}`)
            this.branches[branchName] = new Branch(branchName, this.HEAD.commit);
            this.HEAD = this.branches[branchName];


        }
    }
    log() {
        let commit = this.HEAD.commit;
        let history = [];
        while(commit) {
            history.push(commit)
            commit = commit.parent ? this.objects[commit.parent]:null;
        }
        return history
    }
}


let repo = new Git("test");
console.log(repo)
repo.commit("Initial commit");
repo.commit("change1")
console.log(repo.log())
repo.checkout("feature-branch");
repo.commit("New feature");
console.log(repo)
repo.checkout("master")
repo.commit("test2")
let log = repo.log();
console.log(log);