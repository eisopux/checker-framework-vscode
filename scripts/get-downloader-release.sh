#!/bin/bash

REPO="eisopux/checker-framework-languageserver-downloader"

# Get the latest release download URL
DOWNLOAD_URL=$(curl -s https://api.github.com/repos/$REPO/releases/latest | grep 'browser_' | cut -d\" -f4)

JAR="./checker-framework-languageserver-downloader.jar"

# Use wget or curl to download the release and overwrite if it exists
wget $DOWNLOAD_URL -O $JAR || curl -L $DOWNLOAD_URL -o $JAR

echo "Downloaded the latest release to $JAR."
