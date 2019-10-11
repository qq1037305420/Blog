---
title: cordova 混合型app框架
sidebarDepth: 3
---

# Cordova插件封装

## Init

### plugman
- create
``` 
plugman create --name <pluginName> --plugin_id <pluginID> --plugin_version <version> [--path <directory>] [--variable NAME=VALUE]
```
- platform
```
plugman platform add --platform_name <platform>
```
- package.json
```
plugman createpackagejson <directory>
```

## plugin.xml
- plugin name
``` xml
    <js-module name="streamax" src="www/streamax.js">
        <clobbers target="cordova.plugins.streamax" />
    </js-module>
```
``` js
    cordova.plugins.streamax.toast(
        () => {
            resolve()
        },
        () => {
            reject()
        },
        [{ text }]
    )
```
- lib files
``` xml
  <lib-file src="src/android/libs/streamax.jar" />
```
- resource-file
``` xml
    <resource-file src="src/android/libs/armeabi" target="jniLibs/armeabi"/>
```
- source-file
``` xml
    <source-file src="src/android/xxxx.java" target-dir="src/com/packagename/www" />
```

## JavaScript

### register methods 注册插件函数
``` js
function ObjectName() {}

ObjectName.prototype.goVideoPage = function(success, error) {
  exec(success, error, "pluginName", "methodName");
};

var me = new ObjectName();
module.exports = me;

```
### fireWindowEvent 触发window事件

``` js
var channel = require("cordova/channel");

function Streamax() {}

var me = new Streamax();

channel.onCordovaReady.subscribe(function() {
  me.registerKeyboardListener(
    function(streamaxKeycode) {
      cordova.fireWindowEvent("onkeyboardclick", { streamaxKeycode });
    },
    function(e) {
      console.error(e);
    }
  );
});
```

## Android

### gradle 使用gradle
- plugin.xml
``` xml
    <framework src="src/android/libs/common.gradle" custom="true" type="gradleReference" />

```
- xxx.gradle
  - 例子: 阿里云push
``` gradle
def minSdkVersion = 19

if(cdvMinSdkVersion == null) {
    ext.cdvMinSdkVersion = minSdkVersion;
} else if (cdvMinSdkVersion.toInteger() < minSdkVersion) {
    ext.cdvMinSdkVersion = minSdkVersion;
}

android {
    defaultConfig {
        applicationId "com.xxx.xxx" //包名
        ndk {
            //选择要添加的对应cpu类型的.so库。
            abiFilters 'armeabi', 'arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64', 'mips', 'mips64'
        }
    }
}

dependencies {
    api 'com.aliyun.ams:alicloud-android-push:3.1.4@aar'
    api 'com.aliyun.ams:alicloud-android-utils:1.1.3'
    api 'com.aliyun.ams:alicloud-android-beacon:1.0.1'
    api 'com.aliyun.ams:alicloud-android-ut:5.4.0'
    api 'com.aliyun.ams:alicloud-android-push:3.1.4'
}
```
### reflect methods 方法映射
- execute
``` java
@Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        Class<T> classname = T.class;
        try {
            Method method = classname.getDeclaredMethod(action, JSONArray.class, CallbackContext.class);
            return (Boolean) method.invoke(this, args, callbackContext);
        } catch (NoSuchMethodException e) {
            callbackContext.error("404");
        } catch (InvocationTargetException e) {
            callbackContext.error("500");
        } catch (IllegalAccessException e) {
            callbackContext.error("500");
        } catch (Exception e) {
            callbackContext.error("500");
        }
        return false;
    }
```
- method
``` java
 private boolean openMapLocation(JSONArray args, final CallbackContext callbackContext) throws JSONException {
        JSONObject obj = args.getJSONObject(0);
        Log.wtf(obj.toString())
 }
```

