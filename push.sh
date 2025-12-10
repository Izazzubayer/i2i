#!/bin/bash

# Script to push to either GitHub or Bitbucket with appropriate configurations

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to push to GitHub
push_to_git() {
    echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
    
    # Set git email
    git config user.email "izazzubayer@gmail.com"
    echo -e "${GREEN}✓ Set git email to izazzubayer@gmail.com${NC}"
    
    # Check if there are changes
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠ No changes to commit${NC}"
        return
    fi
    
    # Stage all changes
    git add -A
    echo -e "${GREEN}✓ Staged all changes${NC}"
    
    # Get commit message
    if [ -z "$1" ]; then
        read -p "Enter commit message: " commit_message
    else
        commit_message="$1"
    fi
    
    # Commit
    git commit -m "$commit_message"
    echo -e "${GREEN}✓ Committed changes${NC}"
    
    # Check if GitHub remote exists, use 'github' or add it
    if ! git remote get-url github &>/dev/null; then
        echo -e "${YELLOW}⚠ GitHub remote not found. Adding...${NC}"
        git remote add github https://github.com/Izazzubayer/i2i.git
    fi
    github_remote="github"
    
    # Push to GitHub (main branch)
    echo -e "${BLUE}Pushing to GitHub (branch: main)...${NC}"
    current_branch=$(git branch --show-current)
    
    # If not on main, we need to push current branch to main
    if [ "$current_branch" != "main" ]; then
        echo -e "${YELLOW}⚠ Currently on '$current_branch' branch. Pushing to main...${NC}"
        git push "$github_remote" "$current_branch:main" || {
            echo -e "${YELLOW}⚠ Direct push failed. Trying force push...${NC}"
            read -p "Force push to main? (y/n): " force_confirm
            if [ "$force_confirm" = "y" ]; then
                git push "$github_remote" "$current_branch:main" --force
            else
                echo -e "${RED}Push cancelled${NC}"
                exit 1
            fi
        }
    else
        git push "$github_remote" main
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    else
        echo -e "${RED}❌ Failed to push to GitHub${NC}"
        exit 1
    fi
}

# Function to push to Bitbucket
push_to_bit() {
    echo -e "${BLUE}🚀 Pushing to Bitbucket...${NC}"
    
    # Set git email
    git config user.email "izaz@thekowcompany.com"
    echo -e "${GREEN}✓ Set git email to izaz@thekowcompany.com${NC}"
    
    # Check if there are changes
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠ No changes to commit${NC}"
        return
    fi
    
    # Stage all changes
    git add -A
    echo -e "${GREEN}✓ Staged all changes${NC}"
    
    # Get commit message
    if [ -z "$1" ]; then
        read -p "Enter commit message: " commit_message
    else
        commit_message="$1"
    fi
    
    # Commit
    git commit -m "$commit_message"
    echo -e "${GREEN}✓ Committed changes${NC}"
    
    # Check if Bitbucket remote exists (check both 'origin' and 'bitbucket')
    bitbucket_remote=""
    if git remote get-url origin 2>/dev/null | grep -q "bitbucket.org/ashikrafi/i2igpt-frontend"; then
        bitbucket_remote="origin"
        echo -e "${GREEN}✓ Using existing 'origin' remote for Bitbucket${NC}"
    elif git remote get-url bitbucket &>/dev/null; then
        bitbucket_remote="bitbucket"
    else
        echo -e "${YELLOW}⚠ Bitbucket remote not found. Adding as 'bitbucket'...${NC}"
        git remote add bitbucket https://izaz1@bitbucket.org/ashikrafi/i2igpt-frontend.git
        bitbucket_remote="bitbucket"
    fi
    
    # Push to Bitbucket (Izaz branch)
    echo -e "${BLUE}Pushing to Bitbucket (branch: Izaz)...${NC}"
    git push "$bitbucket_remote" Izaz
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed to Bitbucket!${NC}"
    else
        echo -e "${RED}❌ Failed to push to Bitbucket${NC}"
        exit 1
    fi
}

# Main script
case "$1" in
    "git")
        push_to_git "$2"
        ;;
    "bit")
        push_to_bit "$2"
        ;;
    *)
        echo -e "${RED}Usage:${NC}"
        echo -e "  ${GREEN}./push.sh git${NC}          - Push to GitHub"
        echo -e "  ${GREEN}./push.sh git \"message\"${NC}  - Push to GitHub with commit message"
        echo -e "  ${GREEN}./push.sh bit${NC}          - Push to Bitbucket"
        echo -e "  ${GREEN}./push.sh bit \"message\"${NC}  - Push to Bitbucket with commit message"
        exit 1
        ;;
esac
