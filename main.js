const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const title = document.getElementById("title");
const gif = document.getElementById("cuteGif");
const music = document.getElementById("bgMusic");
const heartsContainer = document.getElementById("hearts");

let noClickCount = 0;
let yesSize = 10;

// messages (ILABAS MO SA LABAS)
const noMessages = [
  "Are you sure? 🙁",
  "Sure ka talaga? 🥺",
  "Grabe ka naman 💔🙁",
  "Last chance na 😭",
];

// NO BUTTON
noBtn.addEventListener("click", () => {

  let message = noMessages[noClickCount] || "Ayaw mo talaga? 😭";

  let confirmNo = confirm(message);
  if (!confirmNo) return;

  noClickCount++;

  // paliit
  let scale = 1 - (noClickCount * 0.2);
  noBtn.style.transform = `scale(${scale})`;

  // palaki YES
  if (yesSize < 10) {
    yesBtn.style.fontSize = yesSize + "px";
  }

  // mawala after 4
  if (noClickCount === 4) {
    noBtn.style.display = "none";
  }
});

yesBtn.addEventListener("click", () => {

  // alisin NO kung nandyan pa
  noBtn.style.display = "none";

  // gawing malaki YES (force same result)
  yesBtn.style.fontSize = "10px";

  // center YES
  yesBtn.style.display = "block";
  yesBtn.style.margin = "0 auto";

  // delay konti para smooth (optional)
  setTimeout(() => {
    yesBtn.style.display = "none";

    title.textContent = "Yeheyyyyy sabi na may gusto ka rin sakin 🥰❤️";
    gif.style.display = "block";
    music.play();
    setInterval(createHeart, 200);
  }, 300);
});
// HEARTS
function createHeart() {
  const heart = document.createElement("div");
  heart.classList.add("heart");
  heart.innerHTML = "❤️ 😝 🥰";

  heart.style.left = Math.random() * 100 + "vw";
  heart.style.fontSize = Math.random() * 20 + 20 + "px";

  heartsContainer.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 3000);
}