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
from typing import Optional, BinaryIO

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


class GitTree(GitObject):
    fmt = b'tree'


class GitTag(GitObject):
    fmt = b'tag'


class GitBlob(GitObject):
    fmt = b'blob'

    def serialize(self):
        return self.blobdata

    def deserialize(self, data: bytes):
        self.blobdata = data


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


def object_find(repo: Repository, name: str, fmt: Optional[bytes] = None, follow=True) -> str:
    """Find an object sha in the git repo"""
    return name


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


def create_default_config() -> configparser.ConfigParser:
    config = configparser.ConfigParser()

    config.add_section("core")
    config.set("core", "repositoryformatversion", "0")
    config.set("core", "filemode", "false")
    config.set("core", "bare", "false")

    return config


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


def main(argv=sys.argv[1:]):
    args = argparser.parse_args(argv)

    if args.command == "init":
        cmd_init(args)
    elif args.command == "cat-file":
        cmd_cat_file(args)
    elif args.command == "hash-object":
        cmd_hash_object(args)
