var BUSY_LOT_COLOR = 'black';
var FREE_LOT_COLOR = 'gainsboro';
var DATA_PATH = 'data-real';

function getCenterFromCorners(points) {
    var sumX = sumY = 0;
    var count = points.length;
    for (var i = 0; i < count; ++i) {
        sumX += points[i].x;
        sumY += points[i].y;
    }
    return {
        x: sumX / count,
        y: sumY / count
    }
}

var initParkingLots = function(parkingMap) {
    var parking = parkingMap.group();

    // Loading SVG content into the current document.
    // Do not load it as image because we cannot change color of images that are separate documents.
    var carDef = parking.defs().group();
    $.get("img/car.svg", function(data) {
        var imageSvg = $('svg', data);
        carDef.svg(imageSvg.html()).rotate(90);
    }, 'xml');

    $.get(DATA_PATH + "/parkinglot_1.txt", function(data) {
        var lines = data.split(/\r?\n/);
        var cars = [];
        var minX = minY = Number.MAX_SAFE_INTEGER;
        var maxX = maxY = 0;
        for (var i = 0, count = lines.length; i < count; ++i) {
            if (lines[i]) {
                var parts = lines[i].split(/ +/);
                var lotId = parts[0];
                var lotX = parts[9];
                var lotY = parts[10];
                var lotR = 360 - parts[11];
                if (lotX == 0 && lotY == 0 && lotR == 360) {
                    points = [];
                    for (var j = 1; j <= 8; j += 2) {
                        points.push({x: parseInt(parts[j], 10), y: parseInt(parts[j+1], 10)});
                    }
                    var center = getCenterFromCorners(points);
                    lotX = center.x;
                    lotY = center.y;
                    lotR = 0;
                }
                minX = Math.min(minX, lotX);
                minY = Math.min(minY, lotY);
                maxX = Math.max(maxX, lotX);
                maxY = Math.max(maxY, lotY);
                cars.push({id: lotId, x: lotX, y: lotY, r: lotR});
            }
        }
        maxX = maxX - minX + 100;
        maxY = maxY - minY + 100;
        minX = minX - 100;
        parkingMap.attr('viewBox', "0 0 "  + maxX  + " " + maxY);
        parkingMap.attr('preserveAspectRatio', 'xMidYMin meet');
        for (var i = 0, count = cars.length; i < count; ++i) {
            var car = cars[i];
            parking.use(carDef).id("lot" + car.id).move(car.x - minX, car.y - minY).rotate(car.r).fill(FREE_LOT_COLOR);
        }
    });
}

var updateBusyLots = function() {
    $.get(DATA_PATH + "/parking.txt", function(data) {
        var lines = data.split(/\r?\n/);
        for (var i = 0, count = lines.length; i < count; ++i) {
            if (lines[i]) {
                var parts = lines[i].split(/ +/);
                var lotId = parts[0];
                var lotIsFree = parts[1];
                var lot = SVG.get("lot" + lotId);
                if (lot) {
                    if (lotIsFree == 1) {
                        lot.fill(FREE_LOT_COLOR);
                    } else {
                        lot.fill(BUSY_LOT_COLOR);
                    }
                }
            }
        }
    });
}

var parkingMap = SVG('parking-map');
initParkingLots(parkingMap);
updateBusyLots();
setInterval(updateBusyLots, 500);

$(document).ready(function() {
    $('.mdl-layout__drawer .mdl-navigation__link').click(function() {
        var d = document.querySelector('.mdl-layout').MaterialLayout.toggleDrawer();
    });
});
