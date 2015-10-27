(function(win, doc) {
  'use strict';

  var info = [];
  var categories = [];

  function initInfo() {
    // do navbar scoll stuff
    window.addEventListener("optimizedScroll", function() {
      var nav = doc.querySelector('nav');
      if (scrollY > 70) {
        nav.classList.add('floating');
      } else {
        nav.classList.remove('floating');
      }
      if (scrollX > 0)
        scroll(0, scrollY);
    });

    doc.querySelector('.tab-info').addEventListener('click', function() {
      changeTab(0);
    });
    doc.querySelector('.tab-cat').addEventListener('click', function() {
      changeTab(1);
    });

    getCategories();
  }

  function changeTab(number) {
    var pageContainer = doc.querySelector('.page-container');

    if (number === 0) {
      pageContainer.classList.remove('cat');
      pageContainer.classList.remove('search');
      history.replaceState(null, '', '?');
    } else if (number === 1) {
      pageContainer.classList.add('cat');
      pageContainer.classList.remove('search');
      history.replaceState(null, '', '?cat');
    } else if (number === 2) {
      pageContainer.classList.add('search');
      pageContainer.classList.remove('cat');
    }
  }

  function httpGet(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
      callback(xhr.responseText);
    });
    xhr.open('get', url, true);
    xhr.send();
  }

  function handleSearchParams() {
    var searchParams = {};
    // Thanks to https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/search for the following code
    if (location.search.length > 1) {
      for (var aItKey, nKeyId = 0, aCouples = location.search.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
        aItKey = aCouples[nKeyId].split("=");
        searchParams[decodeURIComponent(aItKey[0])] = aItKey.length > 1 ? decodeURIComponent(aItKey[1]) : "";
      }
    }

    if (typeof searchParams.cat !== 'undefined') {
      changeTab(1);
      if (searchParams.cat !== '') {
        categorySearch(searchParams.cat);
      }
    } else if (searchParams.info !== '') {
      collapseAllItems();
      var cardArray = Array.prototype.slice.call(doc.querySelectorAll('.info-' + searchParams.info));
      cardArray.forEach(function(element) {
        element.classList.add('expanded');
      });
      if (typeof searchParams.cat !== 'undefined' || typeof searchParams.search !== 'undefined') {
        cardArray[1].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        cardArray[0].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
      scroll(scrollX, scrollY - 60);
    } else {
      changeTab(0); // Just go to default spot
    }
  }

  function getItems() {
    httpGet('data/info.json', function(response) {
      var cardList = doc.querySelector('.info-list');
      info = JSON.parse(response);

      info.forEach(function(item, index) {
        item.index = index;
        var card = createInfoCard(item);
        cardList.appendChild(card);
      });

      handleSearchParams();
    });
  }

  function getCategories() {
    httpGet('data/categories.json', function(response) {
      var cardList = doc.querySelector('.cat-list');
      categories = JSON.parse(response);

      categories.forEach(function(item, index) {
        item.index = index;
        var card = createCategoryCard(item);
        cardList.appendChild(card);
      });

      getItems();
    });
  }

  function createInfoCard(data) {
    var category = categories[data.categories[0]];

    // Create card element
    var card = doc.createElement('div');
    card.classList.add('info-card');
    card.classList.add("info-" + data.index);
    // Store data values
    card.dataset.id = data.index;

    // Create header
    var header = doc.createElement('div');
    header.classList.add('header');
    var headerBg = doc.createElement('div');
    headerBg.classList.add('header-bg');
    headerBg.style.backgroundColor = category.color;
    var headerTitle = doc.createElement('h3');
    headerTitle.classList.add('card-title');
    headerTitle.textContent = data.title;
    headerTitle.style.color = category.textColor;
    header.appendChild(headerBg);
    header.appendChild(headerTitle);
    card.appendChild(header);

    card.addEventListener('click', function() {
      if (card.classList.contains('expanded')) {
        history.replaceState(null, '', '?');
      } else {
        collapseAllItems();
        history.replaceState(null, '', '?info=' + card.dataset.id);
      }
      card.classList.toggle('expanded');
    });

    var content = doc.createElement('div');
    content.classList.add('card-content');
    data.text.forEach(function(text) {
      var t = doc.createElement('p');
      t.textContent = text;
      content.appendChild(t);
    });
    card.appendChild(content);

    return card;
  }

  function createCategoryCard(data) {
    // Create card element
    var card = doc.createElement('div');
    card.classList.add('category-card');
    card.classList.add("cat-" + data.index);
    // Store data values
    card.dataset.id = data.index;
    card.style.backgroundColor = data.color;

    // Create header
    var header = doc.createElement('div');
    header.classList.add('header');
    var headerBg = doc.createElement('div');
    headerBg.classList.add('header-bg');

    var title = doc.createElement('h3');
    title.textContent = data.title;
    title.style.color = data.textColor;
    title.classList.add('card-title');
    card.appendChild(title);

    card.addEventListener('click', function() {
      categorySearch(card.dataset.id);
    });

    return card;
  }

  function categorySearch(id) {
    var category = categories[id];
    var container = doc.querySelector('.search-list');
    container.innerHTML = '';

    info.forEach(function(item) {
      if (item.categories.indexOf(id) > -1) {
        var card = createInfoCard(item);
        container.appendChild(card);
      }
    });

    history.replaceState(null, '', '?cat=' + id);
    changeTab(2);
  }

  function collapseAllItems() {
    var cardArray = Array.prototype.slice.call(doc.querySelectorAll('.info-card.expanded'));
    cardArray.forEach(function(item) {
      item.classList.remove('expanded');
    });
  }

  // Thanks to https://developer.mozilla.org/en-US/docs/Web/Events/scroll
  // For the following scroll event throtling.
  // Yay for making things go slightly slower for performance!
  (function() {
    var throttle = function(type, name, obj) {
      obj = obj || window;
      var running = false;
      var func = function() {
        if (running) {
          return;
        }
        running = true;
        requestAnimationFrame(function() {
          obj.dispatchEvent(new CustomEvent(name));
          running = false;
        });
      };
      obj.addEventListener(type, func);
    };
    throttle("scroll", "optimizedScroll");
  })();

  if (doc.readyState !== 'loading')
    initInfo();
  else
    win.addEventListener('load', function() {
      initInfo();
    });

})(window, document);
