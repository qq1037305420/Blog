---
title: 日常
sidebarDepth: 3
---


## 多层解构函数
```js
let data = {
  a: {
    b: 'xxx',
    c: {
      d: 0
    }
  }
}

let {a, a: {b, c, c: {d, d: {f = 0}}}} = data
console.log(a, b, c, d, f)

```


## Proxy地图
```js 
class Markers {
  data = null;

  _map = null;

  options = null;

  markers = {};

  static getInstance(map) {
    const markerClass = new Markers(map);

    return new Proxy(markerClass, {
      get(target, key) {
        return target[key];
      },
      set(target, key, value) {
        if (key == "options") {
          if (!value || _.isEmpty(value)) {
            markerClass.reset();
          } else {
            // 新来的
            let temp = value.reduce((obj, each) => {
              obj[each.id] = each;
              return obj;
            }, {});
            // 删除
            _.keys(target.options).forEach(key => {
              if (!_.keys(temp).includes(key)) {
                target.options[key] = null;
              }
            });
            // 新或新增
            _.keys(temp).forEach(key => {
              target.options[key] = temp[key];
            });
          }
        } else {
          return Reflect.set(target, key, value);
        }
      }
    });
  }

  constructor(map, options) {
    let me = this;
    me._map = map;
    me.options = new Proxy({}, {
      get(target, key) {
        return target[key];
      },
      set(target, key, value) {
        let marker = me.markers[key];
        // 删除
        if (!value || !value.position) {
          if (marker) {
            me.removeMarker(marker);
            me.markers[key] = null;
          }
        } else {
          // 新增
          if (!marker) {
            marker = me.buildMarker(value.position[0], value.position[1]);
            me.markers[key] = marker;
          } else {
            // 更新
            me.updateMarker(marker, value);
          }
        }
        return Reflect.set(target, key, value);
      }
    });
  }

  updateMarker(marker, option) {
    marker.setPosition(new AMap.LngLat(option.position[0], option.position[1]));
  }

  buildMarker(lng, lat) {
    let mk = new AMap.Marker({ position: new AMap.LngLat(lng, lat) });
    this.addMarker(mk);
    return mk;
  }

  addMarker(markers) {
    this._map.add(_.castArray(markers));
  }

  removeMarker(markers) {
    this._map.remove(_.castArray(markers));
  }

  reset() {
    this.removeMarker(Object.values(this.markers));
    this.markers = {};
  }
}



const ranPoint = function() {
  return turf.randomPosition([116.358421, 39.937639, 116.443222, 39.872983]);
};

const map = new AMap.Map("container", {
  zoom: 13
});

let markers = [];

for (let i = 0; i < 100; i++) {
  markers.push({ id: "marker" + i, position: ranPoint() });
}

map.on("complete", e => {
  let mk = Markers.getInstance(map);

  mk.options = markers;

  setInterval(() => {
    let ranIndex = _.random(0, 100);
    let updateData = { id: "marker" + ranIndex, position: ranPoint() };
    mk.options[ranIndex] = updateData;
  }, 2000);
});

```


## 动态地图点位基于Vue的实现
```js
class Markers {
  static getInstance(map) {
    return new Vue({
      data() {
        return {
          _map: map,
          markers: {},
          options: []
        };
      },
      mounted() {
        this._map = map
        this.$watch("options", this.diff, {deep: true, immediate: true});
      },
      render() {
        return null;
      },
      computed: {
        optionIds() {
          return this.options.map(option => {
            return option.id
          })
        }
      },
      methods: {
        diff(newVal, oldVal = []) {
          
          const newKeys = newVal.map(e => {
            return e.id
          })
          
          oldVal.forEach(e => {
            const {id} = e
            if (!newKeys.includes(id)) {
              this.removeMarker(this.markers[id])
              this.$delete(this.markers, id)
            }
          })
          
          newVal.forEach(e => {
             const {id, position} = e
             let marker = this.markers[id]
             if (marker) {
               this.updateMarker(marker, e)
             } else {
               marker = this.buildMarker(position[0], position[1])
             }
          })
        },
        updateMarker(marker, option) {
          marker.setPosition(
            new AMap.LngLat(option.position[0], option.position[1])
          );
        },
        buildMarker(lng, lat) {
          let mk = new AMap.Marker({ position: new AMap.LngLat(lng, lat) });
          this.addMarker(mk);
          return mk;
        },
        addMarker(markers) {
          this._map.add(_.castArray(markers));
        },
        removeMarker(markers) {
          this._map.remove(_.castArray(markers));
        },
        reset() {
          this.removeMarker(Object.values(this.markers));
          this.markers = {};
        }
      }
    }).$mount();
  }
}

const ranPoint = function() {
  return turf.randomPosition([116.358421, 39.937639, 116.443222, 39.872983]);
};

const map = new AMap.Map("container", {
  zoom: 13
});

let markers = [];

for (let i = 0; i < 100; i++) {
  markers.push({ id: "marker" + i, position: ranPoint() });
}

map.on("complete", e => {
  
  let mk = Markers.getInstance(map);

  mk.options = markers;

  setInterval(() => {
    let ranIndex = _.random(0, 100);
    let updateData = { id: "marker" + ranIndex, position: ranPoint() };
    Vue.set(mk.options, ranIndex, updateData);
  }, 2000);
  
});

```

## Echart builder
```js

function buildLineOptions(items) {
  return items.reduce(
    (obj, each) => {
      const { legend, name, value } = each;
      // legend
      if (!obj.legend.includes(legend)) {
        obj.legend.push(legend);
      }
      // xAxis
      if (!obj.xAxis.includes(each.name)) {
        obj.xAxis.push(each.name);
      }
      // eries
      let serie = obj.series.find(e => {
        return e.name == each.legend;
      });
      if (!serie) {
        obj.series.push({ name: each.legend, data: [each.value] });
      } else {
        serie.data.push(each.value);
      }

      return obj;
    },
    { legend: [], xAxis: [], series: [] }
  );
}

function buildPieOptions(items) {
  return items.reduce(
    (obj, each) => {
      const { legend, name, value } = each;
      // xAxis
      if (!obj.xAxis.includes(each.name)) {
        obj.xAxis.push(each.name);
      }
      // series
      let series = obj.series.find(e => {
        return e.name == each.name;
      });
      if (!series) {
        obj.series.push({ name: each.name, value: each.value });
      } else {
        series.value += each.value;
      }

      return obj;
    },
    { legend: null, xAxis: [], series: [] }
  );
}

let data = [
  { legend: "在线", name: "一组", value: 11 },
  { legend: "在线", name: "二组", value: 12 },
  { legend: "总数", name: "一组", value: 20 },
  { legend: "总数", name: "二组", value: 30 },
  { legend: "总数", name: "二组", value: 30 }

];
```