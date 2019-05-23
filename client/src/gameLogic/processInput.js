import { shipPosition } from ".";

export const setupInput = (models) => {
  document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented) {
        return;
    }

    const key = event.key || event.keyCode;

    processInput(models, key)
  });
}

const processInput = (models, key) => {

}

export default processInput;