//2312*1080
//在横屏模式下，左上角为原点，水平方向为x轴,竖直方向为y轴建系
var your_x = 2312;//填写手机像素比较大的那个值
var your_y = 1080;//填写手机像素比较小的那个值
var x_ratio = your_x / 2312;
var y_ratio = your_y / 1080;
var REBACK = [2000*x_ratio, 700*y_ratio]; // 无效点，地图上一个没有建筑的点，用于返回操作
var SLEEP = 500; // 休眠（ms），一般不用动
var MINS = 3; // 循环用时（min）
var WARN = 3; // 提醒时间（s）
var TASKS = [
    [1080*x_ratio, 100*y_ratio],
    [900*x_ratio, 200*y_ratio], [1300*x_ratio, 200*y_ratio],
    [680*x_ratio, 300*y_ratio], [1090*x_ratio, 300*y_ratio], [1490*x_ratio, 300*y_ratio],
    [500*x_ratio, 400*y_ratio], [1300*x_ratio, 400*y_ratio], [1700*x_ratio, 400*y_ratio],
    [290*x_ratio, 500*y_ratio], [690*x_ratio, 500*y_ratio], [1910*x_ratio, 500*y_ratio],
    [500*x_ratio, 600*y_ratio], [1300*x_ratio, 600*y_ratio], [1700*x_ratio, 600*y_ratio],
    [680*x_ratio, 700*y_ratio], [1090*x_ratio, 700*y_ratio], [1490*x_ratio, 700*y_ratio],
    [897*x_ratio, 800*y_ratio],
    [1110*x_ratio, 900*y_ratio],
];
var jigsaw_x = [880*x_ratio,1010*x_ratio,1140*x_ratio,1270*x_ratio,1400*x_ratio,1530*x_ratio];//拼图的x轴坐标
var jigsaw_y =[520*y_ratio,640*y_ratio];//拼图的y坐标
var mywell = images.read("./resource/well.jpg");
var myjigsaw = images.read("./resource/jigsaw.jpg");

//确保进入了选择水井类型界面
function click_well(x, y) {
    click(x, y);
    sleep(SLEEP);
    check_jigsaw();
    var cnt = 0;
    while (true) {
        if (check_well()) {
            break;
        } else {
            click(REBACK[0], REBACK[1]);//返回
            sleep(SLEEP);
            click(x, y);//再点一次
            sleep(SLEEP);
            check_jigsaw();
            cnt++;
            console.assert(cnt < 10, "多次发生点击异常，已退出")
        }
    }
}

//判断是否处于水井页
function check_well() {
    var stage = images.captureScreen();
    var p = findImage(stage, mywell, {
        threshold: 0.8,
    });
    if (p) {
        //发现水井详情页，一切正常
        log("第一阶段成功")
        return true;
    } else {
        //或许点到普通居民，或许点到特殊居民
        log("第一阶段有问题")
        return false;
    }

}

//判断是否处于拼图页面
function check_jigsaw() {
    var stage = images.captureScreen();
    var pp = findImage(stage, myjigsaw, {
        threshold: 0.7,
    });
    if (pp) {
        //发现解拼图页面，需要解拼图
        log("发现拼图");
        jigsaw(pp.x + 80, pp.y + 240);
        sleep(SLEEP * 2)
        return true;//解拼图成功，并且发现拼图
    }
    return false;//未发现拼图
}
// 解拼图
function jigsaw(x, y) {
    //枚举所有拖动情况，每拖动一次，判断拼图是否已经完成
    for (var i = 0; i < 12; i++) {
        for (var j = i + 1; j < 12; j++) {
            swipe(jigsaw_x[i%6]*x_ratio,jigsaw_y[i>5?1:0]*y_ratio , jigsaw_x[j%6]*x_ratio,jigsaw_y[j>5?1:0]*y_ratio , SLEEP*2);
            log("%d %d => %d %d",jigsaw_x[i%6]*x_ratio,jigsaw_y[i>5?1:0]*y_ratio , jigsaw_x[j%6]*x_ratio,jigsaw_y[j>5?1:0]*y_ratio );
            sleep(SLEEP * 2);
            var ok_picture = images.captureScreen();
            var p = findImage(ok_picture, myjigsaw, {
                threshold: 0.7,
            });
            if (!p) {
                log("拼图已完成");
                click(REBACK[0], REBACK[1]);//返回
                sleep(SLEEP);
                return 0;//拼图已完成，跳出解拼图方法
            }
        }
    }
    //所有操作完成，依然在拼图页面，说明解拼图失败
    console.assert(false, "解拼图失败，已退出");
}

// 遍历任务序列
function main(task) {
    toast("将于" + WARN + "秒后开始");
    sleep(WARN * 1000);
    for (var i in task) {

        click_well(TASKS[i][0], TASKS[i][1]);//点击水井，进入水井模式选择页面
        log("已选择" + i + "水井");
        sleep(SLEEP);

        click(1000*x_ratio, 260*y_ratio);//选择最低级水井，进入人员选择
        sleep(SLEEP);
        check_jigsaw();
        sleep(SLEEP);
        log("选择最低级水井")

        click(1000*x_ratio, 260*y_ratio);//选择普通居民
        sleep(SLEEP);
        check_jigsaw();
        sleep(SLEEP);
        log("选择普通居民")
    }
}


images.requestScreenCapture();
launchApp("江南百景图");
sleep(2000);
main(TASKS);

//循环运行
setInterval(function () {
    main(TASKS);
}, MINS)