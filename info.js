(function(win, doc) {
  'use strict';

  var tabs = doc.querySelector('paper-tabs');
  var pages = doc.querySelector('iron-pages');

  var info = [];
  var categories = [];

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

    if (typeof searchParams.info !== 'undefined') {
      tabs.select(0);
      if (searchParams.info !== '') {
        var element = doc.querySelector('#info-' + searchParams.info);
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        collapseAllItems();
        element.querySelector('.header-bg').style.backgroundColor = element.dataset.expColor;
        element.querySelector('.card-title').style.color = element.dataset.expTextColor;
        element.classList.add('expanded');
      }
    } else if (typeof searchParams.cat !== 'undefined') {
      tabs.select(1);
      if (searchParams.cat !== '') {

      }
    } else {
      tabs.select(0); // Just go to default spot
    }
  }

  function getItems() {
    httpGet('data/info.json', function(response) {
      var cardList = doc.querySelector('.info-list');
      info = JSON.parse(response);

      info.forEach(function(item, index) {
        var category = categories[item.categories[0]];

        // Create card element
        var card = doc.createElement('div');
        card.classList.add('info-card');
        card.id = "info-" + index;
        // Store data values
        card.dataset.id = index;
        card.dataset.expColor = category.color;
        card.dataset.expTextColor = category.textColor;

        // Create header
        var header = doc.createElement('div');
        header.classList.add('header');
        var headerBg = doc.createElement('div');
        headerBg.classList.add('header-bg');
        var headerTitle = doc.createElement('h3');
        headerTitle.classList.add('card-title');
        headerTitle.textContent = item.title;
        header.appendChild(headerBg);
        header.appendChild(headerTitle);
        card.appendChild(header);

        card.addEventListener('click', function() {
          if (card.classList.contains('expanded')) {
            headerBg.style.backgroundColor = '#fff';
            headerTitle.style.color = '#000';
          } else {
            headerBg.style.backgroundColor = card.dataset.expColor;
            headerTitle.style.color = card.dataset.expTextColor;
            collapseAllItems();
            history.replaceState(null, '', '?info=' + card.dataset.id);
          }
          card.classList.toggle('expanded');
        });

        var content = doc.createElement('div');
        content.classList.add('card-content');
        item.text.forEach(function(text) {
          var t = doc.createElement('p');
          t.textContent = text;
          content.appendChild(t);
        });
        card.appendChild(content);

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
        // Create card element
        var card = doc.createElement('div');
        card.classList.add('category-card');
        card.id = "cat-" + index;
        // Store data values
        card.dataset.id = index;
        card.style.backgroundColor = item.color;

        // Create header
        var header = doc.createElement('div');
        header.classList.add('header');
        var headerBg = doc.createElement('div');
        headerBg.classList.add('header-bg');

        var title = doc.createElement('h3');
        title.textContent = item.title;
        title.style.color = item.textColor;
        title.classList.add('card-title');
        card.appendChild(title);

        card.addEventListener('click', function() {
          // Go to expanded view
        });

        cardList.appendChild(card);
      });

      getItems();
    });
  }

  function collapseAllItems() {
    var cardArray = Array.prototype.slice.call(doc.querySelectorAll('info-card.expanded'));
    cardArray.forEach(function(item) {
      item.classList.remove('expanded');
    });
  }

  tabs.addEventListener('iron-select', function() {
    pages.selected = tabs.selected;

    if (pages.selected === 0) {
      history.replaceState(null, '', '?');
    } else if (pages.selected === 1) {
      history.replaceState(null, '', '?cat');
    }
  });
  getCategories();

})(window, document);
