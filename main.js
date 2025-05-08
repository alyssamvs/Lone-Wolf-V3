

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
//-----PROGRESS BAR----------
//---------------------------
//---------------------------