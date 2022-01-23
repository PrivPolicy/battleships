var util = {
    logEnabled: true,

    replaceArrayChunk: function (arrRef, x1, y1, x2, y2, value, callback = null) {
        for (var y = y1; y <= y2; y++) {
            for (var x = x1; x <= x2; x++) {
                if (callback == null) {
                    //console.log("[UTIL] Filling", x, y);
                    arrRef[y][x] = value;
                } else {
                    callback(arrRef[y][x]);
                }
            }
        }
    },

    incrementValueInArrayChunk: function (arrRef, x1, y1, x2, y2, value, callback = null) {
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                if (callback == null) {
                    //console.log("[UTIL] Increment: ", x, y);
                    arrRef[y][x] = arrRef[y][x] + value;
                } else {
                    callback(arrRef, x, y, value);
                }
            }
        }
    },

    replaceArrayChunkClamped: function (arrRef, x1, y1, x2, y2, value, clampMin, clampMax, callback = null) {
        x1 = this.clamp(clampMin, clampMax, x1);
        y1 = this.clamp(clampMin, clampMax, y1);
        x2 = this.clamp(clampMin, clampMax, x2);
        y2 = this.clamp(clampMin, clampMax, y2);

        for (var y = y1; y <= y2; y++) {
            for (var x = x1; x <= x2; x++) {
                if (callback == null) {
                    //console.log("[UTIL] Filling", x, y);
                    arrRef[y][x] = value;
                } else {
                    callback(arrRef[y][x]);
                }
            }
        }
    },

    checkForValueInChunk: function (arrRef, x1, y1, x2, y2, value = [], mode = "EQ") {
        //console.log("[UTIL] Bound by", x1, y1, x2, y2);
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                //console.log("[UTIL] Checking", x, y, `Is ${arrRef[y][x]} ${mode} to ${value}?`);
                if (mode == "EQ") {
                    for (let i = 0; i < value.length; i++) {
                        //console.log(`Is ${arrRef[y][x]} ${mode} to ${value[i]}?`, arrRef[y][x] == value[i]);
                        if (arrRef[y][x] == value[i]) {
                            return true;
                        }
                    }
                } else if (mode == "NEQ") {
                    for (let i = 0; i < value.length; i++) {
                        if (arrRef[y][x] != value[i]) {
                            return true;
                        }
                    }
                } else {
                    return undefined;
                }
            }
        }

        return false;
    },

    replaceBoardChunk: function (arrRef, x1, y1, x2, y2, value, callback = null) {
        for (var y = y1; y <= y2; y++) {
            for (var x = x1; x <= x2; x++) {
                if (callback == null) {
                    arrRef[this.twoToOneD(x, y)] = value;
                } else {
                    callback(arrRef[this.twoToOneD(x, y, 10)], x, y, x1, y1, x2, y2);
                }
            }
        }
    },

    replaceBoardChunkClamped: function (arrRef, x1, y1, x2, y2, value, clampMin, clampMax, callback = null) {
        x1 = this.clamp(clampMin, clampMax, x1);
        y1 = this.clamp(clampMin, clampMax, y1);
        x2 = this.clamp(clampMin, clampMax, x2);
        y2 = this.clamp(clampMin, clampMax, y2);

        for (var y = y1; y <= y2; y++) {
            for (var x = x1; x <= x2; x++) {
                if (callback == null) {
                    arrRef[this.twoToOneD(x, y)] = value;
                } else {
                    callback(arrRef[this.twoToOneD(x, y, 10)], x, y, x1, y1, x2, y2);
                }
            }
        }
    },

    timeIt: function (title, callback) {
        var startTime = new Date().getTime();

        callback();

        var endTime = new Date().getTime();
        console.log(`Task '${title}' took ${endTime - startTime}ms to execute.`);
    },

    loadJSON: function (path) {
        var fr = new FileReader();
        return JSON.parse(fr.readAsText(path));
    },

    oneToTwoD: function (element, array = [], sideLength) {
        var output = { x: 0, y: 0 };

        var index = array.indexOf(element);

        output.x = index % sideLength;
        output.y = (index - output.x) / sideLength;

        return output;
    },

    twoToOneD: function (x, y, sideLength) {
        return y * sideLength + x;
    },

    clamp: function (min, max, value) {
        return Math.min(Math.max(value, min), max);
    }
}