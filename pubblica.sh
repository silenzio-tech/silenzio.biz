#!/bin/bash
set -e

echo "==> Compilazione sito Hugo..."
hugo --cleanDestinationDir

echo "==> Pulizia server Android..."
adb shell rm -rf /sdcard/htdocs/*

echo "==> Sincronizzazione nuovi file via ADB..."
adb push public/. /sdcard/htdocs/

echo "==> Pubblicazione completata con successo!"
