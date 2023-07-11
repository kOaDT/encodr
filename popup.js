document.getElementById("encodeButton").addEventListener("click", function () {
  let input = document.getElementById("input").value;
  let output = btoa(input);
  document.getElementById("output").value = output;
});

document.getElementById("decodeButton").addEventListener("click", function () {
  let input = document.getElementById("input").value;
  let output = atob(input);
  document.getElementById("output").value = output;
});
