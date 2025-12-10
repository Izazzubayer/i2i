#!/bin/bash

# Setup script to add push functions to your shell profile

SHELL_PROFILE=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
fi

if [ -z "$SHELL_PROFILE" ]; then
    echo "Could not find shell profile file (.zshrc, .bashrc, or .bash_profile)"
    exit 1
fi

# Check if functions already exist
if grep -q "push_to_git()" "$SHELL_PROFILE"; then
    echo "Push functions already exist in $SHELL_PROFILE"
    read -p "Do you want to replace them? (y/n): " replace
    if [ "$replace" != "y" ]; then
        echo "Aborted."
        exit 0
    fi
    # Remove old functions
    sed -i.bak '/^push_to_git()/,/^}$/d' "$SHELL_PROFILE"
    sed -i.bak '/^push_to_bit()/,/^}$/d' "$SHELL_PROFILE"
fi

# Add functions to shell profile
cat >> "$SHELL_PROFILE" << 'EOF'

# Push to Git functions
push_to_git() {
    git config user.email "izazzubayer@gmail.com"
    if [ -z "$(git status --porcelain)" ]; then
        echo "⚠ No changes to commit"
        return
    fi
    git add -A
    if [ -z "$1" ]; then
        read -p "Enter commit message: " commit_message
    else
        commit_message="$1"
    fi
    git commit -m "$commit_message"
    if ! git remote get-url github &>/dev/null; then
        git remote add github https://github.com/Izazzubayer/i2i.git
    fi
    git push github main
    echo "✅ Pushed to GitHub!"
}

push_to_bit() {
    git config user.email "izaz@thekowcompany.com"
    if [ -z "$(git status --porcelain)" ]; then
        echo "⚠ No changes to commit"
        return
    fi
    git add -A
    if [ -z "$1" ]; then
        read -p "Enter commit message: " commit_message
    else
        commit_message="$1"
    fi
    git commit -m "$commit_message"
    # Check if origin is already Bitbucket, otherwise use/add bitbucket remote
    if git remote get-url origin 2>/dev/null | grep -q "bitbucket.org/ashikrafi/i2igpt-frontend"; then
        git push origin Izaz
    elif git remote get-url bitbucket &>/dev/null; then
        git push bitbucket Izaz
    else
        git remote add bitbucket https://izaz1@bitbucket.org/ashikrafi/i2igpt-frontend.git
        git push bitbucket Izaz
    fi
    echo "✅ Pushed to Bitbucket!"
}
EOF

echo "✅ Added push functions to $SHELL_PROFILE"
echo ""
echo "To use:"
echo "  push_to_git              - Push to GitHub (will prompt for commit message)"
echo "  push_to_git \"message\"    - Push to GitHub with commit message"
echo "  push_to_bit              - Push to Bitbucket (will prompt for commit message)"
echo "  push_to_bit \"message\"    - Push to Bitbucket with commit message"
echo ""
echo "Please run: source $SHELL_PROFILE"
