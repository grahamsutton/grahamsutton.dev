---
title: Get Git Commits by ID in Commit Message
date: "2023-03-11T22:40:00.000Z"
description: "A quick and easy way to get all commits that contain a specific substring."
tags:
    - git
    - snippet
---

This is a quick example of how to get a list of commits by substring of the commit message.

Imagine you have the following commit history (in order):

```terminal
e3bf91a #14 - Fixed README.md.
19fbd5a #14 - Removed unused variable.
81f7f7d #13 - Added new payments feature.
d046dbe #14 - Replaced tabs with spaces.
6781f7f #12 - Created new page for blog.
```

If we want to list all of the commits for issue `#14` in order, we can run the following command:

```sh
$ git log --oneline | grep -E '#14'
```

Which would output:

```terminal
e3bf91a #14 - Fixed README.md.
19fbd5a #14 - Removed unused variable.
d046dbe #14 - Replaced tabs with spaces.
```

If we wanted to output commits for multiple specific issue numbers, say only `#12` and `#14`, we could separate each issue by the pipe character `|` in the `grep -E` command, like so:

```sh
$ git log --oneline | grep -E '#12|#14'
```

Which would output:

```terminal
e3bf91a #14 - Fixed README.md.
19fbd5a #14 - Removed unused variable.
d046dbe #14 - Replaced tabs with spaces.
6781f7f #12 - Created new page for blog.
```

You can add as many issue IDs as you like and keep separating them by `|` to get as many commits by ID as you need. They will always be listed in order, from latest at the top to oldest at the bottom.

> Any substring will work in the parameter for `grep -E`. It doesn't have to be an issue ID.

To conclude, I use this approach a lot when I need to cherry-pick specific commits from a ticket or issue that I've worked on from one branch to another or when I want to look up the history of the commits related to a specific issue.
