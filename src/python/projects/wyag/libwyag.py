"""
A simplified git implementation based on "write yourself a git"

https://wyag.thb.lt/
"""
import argparse
import collections
import configparser
import hashlib
import os
import re
import sys
import zlib
from typing import Optional, BinaryIO, cast, Tuple, List

argparser = argparse.ArgumentParser(description="Simplified git")
argsubparser = argparser.add_subparsers(title="Commands", dest="command")
argsubparser.required = True

argsp = argsubparser.add_parser("init", help="Initialize new empty repository")
argsp.add_argument("path", metavar="directory", nargs="?",
                   default=".", help="where to create the repository")

argsp = argsubparser.add_parser(
    "cat-file", help="Provide content of repository objects")
argsp.add_argument("type", metavar="type", choices=[
                   "blob", "commit", "tag", "tree"], help="Specify the type")
argsp.add_argument("object", metavar="object", help="The object to display")

argsp = argsubparser.add_parser(
    "hash-object", help="Compute object ID and optionally creates a blob from a file")
argsp.add_argument("-t", metavar="type", dest="type", choices=[
                   "blob", "commit", "tag", "tree"], default="blob", help="Specify the type")
argsp.add_argument("-w", dest="write", action="store_true",
                   help="Actually write the object to the repository")
argsp.add_argument("path", help="Read object from <file>")

argsp = argsubparser.add_parser(
    "log", help="Display history of a given commit")
argsp.add_argument("commit", default="HEAD", nargs="?",
                   help="Commit to start at.")

argsp = argsubparser.add_parser(
    "ls-tree", help="Pretty-print a tree object")
argsp.add_argument("object", help="The object to show")

argsp = argsubparser.add_parser(
    "checkout", help="Checkout a commit inside a directory")
argsp.add_argument("commit", help="The commit or tree to checkout")
argsp.add_argument("path", help="The EMPTY directory to checkout on")

argsp = argsubparser.add_parser("show-ref", help="List references.")

argsp = argsubparser.add_parser(
    "tag",
    help="List and create tags")
argsp.add_argument("-a",
                   action="store_true",
                   dest="create_tag_object",
                   help="Whether to create a tag object")
argsp.add_argument("name",
                   nargs="?",
                   help="The new tag's name")
argsp.add_argument("object",
                   default="HEAD",
                   nargs="?",
                   help="The object the new tag will point to")

argsp = argsubparser.add_parser(
    "rev-parse",
    help="Parse revision (or other objects )identifiers")
argsp.add_argument("--wyag-type",
                   metavar="type",
                   dest="type",
                   choices=["blob", "commit", "tag", "tree"],
                   default=None,
                   help="Specify the expected type")
argsp.add_argument("name",
                   help="The name to parse")


class Repository(object):
    """An abstraction for a respoitory"""

    def __init__(self, path: str, force=False):
        self.worktree = path
        self.gitdir = os.path.join(path, '.git')

        if not force and not os.path.isdir(path):
            raise Exception(f"Not a Git repository: {path}")

        self.conf = configparser.ConfigParser()
        cpath = repo_file(self, "config")

        if cpath and os.path.exists(cpath):
            self.conf.read(cpath)
        elif not force:
            raise Exception("Config file missing")

        if not force:
            vers = int(self.conf.get("core", "repositoryformatversion"))
            if vers != 0:
                raise Exception(
                    f"Unsupported respositoryformatversion: {vers}")


class GitObject(object):
    fmt: bytes

    def __init__(self, repo: Optional[Repository], data: Optional[bytes] = None):
        self.repo = repo

        if data != None:
            self.deserialize(data)

    def serialize(self) -> bytes:
        raise NotImplementedError

    def deserialize(self, data):
        raise NotImplementedError


class GitCommit(GitObject):
    fmt = b'commit'

    def serialize(self):
        return kvlm_serialize(self.kvlm)

    def deserialize(self, data: bytes):
        self.kvlm = kvlm_parse(data)


class GitTree(GitObject):
    fmt = b'tree'

    def serialize(self):
        return tree_serialize(self)

    def deserialize(self, data: bytes):
        self.items = tree_parse(data)


class GitTreeLeaf(object):
    def __init__(self, mode, path, sha):
        self.mode = mode
        self.path = path
        self.sha = sha


class GitTag(GitCommit):
    fmt = b'tag'


class GitBlob(GitObject):
    fmt = b'blob'

    def serialize(self):
        return self.blobdata

    def deserialize(self, data: bytes):
        self.blobdata = data


