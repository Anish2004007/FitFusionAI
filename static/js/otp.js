const inputs = document.querySelectorAll(".otp-box");
const hiddenInput = document.getElementById("otpValue");

inputs.forEach((input, index) => {

    input.addEventListener("input", (e) => {

        e.target.value = e.target.value.replace(/[^0-9]/g, "");

        if (e.target.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

        updateOTP();

    });

    input.addEventListener("keydown", (e) => {

        if (
            e.key === "Backspace" &&
            input.value === "" &&
            index > 0
        ) {
            inputs[index - 1].focus();
        }

    });

});

function updateOTP(){

    let otp = "";

    inputs.forEach(box => {
        otp += box.value;
    });

    hiddenInput.value = otp;

}

/* ===========================
   Countdown Timer
=========================== */

let seconds = 60;

const countdown = document.getElementById("countdown");
const timerText = document.getElementById("timerText");
const resendLink = document.getElementById("resendLink");

const timer = setInterval(() => {

    seconds--;

    countdown.textContent = seconds;

    if(seconds <= 0){

        clearInterval(timer);

        timerText.style.display = "none";

        resendLink.style.display = "inline";

    }

},1000);