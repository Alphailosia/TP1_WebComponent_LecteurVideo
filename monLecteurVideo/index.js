import './lib/webaudio-controls.js'

const template = document.createElement("template")
const ctx = window.AudioContext || window.webkitAudioContext
const context = new ctx()
console.log(context)
const getBaseURL = () => {
    return new URL('.', import.meta.url)
}

template.innerHTML = /*html*/ `
<div  id="global">
    <div id="video">
        <video id="player" crossorigin="anonymous"></video>
        <div id="videoControl">
            <div>
                <button id="precedent">prec</button>
                <img src="./assets/backward.png" id="backward">
                <webaudio-switch id="startstop" src="./assets/pause.png"></webaudio-switch>
                <img src="./assets/forward.png" id="forward">
                <button id="suivant">suiv</button>
            </div>
            <div>
                <label id="vit">Vitesse x4 : off</label>
                <webaudio-switch src="./assets/switch_toggle.png" id="vitesse"></webaudio-switch>
                <label id="vol">Volume : 50%</label>
                <webaudio-knob diameter="60" id="volume" in="0" max="1" value="0.5" step="0.01" tooltip="%s" src="./assets/Aqua.png" sprites="100"></webaudio-knob>
            </div>
            <div>
            </div>
        </div>
        <div id="soundControl">
            <h2>Balance</h2>
            <input id="balance" type="range" value="0" step="0.1" min="-1" max="1"></input>
            <h2>Fréquence</h2>
            <div class="gain">
                <label>60Hz</label>
                <input id="gain0" type="range" value="0" step="1" min="-30" max="30"></input>
                <output id="outputGain0">0 dB</output>
            </div>
            <div class="gain">
                <label>170Hz</label>
                <input id="gain1" type="range" value="0" step="1" min="-30" max="30"></input>
                <output id="outputGain1">0 dB</output>
            </div>
            <div class="gain">
                <label>350Hz</label>
                <input id="gain2" type="range" value="0" step="1" min="-30" max="30"></input>
                <output id="outputGain2">0 dB</output>
            </div>
            <div class="gain">
                <label>1000Hz</label>
                <input id="gain3" type="range" value="0" step="1" min="-30" max="30"></input>
                <output id="outputGain3">0 dB</output>
            </div>
            <div class="gain">
                <label>3500Hz</label>
                <input id="gain4" type="range" value="0" step="1" min="-30" max="30"></input>
                <output id="outputGain4">0 dB</output>
            </div>
            <div class="gain">
                <label>10000Hz</label>
                <input id="gain5" type="range" value="0" step="1" min="-30" max="30"></input>
                <output id="outputGain5">0 dB</output>
            </div>
            <h2>Visualiseur de fréquence</h2>
            <canvas id="myCanvas" width=300 height=100></canvas>
        </div>
    </div>
    <div id="playlist">
        <h2>Playlist</h2>
        <img height="70" width="100" src="./assets/lien1.png" id="lien1"></img>
        <br>
        <img height="70" width="100" src="./assets/lien2.png" id="lien2"></img>
        <br>
        <img height="70" width="100" src="./assets/lien3.png" id="lien3"></img>
    </div>
</div>
<style>
    img{
        border: 1px solid black;
        border-radius: 5px;
    }

    img:active{
        border: 1px solid red;
        border-radius: 5px;
        transform: scale(1.1)
    }

    #startstop {
        border: 1px solid black;
        border-radius: 5px;
    }

    #startstop:active{
        border: 1px solid red;
        border-radius: 5px;
        transform: scale(1.1)
    }

    #global { 
        display: flex;
        flex-direction: row;
        justify-content: space-between; 
    }

    #videoControl {
        width: 100%;
        border: 1px solid black;
        border-radius: 10px;
        align-items: center;
        margin-top: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    #soundControl {
        width: 100%;
        border: 1px solid black;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 10px;
    }

    .gain:hover{
        color: red;
        font-weight:bold;
    }

    #player{
        border-radius: 20px;
    }

    #lien1{
        border: 1px solid black;
        border-radius: 10px;
    }

    #lien2{
        border: 1px solid black;
        border-radius: 10px;
    }

    #lien3{
        border: 1px solid black;
        border-radius: 10px;
    }

    #playlist{
        border: 1px solid black;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #video{
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 20px;
    }
</style>
`

class MyVideoPlayer extends HTMLElement {

    constructor() {
        super()
        this.srcVideo = [
            "https://media.istockphoto.com/videos/apple-tree-branch-with-green-foliage-and-heavy-rain-in-the-sunlight-video-id1225085759",
            "https://ak.picdn.net/shutterstock/videos/1075976711/preview/stock-footage-waterfall-and-river-at-wild-nature-waterfall-natural-sound-included-sport-rafting-on-mountain.mp4",
            "https://ak.picdn.net/shutterstock/videos/1070138818/preview/stock-footage-video-footage-of-the-cicadas-buzzing-hard-it-is-a-variety-called-kuma-zemi-singing-loudly-to.mp4"
        ]
        this.nbVideo=0
        this.src = this.getAttribute("src")
        this.attachShadow({
            mode: "open"
        })
    }