class GitIndexEntry(object):
    ctime = None
    """The last time a file's metadata changed.  This is a tuple (seconds, nanoseconds)"""

    mtime = None
    """The last time a file's data changed.  This is a tuple (seconds, nanoseconds)"""

    dev = None
    """The ID of device containing this file"""
    ino = None
    """The file's inode number"""
    mode_type = None
    """The object type, either b1000 (regular), b1010 (symlink), b1110 (gitlink). """
    mode_perms = None
    """The object permissions, an integer."""
    uid = None
    """User ID of owner"""
    gid = None
    """Group ID of ownner (according to stat 2.  Isn'th)"""
    size = None
    """Size of this object, in bytes"""
    obj = None
    """The object's hash as a hex string"""
    flag_assume_valid = None
    flag_extended = None
    flag_stage = None
    flag_name_length = None
    """Length of the name if < 0xFFF (yes, three Fs), -1 otherwise"""

    name = None


def repo_path(repo: Repository, *path: str) -> str:
    """Compute a path under a repo's gitdir"""
    return os.path.join(repo.gitdir, *path)


def repo_file(repo: Repository, *path: str, mkdir=False) -> Optional[str]:
    """Compute a file path under a repos gitdir, create dirs up to last component if mkdir"""
    if repo_dir(repo, *path[:-1], mkdir=mkdir):
        return repo_path(repo, *path)


def repo_dir(repo: Repository, *path: str, mkdir=False) -> Optional[str]:
    """Compute a dir under a repos gitdir, create if mkdir"""
    rpath = repo_path(repo, *path)

    if os.path.exists(rpath):
        if os.path.isdir(rpath):
            return rpath
        else:
            raise Exception(f"Not a directory: {path}")

    if mkdir:
        os.makedirs(rpath)
        return rpath
    return None


def repo_find(path=".", required=True) -> Optional[Repository]:
    """Finds the .git directory by recursing up the directory tree"""
    rpath = os.path.realpath(path)

    # we are looking for the .git directory
    if os.path.isdir(os.path.join(rpath, ".git")):
        return Repository(rpath)

    parent = os.path.realpath(os.path.join(rpath, '..'))
    # check if the parent path is the same as the path (ie. when we are at /)
    if parent == path:
        if required:
            raise Exception("No git directory found")
        return None

    # keep recursing up the path until we either find the .git dir or hit the root
    return repo_find(parent, required)


def object_read(repo: Repository, sha: str) -> GitObject:
    """
    Read an object from the git repo using the sha,
    returning the correct GitObject type based on that object
    """
    # the first 2 char of the sha are the directory, and the remaining is the filename
    path = repo_file(repo, "objects", sha[0:2], sha[2:])
    if not path:
        raise Exception(f"Unknown object: {path}")

    with open(path, "rb") as f:
        raw = zlib.decompress(f.read())

        # find the object type, it will be the bytes before the first space char
        x = raw.find(b' ')
        fmt = raw[0:x]

        # read the object size, it is the bytes after the space, before a null term
        # it is stored as ascii hex codes
        y = raw.find(b'\x00', x)
        size = int(raw[x:y].decode("ascii"))
        if size != len(raw) - y - 1:
            raise Exception(f"Malformed object {sha}: bad length")

        if fmt == b'commit':
            return GitCommit(repo, raw[y+1:])
        elif fmt == b'tree':
            return GitTree(repo, raw[y+1:])
        elif fmt == b'tag':
            return GitTag(repo, raw[y+1:])
        elif fmt == b'blob':
            return GitBlob(repo, raw[y+1:])
        else:
            raise Exception(
                f"Unknown type {fmt.decode('acsii')} for object {sha}")


def object_find(repo: Repository, name: str, fmt: Optional[bytes] = None, follow=True) -> Optional[str]:
    """Find an object sha in the git repo"""
    sha = object_resolve(repo, name)

    if not sha:
        raise Exception("No such reference {0}.".format(name))

    if len(sha) > 1:
        raise Exception(
            "Ambiguous reference {0}: Candidates are:\n - {1}.".format(name,  "\n - ".join(sha)))

    sha = sha[0]

    if not fmt:
        return sha

    while True:
        obj = object_read(repo, sha)

        if obj.fmt == fmt:
            return sha

        if not follow:
            return None

        # Follow tags
        if obj.fmt == b'tag':
            sha = cast(GitTag, obj).kvlm[b'object'].decode("ascii")
        elif obj.fmt == b'commit' and fmt == b'tree':
            sha = cast(GitCommit, obj).kvlm[b'tree'].decode("ascii")
        else:
            return None


