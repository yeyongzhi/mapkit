# 开发手册

## 1.定义轨迹回放实例：defineTrackPlayback(map. options) 

- map：地图实例
- options：轨迹定义参数

## 2.初始化轨迹回放实例：initTrackPlayback(track, options)

将轨迹添加到地图上，并提供自定义配置参数（样式等...）

同时也支持**轨迹点**的样式配置（图标）

## 3.隐藏轨迹：hideTrack(track)

隐藏当前轨迹

## 4.显示轨迹：showTrack(track)

显示当前轨迹

## 5.闪烁轨迹：flickerTrack(track)

适合在查询之后，向用户展示目标轨迹具体是哪条

## 6.轨迹时间控制器：initTrackTimeController(track)

提供媒体控制的一些操作，比如播放、暂停、重播

以及快进、快退、进度条监控等操作

## 7.多轨迹对比：multiTrackContrast(track, options)

可以添加多条轨迹进行对比展示，也支持对 源轨迹 进行参数化筛选并展示