# Push Scripts Documentation

## Quick Setup

### Option 1: Use the Shell Script (Recommended)
Run the setup script to add functions to your shell:
```bash
./setup-push-aliases.sh
source ~/.zshrc  # or ~/.bashrc
```

Then you can use:
- `push_to_git` - Push to GitHub
- `push_to_bit` - Push to Bitbucket

### Option 2: Use the Standalone Script
```bash
./push.sh git          # Push to GitHub
./push.sh bit          # Push to Bitbucket
./push.sh git "message" # Push to GitHub with commit message
./push.sh bit "message" # Push to Bitbucket with commit message
```

## What Each Command Does

### `push_to_git` or `./push.sh git`
- Sets git email to `izazzubayer@gmail.com`
- Stages all changes
- Commits (prompts for message if not provided)
- Pushes to GitHub: `https://github.com/Izazzubayer/i2i.git`
- Uses current branch

### `push_to_bit` or `./push.sh bit`
- Sets git email to `izaz@thekowcompany.com`
- Stages all changes
- Commits (prompts for message if not provided)
- Pushes to Bitbucket: `https://izaz1@bitbucket.org/ashikrafi/i2igpt-frontend.git`
- Always pushes to `Izaz` branch

## Examples

```bash
# Push to GitHub with auto-generated message
push_to_git "Update orders page with new features"

# Push to Bitbucket
push_to_bit "Fix bug in portfolio page"

# Push without commit message (will prompt)
push_to_git
push_to_bit
```

## Notes
- Both functions automatically add the remote if it doesn't exist
- Both functions check for uncommitted changes before proceeding
- The script will stage all changes automatically