def object_write(obj: GitObject, actually_write=True) -> str:
    """Write an object to the filesystem"""
    # serialize the object data
    data = obj.serialize()

    # add the header info
    data = obj.fmt + b' ' + str(len(data)).encode() + b'\x00' + data

    # hash the data
    sha = hashlib.sha1(data).hexdigest()

    if actually_write:
        if not obj.repo:
            raise Exception("No repo for object")

        path = repo_file(obj.repo, "objects",
                         sha[0:2], sha[2:], mkdir=actually_write)
        if not path:
            raise Exception("Failed to get path while creating object")

        with open(path, "wb") as f:
            f.write(zlib.compress(data))

    return sha


def kvlm_parse(raw: bytes, start=0, dct: Optional[collections.OrderedDict] = None) -> collections.OrderedDict:
    """parse the message and return an ordered dict of the key-value pairs"""
    if not dct:
        dct = collections.OrderedDict()

    # search for the next space and the next newline
    spc = raw.find(b' ', start)
    nl = raw.find(b'\n', start)

    # if newline appears first (or there is no space at all), we assume a blank line
    # this means that the remainder of the data is the message
    if spc < 0 or nl < spc:
        assert(nl == start)
        dct[b''] = raw[start+1:]
        return dct

    # read a key-value pair and recurse for the next
    key = raw[start:spc]

    # find the end of the value, it may continue on multiple lines
    end = start
    while True:
        # find the newline char
        end = raw.find(b'\n', end+1)
        # if the next character is not a space, we found the end of the value
        if raw[end+1] != ord(' '):
            break

    # get the value and drop the leading space on continuation lines
    value = raw[spc+1:end].replace(b'\n ', b'\n')

    # store the value in dct, but dont just replace it. if it already
    # exists turn it into a list of values for the key
    if key in dct:
        if type(dct[key]) == list:
            dct[key].append(value)
        else:
            dct[key] = [dct[key], value]
    else:
        dct[key] = value

    return kvlm_parse(raw, start=end+1, dct=dct)


def kvlm_serialize(kvlm: collections.OrderedDict) -> bytes:
    ret = b''

    for k in kvlm.keys():
        # skip the message itself
        if k == b'':
            continue

        value = kvlm[k]
        if type(value) != list:
            value = [value]

        for v in value:
            # serialize the key-value pair and ensure the continuation lines start with a space
            ret += k + b' ' + (v.replace(b'\n', b'\n ')) + b'\n'

    # append the message
    ret += b'\n' + kvlm[b'']

    return ret


def tree_parse_one(raw: bytes, start=0) -> Tuple[int, GitTreeLeaf]:
    # find the space terminator for the mode
    x = raw.find(b' ', start)
    assert(x-start == 5 or x-start == 6)

    mode = raw[start:x]

    # find the null terminator for the path
    y = raw.find(b'\x00', x)

    path = raw[x+1:y]

    sha = hex(int.from_bytes(raw[y+1:y+21], "big"))[2:]

    return y+21, GitTreeLeaf(mode, path, sha)


def tree_parse(raw: bytes) -> List[GitTreeLeaf]:
    pos = 0
    max = len(raw)
    ret = list()

    while pos < max:
        pos, data = tree_parse_one(raw, pos)
        ret.append(data)
    return ret


def tree_serialize(obj: GitTree) -> bytes:
    ret = b''
    for i in obj.items:
        ret += i.mode
        ret += b' '
        ret += i.path
        ret += b'\x00'
        ret += int(i.sha, 16).to_bytes(20, byteorder="big")
    return ret


def tree_checkout(repo: Repository, tree: GitTree, path: bytes):
    for item in tree.items:
        obj = object_read(repo, item.sha)
        dest = os.path.join(path, item.path)

        if obj.fmt == b'tree':
            os.mkdir(dest)
            tree_checkout(repo, cast(GitTree, obj), dest)
        elif obj.fmt == b'blob':
            with open(dest, 'wb') as f:
                f.write(cast(GitBlob, obj).blobdata)


def ref_resolve(repo: Repository, ref: str) -> str:
    path = repo_file(repo, ref)
    if not path:
        raise Exception(f"Unknown ref: {ref}")
    with open(path, "r") as f:
        # ignore the trailing \n
        data = f.read()[:-1]

    if data.startswith("ref: "):
        return ref_resolve(repo, data[5:])
    return data


