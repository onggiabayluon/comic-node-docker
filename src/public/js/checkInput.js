Array.from(document.querySelectorAll('.form-group input')).forEach(i => {
    i.addEventListener('invalid', () => {
      i.dataset.touched = true
    })
    i.addEventListener('blur', () => {
      console.log(i.value)
      if (i.value !== '') { i.dataset.touched = true }
    })
  });