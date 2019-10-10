---
title: Common
---

# 树型结构

## 平级数据变成树 flat2tree
```
function flat2tree( allData, id = "id", pid = "parentId", children = "children", rootId = "") {
  let treeMapList = allData.reduce((memo, current) => {
    memo[current[id]] = current;
    return memo;
  }, {});
  return allData.reduce((arr, current) => {
    let parentId = current[pid];
    let parent = treeMapList[parentId];
    if (parentId == rootId) {
    arr.push(current);
    } else if (parent) {
        parent[children]
        ? parent[children].push(current)
        : (parent[children] = [current]);
    }  
        return arr;
  }, []);
}
```

## 树形结构转平行结构 tree2flat
```
function tree2flat(children: any, childrenKey: string): any {
    var arr: any[] = []
    for (var i = 0; i < children.length; i++) {
        arr.push(children[i])
        if (_.get(children[i], [childrenKey])) arr = arr.concat(tree2flat(children[i][childrenKey], childrenKey))
    }
    return arr
}
```