def ref_list(repo: Repository, path: Optional[str] = None) -> collections.OrderedDict:
    if not path:
        path = repo_dir(repo, "refs")

    if not path:
        raise Exception("Unknown path: refs")

    ret = collections.OrderedDict()
    for f in sorted(os.listdir(path)):
        can = os.path.join(path, f)
        if os.path.isdir(can):
            ret[f] = ref_list(repo, can)
        else:
            ret[f] = ref_resolve(repo, can)

    return ret


def create_repo(path: str):
    """Creates a new repository at path"""
    repo = Repository(path, True)

    assert(repo_dir(repo, "branches", mkdir=True))
    assert(repo_dir(repo, "objects", mkdir=True))
    assert(repo_dir(repo, "refs/heads", mkdir=True))
    assert(repo_dir(repo, "refs/tags", mkdir=True))

    fpath = repo_file(repo, "description")
    if fpath:
        with open(fpath, "w") as f:
            f.write(
                "Unnamed repository; edit this file 'description' to name the repository.\n")

    fpath = repo_file(repo, "HEAD")
    if fpath:
        with open(fpath, "w") as f:
            f.write("ref: refs/heads/master\n")

    fpath = repo_file(repo, "config")
    if fpath:
        with open(fpath, "w") as f:
            config = create_default_config()
            config.write(f)


def cat_file(repo: Repository, obj: str, fmt: Optional[bytes] = None):
    sha = object_find(repo, obj, fmt=fmt)
    git_obj = object_read(repo, sha)
    sys.stdout.buffer.write(git_obj.serialize())


def object_hash(fd: BinaryIO, fmt: str, repo: Optional[Repository] = None) -> str:
    data = fd.read()

    if fmt == b'commit':
        obj = GitCommit(repo, data)
    elif fmt == b'tree':
        obj = GitTree(repo, data)
    elif fmt == b'tag':
        obj = GitTag(repo, data)
    elif fmt == b'blob':
        obj = GitBlob(repo, data)
    else:
        raise Exception(
            f"Unknown type {fmt}")

    return object_write(obj, repo != None)


def object_resolve(repo: Repository, name: str) -> Optional[List[str]]:
    """
    Resolve name to an object hash in repo.

    This function is aware of:

     - the HEAD literal
     - short and long hashes
     - tags
     - branches
     - remote branches
    """
    candidates = list()
    hash_re = re.compile(r"^[0-9A-Fa-f]{1,16}$")
    small_hash_re = re.compile(r"^[0-9A-Fa-f]{1,16}$")

    # Empty string?  Abort.
    if not name.strip():
        return None

    # Head is nonambiguous
    if name == "HEAD":
        return [ref_resolve(repo, "HEAD")]

    if hash_re.match(name):
        if len(name) == 40:
            # This is a complete hash
            return [name.lower()]
        elif len(name) >= 4:
            # This is a small hash 4 seems to be the minimal length
            # for git to consider something a short hash.
            # This limit is documented in man git-rev-parse
            name = name.lower()
            prefix = name[0:2]
            path = repo_dir(repo, "objects", prefix, mkdir=False)
            if path:
                rem = name[2:]
                for f in os.listdir(path):
                    if f.startswith(rem):
                        candidates.append(prefix + f)

    return candidates


def create_default_config() -> configparser.ConfigParser:
    config = configparser.ConfigParser()

    config.add_section("core")
    config.set("core", "repositoryformatversion", "0")
    config.set("core", "filemode", "false")
    config.set("core", "bare", "false")

    return config


def log_graphviz(repo: Repository, sha: str, seen: set):
    if sha in seen:
        return

    seen.add(sha)
    obj = object_read(repo, sha)
    assert(obj.fmt == b'commit')

    commit = cast(GitCommit, obj)

    if not b'parent' in commit.kvlm.keys():
        return

    parents = commit.kvlm[b'parent']
    if type(parents) != list:
        parents = [parents]

    for p in parents:
        p = p.decode("ascii")
        print(f"c_{sha} -> c_{p};")
        log_graphviz(repo, p, seen)


def show_ref(repo: Repository, refs: collections.OrderedDict, with_hash=True, prefix=""):
    for k, v in refs.items():
        if type(v) == str:
            print("{0}{1}{2}".format(
                v + " " if with_hash else "",
                prefix + "/" if prefix else "",
                k))
        else:
            show_ref(repo, v, with_hash=with_hash, prefix="{0}{1}{2}".format(
                prefix, "/" if prefix else "", k))


