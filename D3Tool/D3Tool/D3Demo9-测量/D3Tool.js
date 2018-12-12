/// <reference path="d3.min.js" />
(function () {
    var d3svgTool = d3svgTool || {};

    function d3svgTool(id, svgurl) {
        this.Id = id;
        this.svgurl;
    }
    d3svgTool.prototype.Id = "";
    d3svgTool.prototype.svgurl = "";
    //加载
    d3svgTool.prototype.load = function () {
        var tar = document.getElementById(this.Id);
        tar.innerHTML = "";
        //添加样式
        var cssstyle = "html, body,svg {height: 100%;}"
        cssstyle += "html, body, div, svg {margin: 0;padding: 0;}"
        cssstyle += ".svghover {fill: red;stroke: #FF0000;stroke-opacity: 0.8;}";
        cssstyle += "#" + this.Id + "{ overflow:hidden;width:100%; height:100%;margin:auto 0 }"
        d3.select(tar).append("style").html(cssstyle);
        //屏蔽右键
        tar.oncontextmenu = function () {
            event.returnValue = false;
        }
        try {
            d3.svg(this.svgurl).then(function (data) {
                var test = data.getElementsByTagName("svg")//取出画布中的内容
                var svg = d3.select("#" + tar.id).append("svg").attr("id", "basesvg" + tar.id);//创建最基础画布
                var base_group = svg.append("g").attr("id", "g" + tar.id);//创建一个g元素用来包裹svg文件去掉画布标签的其他标签内容
                var svg2 = base_group.append("svg")//svg2是展示svg
                                   .attr("style", "display: inline; width: inherit; min-width: inherit; max-width: inherit; height: inherit; min-height: inherit; max-height: inherit;")
                                   .attr("id", "svgView" + tar.id)
                                   .html(test["0"].innerHTML);
                //由转码器转码生成的svg文件中必能取到这里的宽高值
                var svgheight = circles_group.select("rect").attr("height");
                var svgwidth = circles_group.select("rect").attr("width");
                svg2.attr("viewBox", "0 0 " + svgwidth + " " + svgheight + "");//这里是容器的宽高
                var padding = 0;//边距
                var clientHeight = tar.offsetHeight - padding;//  window.innerHeight - padding;
                var clientWidth = tar.offsetWidth - padding; //document.body.offsetWidth - padding; //window.innerWidth;
                svg.attr("preserveAspectRatio", "xMinYMin meet")
                      .attr("width", clientWidth)
                      .attr("hieght", clientHeight)
                      .attr("viewBox", "0 0 " + svgwidth + " " + svgheight + "");//这里是容器的宽高
                var zoom = d3.zoom()//定义缩放方法 
                    .duration(750)
                                  .on("zoom", function () { // zoom事件
                                      circles_group.attr("transform", d3.zoomTransform(svg.node()));//缩放平移都是在操作g元素
                                  })
                svg.call(zoom);//给基础svg绑定缩放事件
                //初始化展示位置   让其居中
                var baseweight = svgwidth * tar.clientHeight / svgheight;
                var InitialbaseX = (tar.clientWidth - baseweight) / 2;
                //表示SVG坐标系中的2D或3D点。
                var pnt = document.getElementById("svgView" + tar.id).createSVGPoint();
                pnt.x = InitialbaseX;
                pnt.y = 0;
                var svgCTM = document.getElementById("svgView" + tar.id).getScreenCTM();
                var iPNT = pnt.matrixTransform(svgCTM.inverse());
                //这里起居中作用 （最外层基础svg）
                svg.call(zoom.transform, d3.zoomIdentity
                                     .translate(iPNT.x, 0)
                                     .scale(1));
                var viewheight = svgwidth * tar.clientHeight / tar.clientWidth;
                var viewweight = svgwidth * heightx1 / svgheight;
                var InitialviewX = (svgwidth - viewweight) / 2;
                var ScalingRatiox = viewheight / svgheight;
                svg2.call(zoom.transform, d3.zoomIdentity.translate(InitialviewX, 0).scale(ScalingRatiox));
                //onresize 事件 

            });
        } catch (e) {
            console.log(e);
        }
    }
    //事件
    d3svgTool.prototype.ev = function (id, evt, fn) {
        var tar = document.getElementById(this.Id);
        tar.addEventListener(evt, function (ev) {
            //返回屏幕鼠标所在点坐标对应的svg世界坐标
            var svgcoordinate = this.d3svgTool.prototype.svgCursor(ev);
            var ev = ev || window.event;
            var srcname = ev.target.nodeName.toLocaleLowerCase();
            if (d3svgTool.prototype.LastElementId != "") {//如果上一次有选中颜色
                d3.select(document.getElementById(d3svgTool.prototype.LastElementId)).attr("class", "");
            }
            var srcElementId = ev.srcElement.id;//返回Id
            var result = { "svgcoordinate": svgcoordinate, srcElementId: srcElementId };
            fn.call(result);
        });
    }
    //获取屏幕鼠标点所在位置在svg上对应的世界坐标
    d3svgTool.prototype.svgCursor = function (evt) {
        var pnt = document.getElementById("svgView" + this.Id).createSVGPoint();
        pnt.x = evt.clientX;
        pnt.y = evt.clientY;
        var svgCTM = document.getElementById("svgView" + this.Id).getScreenCTM();
        var iPNT = pnt.matrixTransform(svgCTM.inverse());
        return [(iPNT.x), (iPNT.y)];
    }
    d3svgTool.prototype.SelectElementByClick() = function (fn) {
        this.d3svgTool.prototype.ev(d3svgTool.prototype.Id, "click", fn);
    }
    //给选中的id元素上色 
    d3svgTool.prototype.SelectElementColor = function (id) {
        if (this.LastElementId != "") {
            d3.select("#" + this.LastElementId).attr("class", "");
        }
        if (document.getElementById(id) != null) {//存在这个id 
            this.LastElementId = id;
            d3.select("#" + id).attr("class", "svghover");
        }
    }
    //初始化
    d3svgTool.prototype.Initialization = function () {
        //初始化代码

    }
    //获取图层的集合
    d3svgTool.prototype.layers = function () {
        var arrIds = [];
        d3.select("#svgView" + this.Id).select("g").nodes().forEach(function (d) {
            arrIds.push(d.id);
        })
        return arrIds;
    }
    d3svgTool.prototype.LastElementId = "";

    window.d3svgTool = d3svgTool;
})(window)