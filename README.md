# flowrBoxr

An MCP (Model Context Protocol) server that generates flower box comments — decorative box comments made of repeated comment characters surrounding text.

Ported from the algorithm in [Kingsrook's IntelliJ Commentator Plugin](https://github.com/Kingsrook/intellij-commentator-plugin).

## Examples

Single-line:
```
//////////
// Test //
//////////
```

Multi-line with indentation:
```
   /////////////
   // Test    //
   // In Here //
   /////////////
```

Shell-style:
```
##########
## Test ##
##########
```

## Tool: `create_flower_box_comment`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | yes | The text to put inside the flower box. Can be multi-line. |
| `filename` | string | no | Filename or extension (e.g., `foo.py`) to auto-detect the comment character. |
| `comment_char` | string | no | Explicit comment character (`/`, `#`, `-`, etc.). Overrides filename detection. |
| `indent` | number | no | Number of spaces to indent the entire box. |

### Comment character auto-detection

| Character | Extensions |
|-----------|-----------|
| `/` | js, ts, jsx, tsx, java, c, cpp, h, hpp, cs, go, rs, swift, kt, scala, groovy, gradle, json, css, scss, less, php |
| `#` | sh, bash, zsh, py, rb, pl, yaml, yml, toml, tf, r, coffee, makefile, dockerfile, vtl, vm, conf, env, gitignore |
| `-` | sql, lua, hs, elm, ada |
| `;` | clj, cljs, el, lisp, scm, asm |
| `%` | tex, erl, m |

Defaults to `/` if the extension is not recognized.

## Setup

```sh
npm install
```

### Register with Claude Code

```sh
claude mcp add --scope user flowrBoxr -- node /path/to/flowrBoxr/index.js
```

Then add this to `~/.claude/CLAUDE.md` so Claude always uses the tool:

```markdown
## Flower Box Comments
When writing or editing code in a codebase that uses flower box comments, **always use the
`mcp__flowrBoxr__create_flower_box_comment` tool** to generate them. Do not hand-write flower
box comments. Pass the filename so it auto-detects the comment character, and use the `indent`
parameter to match surrounding indentation.
```

## Running tests

```sh
node test.js
```