    fixRelativeUrl() {
        // pour les knob
        let knobs = this.shadowRoot.querySelectorAll('webaudio-knob');
        knobs.forEach((e) => {
            let path = e.getAttribute('src')
            e.src = getBaseURL() + '/' + path
        });
        let switchs = this.shadowRoot.querySelectorAll('webaudio-switch');
        switchs.forEach((e) => {
            let path = e.getAttribute('src')
            e.src = getBaseURL() + '/' + path
        });

        let imgs = this.shadowRoot.querySelectorAll('img');
        imgs.forEach((e) => {
            let path = e.getAttribute('src')
            e.src = getBaseURL() + '/' + path
        });
    }
    connectedCallback() {
        // appeler avant affichage du component
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.player = this.shadowRoot.querySelector("#player")
        this.player.src = this.src
        this.shadowRoot.querySelector("#startstop").onclick = (event) => this.startStop(event)
        this.shadowRoot.querySelector("#backward").onclick = () => this.recDixSec()
        this.shadowRoot.querySelector("#forward").onclick = () => this.avDixSec()
        this.shadowRoot.querySelector("#vitesse").onclick = (event) => this.v4x(event)
        this.shadowRoot.querySelector("#volume").oninput = (event) => this.changeVolume(event)
        this.shadowRoot.querySelector("#lien1").onclick = () => this.setLien(1)
        this.shadowRoot.querySelector("#lien2").onclick = () => this.setLien(2)
        this.shadowRoot.querySelector("#lien3").onclick = () => this.setLien(3)
        this.shadowRoot.querySelector("#lien1").style.border= "1px solid red"
        this.shadowRoot.querySelector("#suivant").onclick = () => this.suivant()
        this.shadowRoot.querySelector("#precedent").onclick = () => this.precedent()


        // fix relative url
        this.fixRelativeUrl()
        this.sourceNode = context.createMediaElementSource(this.player);
        this.player.onplay = () => context.resume()

        // balance
        this.pannerNode = context.createStereoPanner()

        this.sourceNode.connect(this.pannerNode)
        this.pannerNode.connect(context.destination)

        this.shadowRoot.querySelector("#balance").oninput = (event) => this.setBalance(event.target.value)

        // egaliseur de fréquence
        this.filters = []
        let tab = [60, 70, 350, 1000, 3500, 10000]
        for (let element of tab) {
            this.initFilters(element)
        }

        this.sourceNode.connect(this.filters[0]);
        for (var i = 0; i < this.filters.length - 1; i++) {
            this.filters[i].connect(this.filters[i + 1])
        }

        this.filters[this.filters.length - 1].connect(context.destination)

        this.shadowRoot.querySelector("#gain0").oninput = (event) => this.setFilter(event.target.value, 0)
        this.shadowRoot.querySelector("#gain1").oninput = (event) => this.setFilter(event.target.value, 1)
        this.shadowRoot.querySelector("#gain2").oninput = (event) => this.setFilter(event.target.value, 2)
        this.shadowRoot.querySelector("#gain3").oninput = (event) => this.setFilter(event.target.value, 3)
        this.shadowRoot.querySelector("#gain4").oninput = (event) => this.setFilter(event.target.value, 4)
        this.shadowRoot.querySelector("#gain5").oninput = (event) => this.setFilter(event.target.value, 5)

        // visualiseur de fréquence
        this.canvas = this.shadowRoot.querySelector("#myCanvas")
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.canvasContext = this.canvas.getContext("2d")

        this.buildAudioGraph()

        requestAnimationFrame(()=>{
            this.visualize2()
        })
    }

    // api de mon component

    buildAudioGraph() {
        this.analyser = context.createAnalyser()

        this.analyser.fftSize = 1024;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.filters[this.filters.length - 1].connect(this.analyser)

        this.analyser.connect(context.destination)
    }

