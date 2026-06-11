@echo off
set ORIGINAL_DIR=%cd%
set SCRIPT_DIR=%~dp0
echo "ORIGINAL_DIR="%cd%
echo "SCRIPT_DIR="%SCRIPT_DIR%

cd  %SCRIPT_DIR%
adb shell mkdir -p /sdcard/android/data/com.qihoo.contents/files/crx/local
adb shell rm -rf /sdcard/android/data/com.qihoo.contents/files/crx/local/*
adb push *.crx /sdcard/android/data/com.qihoo.contents/files/crx/local
cd  %ORIGINAL_DIR%