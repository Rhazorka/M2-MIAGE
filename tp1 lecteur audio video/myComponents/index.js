import './lib/webaudio-controls.js';

const getBaseURL = () => {
  const base = new URL('.', import.meta.url);
  console.log("Base = " + base);
	return `${base}`;
};

const template = document.createElement("template");
template.innerHTML = `
  <style>
  video {
    display: block;

  }
    H1 {
          color:red;
    }
    #gain{
      background-color=black;
    }
  </style>
  <table>
    <tr>
      <td rowspan=7 colspan=5>
        <video id="myPlayer" width="420" height="320">
          <source src="./SoundAndVideo/HEYYEYAAEYAAAEYAEYAA.mp4" type="audio/mp4"/>
        </video>
      </td>
      <td colspan=3> 
        <canvas id="myCanvas" width="420" height="100"></canvas>
      </td>
    </tr>
    <tr>
      <td>
        <label>60Hz</label>
      </td>
      <td>
        <webaudio-slider id="gainSlider0" width="200" height="30" value=1 min="-30" max="30" step=1 src="./assets/imgs/sliderbody.png"></webaudio-slider>
      </td>
      <td>
        <webaudio-param id="gain0" link="gainSlider0"></webaudio-param>
      </td>
    </tr>
    <tr>
      <td>
        <label>170Hz</label>
      </td>
      <td>
        <webaudio-slider id="gainSlider1" width="200" height="30" value=1 min="-30" max="30" step=1 src="./assets/imgs/sliderbody.png"></webaudio-slider>
      </td>
      <td>
        <webaudio-param id="gain1" link="gainSlider1"></webaudio-param>
      </td>
    </tr>
    <tr>
      <td>
        <label>350Hz</label>
      </td>
      <td>
        <webaudio-slider id="gainSlider2" width="200" height="30" value=1 min="-30" max="30" step=1 src="./assets/imgs/sliderbody.png"></webaudio-slider>
      </td>
      <td>
        <webaudio-param id="gain2" link="gainSlider2"></webaudio-param>
      </td>
    </tr>
    <tr>
      <td>
        <label>1000Hz</label>
      </td>
      <td>
        <webaudio-slider id="gainSlider3" width="200" height="30" value=1 min="-30" max="30" step=1 src="./assets/imgs/sliderbody.png"></webaudio-slider>
      </td>
      <td>
        <webaudio-param id="gain3" link="gainSlider3"></webaudio-param>
      </td>
    </tr>
    <tr>
      <td>
        <label>3500Hz</label>
      </td>
      <td>
        <webaudio-slider id="gainSlider4" width="200" height="30" value=1 min="-30" max="30" step=1 src="./assets/imgs/sliderbody.png"></webaudio-knob>
      </td>
      <td>
        <webaudio-param id="gain4" link="gainSlider4"></webaudio-param>
      </td>
    </tr>
    <tr>
      <td>
        <label>1000Hz</label>
      </td>
      <td>
        <webaudio-slider id="gainSlider5" width="200" height="30" value=1 min="-30" max="30" step=1 src="./assets/imgs/sliderbody.png"></webaudio-slider>
      </td>
      <td>
        <webaudio-param id="gain5" link="gainSlider5"></webaudio-param>
      </td>
    </tr>
    <tr>
      <td>
        <button id="backButton"><img src="./assets/imgs/backbutton.png"></button>
      </td>
      <td>
        <button id="refreshButton"><img src="./assets/imgs/refreshbutton.png"></button>
      </td>
      <td>
        <button id="pauseButton"><img src="./assets/imgs/pausebutton.png"></button>
      </td>
      <td>
        <button id="playButton"><img src="./assets/imgs/playbutton.png"></button>
      </td>
      <td>
        <button id="frontButton"><img src="./assets/imgs/frontbutton.png"></button>
      </td>
      <td>
        <webaudio-knob id="knobVolume"  src="./assets/imgs/volume.png" sprites="100" value=1 min="0" max="1" step=0.01>Volume</webaudio-knob>
        <br>
        <webaudio-param id="valVolume" link="knobVolume"></webaudio-param>
      </td>
      <td>
        <webaudio-knob id="knobBalance"  src="./assets/imgs/balance.png" sprites="127" value=0 min="-1" max="1" step=0.01></webaudio-knob>
      </td>
    </tr>
  </table>
`;

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.volume = 1;
    this.attachShadow({ mode: "open" });
    //this.shadowRoot.innerHTML = template;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.basePath = getBaseURL(); // url absolu du composant
    // Fix relative path in WebAudio Controls elements
    this.fixRelativeImagePaths();    
  }

  connectedCallback() {
    this.valueVolumeNode = this.shadowRoot.querySelector("#valVolume");
    this.valueVolumeNode.value =this.shadowRoot.querySelector("#knobVolume").value*100;  
    this.player = this.shadowRoot.querySelector("#myPlayer");
    this.player.loop = true;
    this.audioContext = new AudioContext();
    this.canvas=this.shadowRoot.querySelector("#myCanvas");
    this.width=this.canvas.width;
    this.height=this.canvas.height;
    this.canvasContext = this.canvas.getContext("2d");
    this.playerNode= this.audioContext.createMediaElementSource(this.player);
    this.pannerNode = new StereoPannerNode(this.audioContext,{pan: 0});
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize=1024;
    this.bufferLength=this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

   /* this.filter=[];
    let freq=[60,170,650,1000,3500,10000];
    for(var i=1;freq.length-1;i++){
      let eq = this.audioContext.createBiquadFilter();
      eq.frequency.value=freq[i];
      eq.type="peaking";
      eq.gain.value=0;
      this.filters.pus;
    }
    [60,170,650,1000,3500,10000].forEach(function(freq,i){
      let eq = audioContext.createBiquadFilter();
      eq.frequency.value=freq;
      eq.type="peaking";
      eq.gain.value=0;
      this.filters.push(eq);
    });
    this.playerNode.connect(this.filters[0]);
    for(var i=0;i<this.filters.length-1;i++){
      this.filters[i].connect[i+1];
    }
    this.filters[this.filters.length-1].connect(this.analyserNode)
*/
    this.playerNode
      .connect(this.pannerNode)
      .connect(this.analyserNode)
      .connect(this.audioContext.destination);
    this.visualize();
    this.declareListeners();
  }
  
  visualize(){
    this.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.canvasContext.fillRect(0, 0, this.width, this.height);
    this.analyserNode.getByteTimeDomainData(this.dataArray);
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = 'lightBlue';
    this.canvasContext.beginPath();
    var sliceWidth = this.width / this.bufferLength;
    var x = 0;
    for(var i = 0; i < this.bufferLength; i++) {
      var v = this.dataArray[i] / 255;
      var y = v * this.height;
      if(i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }
      x += sliceWidth;
    }
    this.canvasContext.lineTo(this.width, this.height/2);
    this.canvasContext.stroke();  
    requestAnimationFrame(() =>{this.visualize();});
  }
  fixRelativeImagePaths() {
		// change webaudiocontrols relative paths for spritesheets to absolute
		let webaudioControls = this.shadowRoot.querySelectorAll(
			'webaudio-knob, webaudio-slider, webaudio-switch, img'
		);
		webaudioControls.forEach((e) => {
			let currentImagePath = e.getAttribute('src');
			if (currentImagePath !== undefined) {
				//console.log("Got wc src as " + e.getAttribute("src"));
				let imagePath = e.getAttribute('src');
        //e.setAttribute('src', this.basePath  + "/" + imagePath);
        e.src = this.basePath  + "/" + imagePath;
        //console.log("After fix : wc src as " + e.getAttribute("src"));
			}
		});
  }
  
  declareListeners() {
    this.shadowRoot.querySelector("#playButton").addEventListener("click", (event) => {
      this.play();
    });
    this.shadowRoot.querySelector("#pauseButton").addEventListener("click", (event) => {
      this.pause();
    });
    this.shadowRoot.querySelector("#refreshButton").addEventListener("click", (event) => {
      this.refresh();
    });
    this.shadowRoot.querySelector("#backButton").addEventListener("click", (event) => {
      this.back();
    });
    this.shadowRoot.querySelector("#frontButton").addEventListener("click", (event) => {
      this.front();
    });
    this.shadowRoot.querySelector("#knobVolume").addEventListener("input", (event) => {
      this.setVolume(event.target.value);
    });
    this.shadowRoot.querySelector("#gainSlider0").addEventListener("input", (event) => {
      this.setGain(event.target.value,0);
    });
    this.shadowRoot.querySelector("#gainSlider1").addEventListener("input", (event) => {
      this.setGain(event.target.value,1);
    });
    this.shadowRoot.querySelector("#gainSlider2").addEventListener("input", (event) => {
      this.setGain(event.target.value,2);
    });
    this.shadowRoot.querySelector("#gainSlider3").addEventListener("input", (event) => {
      this.setGain(event.target.value,3);
    });
    this.shadowRoot.querySelector("#gainSlider4").addEventListener("input", (event) => {
      this.setGain(event.target.value,4);
    });
    this.shadowRoot.querySelector("#gainSlider5").addEventListener("input", (event) => {
      this.setGain(event.target.value,5);
    });
    this.shadowRoot.querySelector("#knobBalance").addEventListener("input", (event) => {
      this.setBalance(event.target.value);
    });
  }
  setBalance(val){
    this.pannerNode.pan.value=val;
  }
  // API
  setVolume(val) {
    this.player.volume = val;
    this.valueVolumeNode.value=(val*100);
  }

  play() {
    this.player.play();
  }
  pause(){
    this.player.pause();
  }
  refresh(){
    this.player.currentTime=0;
  }
  back(){
    this.player.currentTime-=10;
  }
  front(){
    this.player.currentTime+=10;
  }
}

customElements.define("my-audioplayer", MyAudioPlayer);
