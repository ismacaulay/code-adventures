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
from typing import Optional

argparser = argparse.ArgumentParser(description="Simplified git")
argsubparser = argparser.add_subparsers(title="Commands", dest="command")
argsubparser.required = True

argsp = argsubparser.add_parser('init', help="Initialize new empty repository")
argsp.add_argument("path", metavar="directory", nargs="?",
                   default=".", help="where to create the repository")


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


def create_default_config() -> configparser.ConfigParser:
    config = configparser.ConfigParser()

    config.add_section("core")
    config.set("core", "repositoryformatversion", "0")
    config.set("core", "filemode", "false")
    config.set("core", "bare", "false")

    return config


def cmd_init(args):
    create_repo(args.path)


def main(argv=sys.argv[1:]):
    args = argparser.parse_args(argv)

    if args.command == "init":
        cmd_init(args)
