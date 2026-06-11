#!/bin/bash
pushd "$(dirname "$0")" > /dev/null
echo "当前目录是: $(pwd)"
adb shell mkdir -p /sdcard/android/data/com.qihoo.contents/files/crx/local;
adb shell rm -rf /sdcard/android/data/com.qihoo.contents/files/crx/local/*;
adb push *.crx /sdcard/android/data/com.qihoo.contents/files/crx/local;
popd > /dev/null
