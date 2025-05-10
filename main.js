

//---------------------------
//---------------------------
//-----PROGRESS BAR----------
//---------------------------
//---------------------------


// Progress bar functionality
window.addEventListener('scroll', function() {
  // Calculate how far down the page the user has scrolled
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  
  // Calculate the total scrollable height (total height minus viewport height)
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  
  // Calculate the scrolled percentage
  const scrolled = (winScroll / height) * 100;
  
  // Update the width of the progress bar
  document.getElementById("myProgressBar").style.width = scrolled + "%";
});

//---------------------------
//---------------------------
//-----HEADLINES----------
//---------------------------
//---------------------------

document.addEventListener('DOMContentLoaded', () => {
  const imgs = document.querySelectorAll('.images .img-container');
  imgs.forEach((div, idx) => {
    // assumes files are named headline1.png, headline2.png, …
    const fileName = `headlines/headline${idx+1}.png`;
    div.style.setProperty('--bg', `url('${fileName}')`);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const imgs = Array.from(document.querySelectorAll('.images .img-container'));

  // first: assign backgrounds as before
  imgs.forEach((div, idx) => {
    div.style.setProperty('--bg', `url('headlines/headline${idx+1}.png')`);
  });

  // now “spray” them
  imgs.forEach(div => {
    // pick random size between 20% and 60% of viewport width
    const size = 20 + Math.random() * 40;    // percent

    // pick random top between 0vh and 60vh
    const top  = Math.random() * 60;         // vh

    // pick random left between 0vw and 60vw
    const left = Math.random() * 60;         // vw

    // pick random rotation between –15° and +15°
    const rot  = (Math.random() * 30) - 15;  // deg

    // apply as inline style
    div.style.top            = `${top}vh`;
    div.style.left           = `${left}vw`;
    div.style.backgroundSize = `${size}%`;
    div.style.transform      = `rotate(${rot}deg)`;
  });
});