def tag_create(repo: Repository, name: str, reference: str, create_tag_object):
    # get the GitObject from the object reference
    sha = object_find(repo, reference)

    if create_tag_object:
        # create tag object (commit)
        tag = GitTag(repo)
        tag.kvlm = collections.OrderedDict()
        tag.kvlm[b'object'] = sha.encode()
        tag.kvlm[b'type'] = b'commit'
        tag.kvlm[b'tag'] = name.encode()
        tag.kvlm[b'tagger'] = b'The soul eater <grim@reaper.net>'
        tag.kvlm[b''] = b'This is the commit message that should have come from the user\n'
        tag_sha = object_write(tag, repo)
        # create reference
        ref_create(repo, "tags/" + name, tag_sha)
    else:
        # create lightweight tag (ref)
        ref_create(repo, "tags/" + name, sha)


def ref_create(repo: Repository, ref_name: str, sha: str):
    path = repo_file(repo, "refs/" + ref_name)
    if not path:
        raise Exception("Unknown refs path")

    with open(path, 'w') as f:
        f.write(sha + "\n")


def cmd_init(args):
    create_repo(args.path)


def cmd_cat_file(args):
    repo = repo_find()
    if not repo:
        raise Exception("error: not in a git repository")
    cat_file(repo, args.object, args.type.encode())


def cmd_hash_object(args):
    if args.write:
        repo = Repository(".")
    else:
        repo = None

    with open(args.path, "rb") as f:
        sha = object_hash(f, args.type.encode(), repo)
        print(sha)


def cmd_log(args):
    repo = repo_find()

    if not repo:
        raise Exception("Not a git repository")

    sha = object_find(repo, args.commit)
    if not sha:
        raise Exception("Unable to find object")

    print("digraph wyaglog{")
    log_graphviz(repo, sha, set())
    print("}")


def cmd_ls_tree(args):
    repo = repo_find()
    if not repo:
        raise Exception("Not a git repository")

    sha = object_find(repo, args.object, fmt=b'tree')
    if not sha:
        raise Exception("Unable to find object")

    obj = object_read(repo, sha)
    tree = cast(GitTree, obj)

    for item in tree.items:
        print("{0} {1} {2}\t{3}".format(
            "0" * (6 - len(item.mode)) + item.mode.decode("ascii"),
            # Git's ls-tree displays the type
            # of the object pointed to.  We can do that too :)
            object_read(repo, item.sha).fmt.decode("ascii"),
            item.sha,
            item.path.decode("ascii")))


def cmd_checkout(args):
    repo = repo_find()
    if not repo:
        raise Exception("Not a git repository")

    sha = object_find(repo, args.commit)
    if not sha:
        raise Exception("Unable to find object")

    obj = object_read(repo, sha)

    if obj.fmt == b'commit':
        obj = cast(GitCommit, obj)
        obj = object_read(repo, obj.kvlm[b'tree'].decode("ascii"))

    if os.path.exists(args.path):
        if not os.path.isdir(args.path):
            raise Exception(f"Not a directory{args.path}")
        if os.listdir(args.path):
            raise Exception(f"Not empty{args.path}")
    else:
        os.makedirs(args.path)

    tree_checkout(repo, cast(GitTree, obj),
                  os.path.realpath(args.path).encode())


def cmd_show_ref(args):
    repo = repo_find()
    if not repo:
        raise Exception("Not a git repository")

    refs = ref_list(repo)
    show_ref(repo, refs, prefix="refs")


def cmd_tag(args):
    repo = repo_find()
    if not repo:
        raise Exception("Not a git repository")

    if args.name:
        tag_create(repo,
                   args.name,
                   args.object,
                   args.create_tag_object)
    else:
        refs = ref_list(repo)
        show_ref(repo, refs["tags"], with_hash=False)


def cmd_rev_parse(args):
    if args.type:
        fmt = args.type.encode()

    repo = repo_find()
    if not repo:
        raise Exception("Not a git repository")

    print(object_find(repo, args.name, args.type, follow=True))


def main(argv=sys.argv[1:]):
    args = argparser.parse_args(argv)

    if args.command == "init":
        cmd_init(args)
    elif args.command == "cat-file":
        cmd_cat_file(args)
    elif args.command == "hash-object":
        cmd_hash_object(args)
    elif args.command == "log":
        cmd_log(args)
    elif args.command == "ls-tree":
        cmd_ls_tree(args)
    elif args.command == "checkout":
        cmd_checkout(args)
    elif args.command == "show-ref":
        cmd_show_ref(args)
    elif args.command == "tag":
        cmd_tag(args)
    elif args.command == "rev-parse":
        cmd_rev_parse(args)
