


function normalize(value, original_low = 0, original_high = 10, target_low = 0, target_high = 1) {
    return Math.abs(((value - original_low) / (original_high - original_low)) * (target_low + (target_high - target_low)))
}


let flag = false; //идет ли запись значений
let giant_input_layer = [] //массив с массивами с покадровым распознавание жестов
const videoElement = document.getElementsByClassName('input_video')[0]; //входное видео
const logger = document.getElementsByClassName('logger')[0]; //кнопка для начала записи
let input_layer = [];
let pr_result = "";
//начать запись, ежели кнопку нажали
logger.addEventListener('click', () => {
    flag = true;
    logger.style.background = "red";
    console.log("start");
})

//покадровая обработка
function onResults(results) {
    //результаты одной обработки


    input_layer = [];
    if (flag == true) {
        if (giant_input_layer.length >= 15) {
            flag = false;
            pr_result = []
            for (const i of giant_input_layer) {
                for (const j of i) {
                    pr_result.push(j);
                }
            }
            console.log(pr_result)
            console.log(1)
            fetch("/index", {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    "massive": [pr_result]
                })
            })
                .then(function (response) {
                    if (response.ok) {
                        //pass
                    }
                    else {
                        throw Error('Something went wrong');
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });

 
            console.log("ok");
            giant_input_layer = [];
            logger.style.background = "green";
        }



        if (results.poseLandmarks) {
            if (results.poseLandmarks.length == 33) {
                if (results.leftHandLandmarks || results.rightHandLandmarks) {
                    for (const i of results.poseLandmarks) {
                        input_layer.push(normalize(i["x"]))
                        input_layer.push(normalize(i["y"]))
                        input_layer.push(normalize(i["z"], -10, 10))
                    }
                    if (results.leftHandLandmarks) {
                        for (const i of results.leftHandLandmarks) {
                            input_layer.push(normalize(i["x"]))
                            input_layer.push(normalize(i["y"]))
                            input_layer.push(normalize(i["z"], -10, 10))
                        }
                    }
                    else {
                        for (const i of results.rightHandLandmarks) {
                            input_layer.push(normalize(i["x"]))
                            input_layer.push(normalize(i["y"]))
                            input_layer.push(normalize(i["z"], -10, 10))
                        }
                    }
                    if (results.rightHandLandmarks) {
                        for (const i of results.rightHandLandmarks) {
                            input_layer.push(normalize(i["x"]))
                            input_layer.push(normalize(i["y"]))
                            input_layer.push(normalize(i["z"], -10, 10))
                        }
                    }
                    else {
                        for (const i of results.leftHandLandmarks) {
                            input_layer.push(normalize(i["x"]))
                            input_layer.push(normalize(i["y"]))
                            input_layer.push(normalize(i["z"], -10, 10))
                        }
                    }
                    if (flag) {
                        giant_input_layer.push(input_layer)
                        console.log("ok", input_layer.length)

                    }
                }
            }
        }
    }
}


const everything = new Holistic({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }
});

//настройки
everything.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.4,
    minTrackingConfidence: 0.4
});


everything.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await everything.send({ image: videoElement });
    },
});
camera.start();
