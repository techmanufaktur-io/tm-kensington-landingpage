
document.addEventListener("DOMContentLoaded", function() {

  let links = document.querySelectorAll('a');
  links.forEach(function(item){
    if (item.getAttribute('data-mailto-token') != null) {
      item.innerHTML = item.innerHTML.replace('@~@', '@');
    }
  });

});
