/// <reference path="d3.min.js" />

(function ()
{
    var d3svgTool = d3svgTool || {};

    function d3svgTool(id, svgurl)
    {
        this.Id = id;
        this.svgurl = svgurl;
    }
    d3svgTool.prototype.Id = "";
    d3svgTool.prototype.svgurl = "";
    //加载
    d3svgTool.prototype.load = function ()
    {
        var tar = document.getElementById(this.Id);
        tar.innerHTML = "";
        //添加样式
        var cssstyle = "html, body,svg {height: 100%;}"
        cssstyle += "html, body, div, svg {margin: 0;padding: 0;}"
        cssstyle += ".svghover {fill: red;stroke: #FF0000;stroke-opacity: 0.8;}";
        cssstyle += "#" + this.Id + "{ overflow:hidden;width:100%; height:100%;margin:auto 0 }"
        d3.select(tar).append("style").html(cssstyle);
        //屏蔽右键
        tar.oncontextmenu = function ()
        {
            event.returnValue = false;
        }
        try
        {
            d3.svg(this.svgurl).then(function (data)
            {

                var test = data.getElementsByTagName("svg")//取出画布中的内容
                var svg = d3.select("#" + tar.id).append("svg").attr("id", "basesvg" + tar.id);//创建最基础画布
                var base_group = svg.append("g").attr("id", "g" + tar.id);//创建一个g元素用来包裹svg文件去掉画布标签的其他标签内容
                console.log(test);
                var svg2 = base_group.append("svg")//svg2是展示svg
                                   .attr("style", "display: inline; width: inherit; min-width: inherit; max-width: inherit; height: inherit; min-height: inherit; max-height: inherit;")
                                   .attr("id", "svgView" + tar.id)
                                   .html(test["0"].innerHTML);
                //由转码器转码生成的svg文件中必能取到这里的宽高值
                var svgheight = base_group.select("rect").attr("height");
                var svgwidth = base_group.select("rect").attr("width");
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
                                  .on("zoom", function ()
                                  { // zoom事件
                                      base_group.attr("transform", d3.zoomTransform(svg.node()));//缩放平移都是在操作g元素
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
                var viewweight = svgwidth * viewheight / svgheight;
                var InitialviewX = (svgwidth - viewweight) / 2;
                var ScalingRatiox = viewheight / svgheight;
                svg2.call(zoom.transform, d3.zoomIdentity.translate(InitialviewX, 0).scale(ScalingRatiox));
                //onresize 事件 

            });
        } catch (e)
        {
            console.log(e);
        }
    }
    //事件
    d3svgTool.prototype.ev = function (evt, fn)
    {
        var tar = document.getElementById(this.Id);
        tar.addEventListener(evt, function (ev)
        {
            //返回屏幕鼠标所在点坐标对应的svg世界坐标
            var svgcoordinate = d3svgTool.prototype.svgCursor(tar.id, ev);
            var ev = ev || window.event;
            var srcname = ev.target.nodeName.toLocaleLowerCase();
            if (d3svgTool.prototype.LastElementId != "")
            {//如果上一次有选中颜色
                d3.select(document.getElementById(d3svgTool.prototype.LastElementId)).attr("class", "");
            }
            var srcElementId = ev.srcElement.id;
            //svgcoordinate返回屏幕鼠标所在点坐标对应的svg世界坐标
            //srcElementId选中元素的Id没有则返回空
            var result = { "svgcoordinate": svgcoordinate, srcElementId: srcElementId };
            fn.call(result);
        });
    }
    //添加一个矩形 x,y插入矩形的位置 width,height矩形宽高
    d3svgTool.prototype.AddRect = function (x, y, width, height)
    {
        console.log(this.PatternType)
        if (this.PatternType == 2)
        {
            //清楚测量痕迹start
            d3svgTool.prototype.measureclear();
            //清楚测量痕迹end
            if (document.getElementById("gtempLabel") == null)
            {
                d3.select("g").select("svg").append("g").attr("id", "gtempLabel");
            }
            d3.select("#gtempLabel").append("rect")
              .attr("width", width)
              .attr("height", height)
              .attr("stroke", "black")
              .attr("x", x)
              .attr("y", y)
              .attr("type", "rect")
              .attr("isdrag", true)
              .attr("id", "Labelrect" + d3svgTool.prototype.Counter);

            d3svgTool.prototype.Counter = d3svgTool.prototype.Counter + 1;
            return "Labelrect" + Counter;

        } else
        {
            console.log("请切换至打标签模式")
        }
    }
    //添加一个圆 x,y插入圆的位置 r半径
    d3svgTool.prototype.AddCircle = function (x, y, r)
    {
        if (this.PatternType == 2)
        {
            //清楚测量痕迹start
            d3svgTool.prototype.measureclear();
            //清楚测量痕迹end
            if (document.getElementById("gtempLabel") == null)
            {
                d3.select("g").select("svg").append("g").attr("id", "gtempLabel");
            }
            d3.select("#gtempLabel").append("circle")
               .attr("r", r)
              .attr("stroke", "black")
              .attr("x", x)
              .attr("y", y)
              .attr("type", "circle")
              .attr("isdrag", true)
              .attr("id", "Labelrcircle" + d3svgTool.prototype.Counter);
            d3svgTool.prototype.Counter += 1;
        }
        else
        {
            console.log("请切换至打标签模式")
        }
    }
    //添加一个图片 x,y插入矩形的位置 width, height图片宽高 imageurl图片路径
    d3svgTool.prototype.AddImage = function (x, y, width, height, imageurl)
    {
        if (this.PatternType == 2)
        {
            //清楚测量痕迹start
            d3svgTool.prototype.measureclear();
            //清楚测量痕迹end

            if (document.getElementById("gtempLabel") == null)
            {
                d3.select("g").select("svg").append("g").attr("id", "gtempLabel");
            }
            d3.select("#gtempLabel").append("image")
              .attr("width", width)
              .attr("height", height)
              .attr("stroke", "black")
              .attr("x", x)
              .attr("y", y)
              .attr("xlink:href", imageurl)
              .attr("type", "image")
              .attr("isdrag", true)
              .attr("id", "Labelimage" + d3svgTool.prototype.Counter);
            d3svgTool.prototype.Counter += 1;
        }
        else
        {
            console.log("请切换至打标签模式")
        }
    }
    //插入文字
    d3svgTool.prototype.AddText = function (text, font_size, x, y)
    {
        if (this.PatternType == 2)
        {
            //清楚测量痕迹start
            d3svgTool.prototype.measureclear();
            //清楚测量痕迹end
            if (document.getElementById("gtempLabel") == null)
            {
                d3.select("g").select("svg").append("g").attr("id", "gtempLabel");
            }
            d3.select("#gtempLabel").append("text").text(text)
               .attr("x", x)
               .attr("y", y)
                .attr("style", "font-style:" + font_size)
               .attr("isdrag", true)
               .attr("type", "text")
               .attr("id", "Labeltext" + d3svgTool.prototype.Counter);
        } else
        {
            console.log("请切换至打标签模式")
        }
    }
    //获取屏幕鼠标点所在位置在svg上对应的世界坐标
    d3svgTool.prototype.svgCursor = function (id, evt)
    {

        var svgviewId = "svgView" + id;
        var pnt = document.getElementById(svgviewId).createSVGPoint();
        pnt.x = evt.clientX;
        pnt.y = evt.clientY;
        var svgCTM = document.getElementById(svgviewId).getScreenCTM();
        var iPNT = pnt.matrixTransform(svgCTM.inverse());
        return [this.rnd2(iPNT.x), this.rnd2(iPNT.y)];
    }
    //四舍五入取偶
    d3svgTool.prototype.rnd2 = function (num)
    {
        return Math.round(num * 100) / 100
    }
    //给选中的id元素上色 返回选中的Id值
    d3svgTool.prototype.SelectElementColor = function (fn)
    {
        if (this.PatternType == 1)
        {
            //清楚测量痕迹start
            this.measureclear();
            //清楚测量痕迹end
            var tar = document.getElementById(this.Id);
            tar.addEventListener("click", function (ev)
            {
                var ev = ev || window.event;
                var srcname = ev.target.nodeName.toLocaleLowerCase();
                var srcElementId = ev.srcElement.id;
                if (this.LastElementId != "")
                {
                    d3.select("#" + this.LastElementId).attr("class", "");
                }
                if (document.getElementById(srcElementId) != null)
                {//存在这个id 
                    this.LastElementId = srcElementId;
                    d3.select("#" + srcElementId).attr("class", "svghover");
                    //d3.select("#" + srcElementId).on(".drag", null) 
                    if (d3.select("#" + srcElementId).attr("isdrag"))
                    {
                        d3svgTool.prototype.drag(srcElementId);
                    }


                }
                var result = { "srcElementId": srcElementId };
                fn.call(result);
            });
        }
    }

    //id 选中的id值 , fn 回调函数
    d3svgTool.prototype.SelectElement = function (id, fn)
    {
        if (this.PatternType == 2)
        {
            d3.select("#" + id).on("click", fn);
        }
    }
    d3svgTool.prototype.SetElementByRect = function (id, x, y, width, height, stroke, fill)
    {
        d3.select("#" + id).attr("x", x);
        d3.select("#" + id).attr("y", y);
        d3.select("#" + id).attr("weight", width);
        d3.select("#" + id).attr("height", height);
        d3.select("#" + id).attr("height", height);
        d3.select("#" + id).attr("stroke", stroke);
        d3.select("#" + id).attr("fill", stroke);
    }
    d3svgTool.prototype.drag = function (id)
    {
        console.log("id：" + id)
        d3.select("#" + id).call(d3.drag()
            .on("start", function (d)
            {
                d3.select("#dragId").remove();
            })
            .on("drag", function (d)
            {
                console.log("拖动")
                if (d3.select(this).attr("type") == "circle")
                {
                    d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);
                    d3.select("#txtsetX").attr("value", d3.event.x);
                    d3.select("#txtsetY").attr("value", d3.event.y);
                }
                else
                {
                    d3.select(this).attr("x", d3.event.x).attr("y", d3.event.y);
                    d3.select("#txtsetX").attr("value", d3.event.x);
                    d3.select("#txtsetY").attr("value", d3.event.y);
                }
                var widthx = 0;
                var heighty = 0;
                if (d3.select(this).attr("type") == "circle")
                {//如果选中的矩形
                    widthx = parseInt(d3.select(this).attr("cx"), 0) + parseInt(d3.select(this).attr("r"), 0);
                    heighty = parseInt(d3.select(this).attr("cy"), 0) + parseInt(d3.select(this).attr("r"), 0);
                } else if (d3.select(this).attr("type") == "rect" || d3.select(this).attr("type") == "image")
                {
                    widthx = parseInt(d3.select(this).attr("x"), 0) + parseInt(d3.select(this).attr("width"), 0);
                    heighty = parseInt(d3.select(this).attr("y"), 0) + parseInt(d3.select(this).attr("height"), 0);
                }
                d3.select("#dragId").attr("x", widthx).attr("y", heighty);

                //拖动是 图片加边框
                if (d3.select(this).attr("type") == "image")
                {
                    d3.select(this).attr("stroke-width", "1")
                }

            })
            .on("end", function (d)
            {
                d3.select(this).attr("x", d3.event.x).attr("y", d3.event.y);
            })
            )
    }
    //测量模式 只有在PatternType为3的情况下开启
    d3svgTool.prototype.measureclick = function ()
    {
        if (this.PatternType == 3)
        {

            var tar = document.getElementById(this.Id);
            //如addEventListenerBymeasure 需要获取一个值 containerId，而removeEventListener注销事件时如果是方法体的话时没办法成功注销的，则创建一个标签 将值赋予标签  然后再在addEventListenerBymeasure取刚刚赋予标签的那个值
            if (document.getElementById("removeEventListenermeasure") == null)
            {
                deleteTaskk = document.createElement("a");
                deleteTaskk.setAttribute("containerId", this.Id);
                deleteTaskk.setAttribute("id", "removeEventListenermeasure");
                tar.appendChild(deleteTaskk);
            }

            tar.removeEventListener("click", d3svgTool.prototype.addEventListenerBymeasure, false);
            tar.addEventListener("click", d3svgTool.prototype.addEventListenerBymeasure, false);
        }
    }
    d3svgTool.prototype.addEventListenerBymeasure = function (ev)
    {
        var containerId = document.getElementById("removeEventListenermeasure").getAttribute("containerId");
        //返回屏幕鼠标所在点坐标对应的svg世界坐标
        var svgcoordinate = d3svgTool.prototype.svgCursor(containerId, ev);
        var ev = ev || window.event;
        var srcname = ev.target.nodeName.toLocaleLowerCase();
        if (d3svgTool.prototype.LastElementId != "")
        {//如果上一次有选中颜色
            d3.select(document.getElementById(d3svgTool.prototype.LastElementId)).attr("class", "");
        }
        var srcElementId = ev.srcElement.id;
        //测量第一点不存在 
        d3svgTool.prototype.measurefisrtposition(svgcoordinate);
    }
    //是否是第一次测量点
    d3svgTool.prototype.isfirstmeasure = true;//测量第一点
    //删除关于测量创建的元素
    d3svgTool.prototype.measureclear = function ()
    {
        d3.select("#cmeasureX1").remove();//删除点A
        d3.select("#cmeasureX2").remove();//删除点B
        d3.select("#linemeasure").remove();//两点之间的线BC
        d3.select("#linemeasureAC").remove();//AC辅助线
        d3.select("#linemeasureBC").remove();//BC辅助线
    }
    //两个测量点之间测量长度
    d3svgTool.prototype.measurelength = 0;
    //测量 两点之间测量长度
    d3svgTool.prototype.measurefisrtposition = function (fisrtposition)
    {
        if (this.PatternType == 3)
        {
            var _stroke_width = d3.select("g").select("svg").select("g").attr("stroke-width");
            if (d3svgTool.prototype.isfirstmeasure)
            {
                this.measureclear();
                //线条宽度
                d3svgTool.prototype.measurelength = 0;
                //创建测量组元素gmeasure
                if (document.getElementById("gmeasure") == null)
                {
                    d3.select("g").select("svg").append("g").attr("id", "gmeasure");
                }
                //在这里创建第一个点
                d3.select("g").select("svg").select("#gmeasure").append("circle")
                                                .attr("id", "cmeasureX1")
                                                .attr("fill", "blue").attr("r", parseFloat(_stroke_width, 0) * 2)
                                                .attr("cx", fisrtposition[0])
                                                .attr("cy", fisrtposition[1]);
                d3svgTool.prototype.isfirstmeasure = false;
            }
            else
            {
                d3.select("g").select("svg").select("#gmeasure").append("circle").attr("id", "cmeasureX2")
                .attr("fill", "blue").attr("r", parseFloat(_stroke_width, 0) * 2)
                .attr("cx", fisrtposition[0])
                .attr("cy", fisrtposition[1]);
                //两点之间的距离 那条线(AB)
                d3.select("#gmeasure").append("line").attr("id", "linemeasure")
               .attr("style", "stroke:rgb(0,0,0);stroke-width:" + _stroke_width)
               .attr("x1", d3.select("#cmeasureX1").attr("cx"))
               .attr("y1", d3.select("#cmeasureX1").attr("cy"))
               .attr("x2", d3.select("#cmeasureX2").attr("cx"))
               .attr("y2", d3.select("#cmeasureX2").attr("cy"));

                //算距离  这里设置一个c点
                //c点坐标【cmeasureX1 .x和cmeasureX2.y】
                var ac = Math.abs(parseFloat(d3.select("#cmeasureX2").attr("cx"), 0) - parseFloat(d3.select("#cmeasureX1").attr("cx"), 0));
                var bc = Math.abs(parseFloat(d3.select("#cmeasureX1").attr("cy"), 0) - parseFloat(d3.select("#cmeasureX2").attr("cy"), 0));
                var ab = Math.sqrt(Math.pow(ac, 2) + Math.pow(bc, 2))
                this.measurelength = ab;
                ///这里写辅助线
                d3.select("#gmeasure").append("line").attr("id", "linemeasureAC")
                   .attr("style", "stroke:rgb(255, 0, 0);stroke-width:" + _stroke_width)
                   .attr("stroke-dasharray", _stroke_width + "," + _stroke_width)
                   .attr("x1", d3.select("#cmeasureX1").attr("cx"))
                   .attr("y1", d3.select("#cmeasureX1").attr("cy"))
                   .attr("x2", d3.select("#cmeasureX2").attr("cx"))
                   .attr("y2", d3.select("#cmeasureX1").attr("cy"));
                d3.select("#gmeasure").append("line").attr("id", "linemeasureBC")
                   .attr("style", "stroke:rgb(50, 205, 50);stroke-width:" + _stroke_width)
                   .attr("stroke-dasharray", _stroke_width + "," + _stroke_width)
                   .attr("x1", d3.select("#cmeasureX2").attr("cx"))
                   .attr("y1", d3.select("#cmeasureX2").attr("cy"))
                   .attr("x2", d3.select("#cmeasureX2").attr("cx"))
                   .attr("y2", d3.select("#cmeasureX1").attr("cy"));
                d3svgTool.prototype.isfirstmeasure = true;
            }
        }
        else
        {
            console.log("请选择测量模式进行测量");
        }



    }
    //设置背景颜色Color HEX
    d3svgTool.prototype.SetBackgroundColor = function (backgroundcolor)
    {
        //如果背景是黑色则前景是白色
        if (backgroundcolor.trim() == "#000000" || backgroundcolor.trim() == "#000")
        {
            console.log("当设置背景色为黑色时会导致为了展示效果会导致前景色为白色");
            d3.select("#svgViewtest").selectAll("path").nodes().forEach(function (d)
            {
                d3.select("#" + d.id).attr("stroke", "#fff");
                if (d3.select("#" + d.id).attr("entitytype") == "MTEXT")
                {//如果是文字
                    d3.select("#" + d.id).attr("fill", "#fff");
                }
            })
        }
            //如果背景是白黑色则前景是黑色
        else if (backgroundcolor.trim() == "#ffffff" || backgroundcolor.trim() == "#fff")
        {
            d3.select("#svgViewtest").selectAll("path").nodes().forEach(function (d)
            {
                d3.select("#" + d.id).attr("stroke", "#000");
                if (d3.select("#" + d.id).attr("entitytype") == "MTEXT")
                {//如果是文字
                    d3.select("#" + d.id).attr("fill", "#000");
                }
            })
        }
            //如果是其他颜色 则前景线条是黑色
        else
        {
            d3.select("#svgViewtest").selectAll("path").nodes().forEach(function (d)
            {
                d3.select("#" + d.id).attr("stroke", "#000");
                if (d3.select("#" + d.id).attr("entitytype") == "MTEXT")
                {//如果是文字
                    d3.select("#" + d.id).attr("fill", "#000");
                }
            })
        }
        //correctColorForBackgroundColor反转前景色
        d3.select("svg").select("rect").attr("fill", backgroundcolor);


    }
    ///反转颜色
    d3svgTool.prototype.reverseColor = function (rgbColor)
    {//205,15,20
        // console.log(rgbColor);
        rgbColor = rgbColor.replace(/\s/g, "");
        var arrRGB = new Array(3);
        if (rgbColor.indexOf("rgb") > -1)
        {
            var colorReg = /\s*\d+,\s*\d+,\s*\d+/i;
            var t = colorReg.exec(rgbColor)[0].split(",");
            console.log(t);
            for (var i = 0; i < arrRGB.length; i++)
            {
                arrRGB[i] = 255 - t[i];
            }
        }
        else if (rgbColor.indexOf("#") > -1)
        {
            if (rgbColor.length > 4)//"#fc0,#ffcc00"
            {
                var j = 1;
                for (var i = 0; i < arrRGB.length; i++)
                {
                    arrRGB[i] = 255 - parseInt(rgbColor.substr((i + j), 2), 16);
                    j += 1;
                }
            } else
            {
                for (var i = 0; i < arrRGB.length; i++)
                {
                    var t = rgbColor.substr((i + 1), 1);
                    t = t + t;
                    arrRGB[i] = 255 - parseInt(t, 16);
                }
            }
        }
        return "rgb(" + arrRGB.join(",") + ")";
    }
    //初始化
    d3svgTool.prototype.Initialization = function ()
    {
        this.load();
        //var tar = document.getElementById(this.Id);
        //var svgheight = d3.select(tar).select("g").select("rect").attr("height");
        //var svgwidth = d3.select(tar).select("g").select("rect").attr("width");
        //var padding = 0;//边距
        //var zoom = d3.zoom()
        //                  .on("zoom", function ()
        //                  { // zoom事件
        //                      d3.select(tar).select("g").attr("transform", d3.zoomTransform(d3.select(tar).select("svg").node()));//缩放平移都是在操作g元素
        //                  })
        //var clientHeight = tar.offsetHeight - padding;//  window.innerHeight - padding;
        //var clientWidth = tar.offsetWidth - padding;
    }
    //获取图层的集合
    d3svgTool.prototype.layers = function ()
    {
        var arrIds = [];
        d3.select("#svgView" + this.Id).selectAll("g").nodes().forEach(function (d)
        {
            arrIds.push(d.id);
        })
        return arrIds;
    }
    d3svgTool.prototype.LastElementId = "";
    //1是点击选中上色2是在此点准备打标签3是进行测量
    d3svgTool.prototype.PatternType = 1;
    d3svgTool.prototype.setPatternType = function (PatternType)
    {

        d3svgTool.prototype.PatternType = PatternType;
    }
    d3svgTool.prototype.Counter = 0;
    window.d3svgTool = d3svgTool;
})(window)