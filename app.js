Stream = require("node-rtsp-stream")

const onvif = require("node-onvif")

const express = require("express")
const app = express()
const path = require("path")

process.camera = []
ipCam = [
	"rtsp://admin:admin123@192.168.1.64:554/Streaming/Channels/101",
	"rtsp://admin:admin123@192.168.1.64:554/Streaming/Channels/201",
	"rtsp://admin:admin123@192.168.1.64:554/Streaming/Channels/301"
	// "rtsp://admin:admin123@192.168.1.64:554/Streaming/Channels/401",
	// "rtsp://admin:admin123@192.168.1.64:554/Streaming/Channels/501",
	// "rtsp://admin:admin123@192.168.1.64:554/Streaming/Channels/601",
	// "rtsp://admin:admin123@192.168.1.64:554/Streaming/Channels/701"
]
onvif.startProbe()
	.then((device_info_list) => {
		console.log(device_info_list.length + " devices were found.")
		// Show the device name and the URL of the end point.

		const arr = []
		device_info_list.forEach((info, x) => {
			if (x <= 5) {
				//console.log('- ' + info.urn);
				//console.log('  - ' + info.name);
				console.log("  - " + info.xaddrs[0], ">>>>>")
				//   arr.push(
				// 	"http://192.168.1.36:8080/onvif/device_service",
				// 	"http://192.168.1.6:8080/onvif/device_service",
				// 	"http://192.168.1.47:8080/onvif/device_service"
				// )
				arr.push(info.xaddrs[0])
			}
		})
		//console.log(arr)
		process.camera = arr
		arr.forEach((onCam, i) => {
			let device = new onvif.OnvifDevice({
				xaddr: onCam,
				user: "admin",
				pass: "admin123"
			})

			// Initialize the OnvifDevice object
			device
				.init()
				.then(() => {
					// Get the UDP stream URL
					let url = device.getUdpStreamUrl()

					ipCam.forEach((url, i) => {
						console.log(url)
						stream = new Stream({
							name: "name",
							streamUrl: url,
							// "rtsp:192.168.1.64:554/Streaming/Channels/404"
							wsPort: 9000 + i
						})
					})

					console.log("URL :" + url)
				})
				.catch((error) => {
					console.error(error)
				})
		})
	})
	.catch((error) => {
		console.error(error)
	})
app.use(express.static(path.join(__dirname, "public")))
app.get("/", (req, res) => {
	console.log(process.camera)
	res.write(`<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <style>
          canvas {
            display: block;
            float: left;
            transform: scale(1);
           transform-origin: 0% 0% 0px;
          }
          .camera{
            display: block;
            margin-left: 10px;
            margin-top: 10px;
            padding: 0px;
            width: 400px;
          }
        </style>
        <title>RTSP STREAMING NODE JS IP CAMERA </title>
       <h1>RTSP STREAMING NODE JS IP CAMERA </h1>

       ${ipCam
			.map((can, i) => {
				return ` <div><canvas class="camera" id="videoCanvas${i}" width="640" height="360"></canvas></div>`
			})
			.join("")}
       
    
        <script type="text/javascript" src="jsmpeg.js"></script>
        <script type="text/javascript">
    
        ${ipCam
			.map((can, i) => {
				return ` var canvas${i} = document.getElementById('videoCanvas${i}');
                     var ws${i} = new WebSocket("ws://localhost:900${i}")
                     var player${i} = new jsmpeg(ws${i}, {canvas:canvas${i}, autoplay:true,audio:false,loop: true });
            `
			})
			.join("")} 
        </script>
    
    <body>
          
    </body>
    </html>`)

	res.end()
})

app.listen(8000)