    visualize2() {
        this.canvasContext.save();
        this.canvasContext.fillStyle = "rgba(80, 80, 80, 0.05)";
        this.canvasContext.fillRect (0, 0, this.width, this.height);

        this.analyser.getByteFrequencyData(this.dataArray);
        var nbFreq = this.dataArray.length;
    
        var SPACER_WIDTH = 5;
        var BAR_WIDTH = 2;
        var OFFSET = 100;
        var CUTOFF = 23;
        var HALF_HEIGHT = this.height/2;
        var numBars = 1.7*Math.round(this.width / SPACER_WIDTH);
        var magnitude;
  
        this.canvasContext.lineCap = 'round';

        for (var i = 0; i < numBars; ++i) {
            magnitude = 0.3*this.dataArray[Math.round((i * nbFreq) / numBars)];
        
            this.canvasContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            this.canvasContext.fillRect(i * SPACER_WIDTH, HALF_HEIGHT, BAR_WIDTH, -magnitude);
            this.canvasContext.fillRect(i * SPACER_WIDTH, HALF_HEIGHT, BAR_WIDTH, magnitude);
        }
    
        // Draw animated white lines top
        this.canvasContext.strokeStyle = "white";
        this.canvasContext.beginPath();

        for (i = 0; i < numBars; ++i) {
            magnitude = 0.3*this.dataArray[Math.round((i * nbFreq) / numBars)];
            if(i > 0) {
                //console.log("line lineTo "  + i*SPACER_WIDTH + ", " + -magnitude);
                this.canvasContext.lineTo(i*SPACER_WIDTH, HALF_HEIGHT-magnitude);
            } else {
                //console.log("line moveto "  + i*SPACER_WIDTH + ", " + -magnitude);
                this.canvasContext.moveTo(i*SPACER_WIDTH, HALF_HEIGHT-magnitude);
            }
        }
        for (i = 0; i < numBars; ++i) {
            magnitude = 0.3*this.dataArray[Math.round((i * nbFreq) / numBars)];
            if(i > 0) {
                //console.log("line lineTo "  + i*SPACER_WIDTH + ", " + -magnitude);
                this.canvasContext.lineTo(i*SPACER_WIDTH, HALF_HEIGHT+magnitude);
            } else {
                //console.log("line moveto "  + i*SPACER_WIDTH + ", " + -magnitude);
                this.canvasContext.moveTo(i*SPACER_WIDTH, HALF_HEIGHT+magnitude);
            }
        }    
        this.canvasContext.stroke();
    
        this.canvasContext.restore();
        
        // call again the visualize function at 60 frames/s
        requestAnimationFrame(()=>{
            this.visualize2()
        });
        
    }

    suivant(){
        this.resetPlaylist()
        if(this.nbVideo==2){
            this.nbVideo=0
        }
        else{
            this.nbVideo++
        }
        this.player.src = this.srcVideo[this.nbVideo]
        this.updatePlaylist(this.nbVideo+1)
    }

    precedent(){
        this.resetPlaylist()
        if(this.nbVideo==0){
            this.nbVideo=2
        }
        else{
            this.nbVideo--
        }
        this.player.src = this.srcVideo[this.nbVideo]
        this.updatePlaylist(this.nbVideo+1)
    }

    startStop(event) {
        if (event.target.value) {
            this.player.play()
        } else {
            this.player.pause()
        }
    }

    setFilter(sliderVal, nbFilter) {
        let value = parseFloat(sliderVal);
        this.filters[nbFilter].gain.value = value;

        // update output labels
        let output = this.shadowRoot.querySelector("#outputGain" + nbFilter);
        output.innerHTML = value + " dB";
    }
    initFilters(freq) {
        let eq = context.createBiquadFilter()
        eq.frequency.value = freq
        eq.type = "peaking"
        eq.gain.value = 0
        this.filters.push(eq)
    }

    setLien(id) {
        switch (id) {
            case 1: {
                this.player.src = "https://media.istockphoto.com/videos/apple-tree-branch-with-green-foliage-and-heavy-rain-in-the-sunlight-video-id1225085759"
                this.resetPlaylist()
                this.nbVideo=0
                this.updatePlaylist(1)
                break
            }
            case 2: {
                this.player.src = "https://ak.picdn.net/shutterstock/videos/1075976711/preview/stock-footage-waterfall-and-river-at-wild-nature-waterfall-natural-sound-included-sport-rafting-on-mountain.mp4"
                this.resetPlaylist()
                this.nbVideo=1                
                this.updatePlaylist(2)
                break
            }
            case 3: {
                this.player.src = "https://ak.picdn.net/shutterstock/videos/1070138818/preview/stock-footage-video-footage-of-the-cicadas-buzzing-hard-it-is-a-variety-called-kuma-zemi-singing-loudly-to.mp4"
                this.resetPlaylist()
                this.nbVideo=2
                this.updatePlaylist(3)
                break
            }
            default:
        }
        this.shadowRoot.querySelector("#startstop").value = 0
    }

    updatePlaylist(val){
        this.shadowRoot.querySelector(`#lien`+val).style.border= "1px solid red"
    }

    resetPlaylist(){
        this.shadowRoot.querySelector(`#lien`+(this.nbVideo+1)).style.border= "1px solid black"
    }

    setBalance(sliderVal) {
        this.pannerNode.pan.value = sliderVal
    }

    recDixSec() {
        this.player.currentTime -= 10
    }

    avDixSec() {
        this.player.currentTime += 10
    }

    v4x(event) {
        if (event.target.value) {
            this.player.playbackRate = 4
            this.shadowRoot.querySelector("#vit").innerHTML = "Vitesse x4 : on"
        } else {
            this.player.playbackRate = 1
            this.shadowRoot.querySelector("#vit").innerHTML = "Vitesse x4 : off"
        }
    }

    changeVolume(event) {
        console.log(event.target.value)
        let vol = parseFloat(event.target.value)
        this.player.volume = vol
        vol = Math.round(vol * 100)
        this.shadowRoot.querySelector("#vol").innerHTML = "Volume : " + vol + "%"
    }
}

customElements.define("my-player", MyVideoPlayer)