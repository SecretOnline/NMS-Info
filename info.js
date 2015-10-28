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
      scroll(0, 0);
    });
    doc.querySelector('.tab-cat').addEventListener('click', function() {
      changeTab(1);
      scroll(0, 0);
    });
    doc.querySelector('.tab-search').addEventListener('click', function() {
      changeTab(2);
      scroll(0, 0);
    });

    doc.querySelector('.search-button').addEventListener('click', function() {
      var query = doc.querySelector('.search-box').value;
      generalSearch(query);
      changeTab(2);
      scroll(0, 0);
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
    } else if (typeof searchParams.search !== 'undefined') {
      if (searchParams.search) {
        var query = decodeURIComponent(searchParams.search);
        generalSearch(query);
      }
      changeTab(2);
    } else if (typeof searchParams.info !== 'undefined') {
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
    if (category.darkText) {
      card.classList.add('dark-text');
    }

    // Create header
    var header = doc.createElement('div');
    header.classList.add('header');
    var headerBg = doc.createElement('div');
    headerBg.classList.add('header-bg');
    headerBg.style.backgroundColor = category.color;
    var headerTitle = doc.createElement('h3');
    headerTitle.classList.add('card-title');
    headerTitle.textContent = data.title;
    header.appendChild(headerBg);
    header.appendChild(headerTitle);
    card.appendChild(header);

    if (data.categories.length) {
      var cats = doc.createElement('div');
      cats.classList.add('categories');

      var catList = doc.createElement('ul');
      data.categories.forEach(function(cat) {
        var catEl = doc.createElement('li');
        catEl.textContent = categories[cat].title;
        catEl.dataset.id = cat;
        catEl.style.color = category.textColor;

        catEl.addEventListener('click', function() {
          categorySearch(catEl.dataset.id);
        });

        catList.appendChild(catEl);
      });
      cats.appendChild(catList);

      header.appendChild(cats);
    }

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
    card.appendChild(content);

    var information = doc.createElement('div');
    information.classList.add('information');
    data.text.forEach(function(text) {
      var t = doc.createElement('p');
      t.textContent = text;
      information.appendChild(t);
    });
    content.appendChild(information);

    if (data.sources || data.related) {
      var separator = doc.createElement('div');
      separator.classList.add('separator');
      content.appendChild(separator);

      if (data.sources)
        if (data.sources.length) {
          var sources = doc.createElement('div');
          sources.classList.add('sources');
          var sourceTitle = doc.createElement('h4');
          sourceTitle.textContent = 'Sources';
          sources.appendChild(sourceTitle);

          var sourceList = doc.createElement('ul');
          data.sources.forEach(function(source, sIndex) {
            var sourceEl = doc.createElement('li');
            sourceEl.innerHTML = '<a href="' + source + '">' + (sIndex + 1) + '</a>';
            sourceList.appendChild(sourceEl);
          });
          sources.appendChild(sourceList);

          content.appendChild(sources);
        }

      if (data.related)
        if (data.related.length) {
          var related = doc.createElement('div');
          related.classList.add('related');
          var relatedTitle = doc.createElement('h4');
          relatedTitle.textContent = 'Related';
          related.appendChild(relatedTitle);

          var relatedList = doc.createElement('ul');
          data.related.forEach(function(rItem, rIndex) {
            var itemEl = doc.createElement('li');
            itemEl.innerHTML = '<a href="' + rItem + '">' + (rIndex + 1) + '</a>';
            relatedList.appendChild(itemEl);
          });
          related.appendChild(relatedList);

          content.appendChild(related);
        }
    }

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
    var title = doc.querySelector('.search-title');
    title.textContent = 'Category: ' + category.title;
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
    scroll(0, 0);
  }

  function generalSearch(query) {
    query = query.toLowerCase();
    var title = doc.querySelector('.search-title');
    title.textContent = 'Search: ' + query;
    var container = doc.querySelector('.search-list');
    container.innerHTML = '';

    var titleTitle = doc.createElement('h3');
    titleTitle.textContent = 'Title Match';
    container.appendChild(titleTitle);

    info.forEach(function(item) {
      if (item.title.toLowerCase().indexOf(query) > -1) {
        var card = createInfoCard(item);
        container.appendChild(card);
      }
    });

    var textTitle = doc.createElement('h3');
    textTitle.textContent = 'Text Match';
    container.appendChild(textTitle);

    info.forEach(function(item) {
      var added = false;
      item.text.forEach(function(text) {
        if (added)
          return;

        if (text.toLowerCase().indexOf(query) > -1) {
          var card = createInfoCard(item);
          container.appendChild(card);
          added = true;
        }
      });
    });

    history.replaceState(null, '', '?search=' + encodeURIComponent(query));
    changeTab(2);
    scroll(0, 0);
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
