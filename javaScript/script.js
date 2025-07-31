console.log("lets write js");
let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`songs/${folder}/`);

  let response = await a.text();

  let div = document.createElement("div");

  div.innerHTML = response;

  let as = div.getElementsByTagName("a");

  let songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];

    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}/`)[1]);
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  //let audio = new Audio("/songs/" + track);
  currentSong.src = `songs/${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "./svg/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = track.replaceAll("%20", " ");
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
  document.querySelector(".seekbar").style.width = "100%";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    // Skip hidden system files
    if (
      !e.href.includes("/songs") ||
      e.href.includes(".htaccess") ||
      e.href.includes(".mp3")
    ) {
      continue;
    }

    let parts = e.href.split("/songs/");
    if (parts.length > 1 && parts[1]) {
      let folder = parts[1].replace("/", "");

      try {
        // Get the metadata of the folder
        let a = await fetch(`/songs/${folder}/info.json`);
        let response = await a.json();

        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <img src="./svg/spotifyPlay.svg" alt="Play Icon" />
            </div>
            <img src="./songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
      } catch (error) {
        console.error(`Error loading metadata for folder: ${folder}`, error);
      }
    }
  }

  // Load the playlist whenever a card is clicked

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      const folder = item.currentTarget.dataset.folder;

      // Load songs from the folder
      songs = await getSongs(folder);

      // Update the sidebar playlist
      let songListElem = document.querySelector(".songList ul");
      songListElem.innerHTML = "";

      songs.forEach((song, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
        <img class="invert" src="./svg/music.svg" alt="music icon" />
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Arsh</div>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <img class="invert" src="./svg/play.svg" />
        </div>
      `;

        li.addEventListener("click", () => {
          playMusic(song);
        });

        songListElem.appendChild(li);
      });

      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });
}

async function main() {
  // Get the songs from the server
  songs = await getSongs("ncs"); // remove `let`

  playMusic(songs[0], true); // Play the first song by default

  //display the albums on the page
  displayAlbums();

  // Display the songs in the song list

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    songUl.innerHTML += `<li> <img class = "invert" src="./svg/music.svg" alt="music svg">
                  <div class="info">
                   <div> ${song.replaceAll("%20", " ")} </div>
                   <div>Arsh </div>
                  </div>
                  <div class="playNow">
                    <span>Play Now</span>
                    <img class = "invert" src="./svg/play.svg" alt="play icon" />
                  </div>
    
    </li>`;
  }

  // Add event listeners to the play buttons

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  // Add event listeners to the play , next , previous buttons in the playbar

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "./svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "./svg/play.svg";
    }
  });

  //listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    let currentTime = currentSong.currentTime;
    let duration = currentSong.duration;

    // Update the song time display
    let currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60);
    let durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);

    document.querySelector(".songTime").innerHTML =
      `${currentMinutes.toString().padStart(2, "0")}:${currentSeconds
        .toString()
        .padStart(2, "0")} / ` +
      `${durationMinutes.toString().padStart(2, "0")}:${durationSeconds
        .toString()
        .padStart(2, "0")}`;

    // Update the seekbar width
    let progress = (currentTime / duration) * 100;

    document.querySelector(".circle").style.left = `${progress}%`;

    document.querySelector(".seekbar").style.background = `
  linear-gradient(to right, #E246AB ${progress.toFixed(
    2
  )}%, #535353 ${progress.toFixed(2)}%)
`;
  });

  //add event listener to seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let seekBarWidth = document.querySelector(".seekbar").offsetWidth;
    let clickX = e.offsetX; // Get the x-coordinate of the click
    let duration = currentSong.duration; // Get the total duration of the song

    // Calculate the new time based on the click position
    let newTime = (clickX / seekBarWidth) * duration;

    // Set the current time of the audio to the new time
    currentSong.currentTime = newTime;

    // Update the seekbar and song time display
    document.querySelector(".circle").style.left = `${
      (clickX / seekBarWidth) * 100
    }%`;
    let currentMinutes = Math.floor(newTime / 60);
    let currentSeconds = Math.floor(newTime % 60);
    document.querySelector(".songTime").innerHTML =
      `${currentMinutes.toString().padStart(2, "0")}:${currentSeconds
        .toString()
        .padStart(2, "0")} / ` +
      `${Math.floor(duration / 60)
        .toString()
        .padStart(2, "0")}:${Math.floor(duration % 60)
        .toString()
        .padStart(2, "0")}`;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
