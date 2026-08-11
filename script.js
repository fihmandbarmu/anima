// Wait for DOM content to load before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.btn');

  if (button) {
    button.addEventListener('click', () => {
      console.log('App button clicked!');
      // Add your core app logic here
    });
  }
});
