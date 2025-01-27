

function showMenu(x) {
  x.classList.toggle("change");

  let dropdownMenus = document.getElementsByClassName("dropdownmenu");

  for (let i = 0; i < dropdownMenus.length; i++) {
    if (dropdownMenus[i].classList.contains("dropdownmenu-active")) {
      dropdownMenus[i].classList.remove("dropdownmenu-active"); 
    } else {
      dropdownMenus[i].classList.add("dropdownmenu-active"); 
    }
  }

  // ซ่อน dropdownproduct2 และลบคลาส productshow เมื่อปิด Hamburger
  const dropdownProduct = document.querySelector('.dropdownproduct2');
  const productMenu = document.querySelector('.pageproduct');

  if (dropdownProduct.classList.contains('active')) {
    dropdownProduct.classList.remove('active');
  }

  if (productMenu.classList.contains('productshow')) {
    productMenu.classList.remove('productshow');
  }
}

function showProduct(x) {
  x.classList.toggle("productshow");
  // Toggle visibility of dropdown
  const dropdown = document.querySelector('.dropdownproduct2');
  dropdown.classList.toggle('active');
}

function changeClass(link) {
  // Remove 'active' class from all <a> elements
  document.querySelectorAll('.dropdownproduct2 a').forEach(item => {
      item.classList.remove('active');
  });
  // Add 'active' class to the clicked <a> element
  link.classList.add('active');
}


    
