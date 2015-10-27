(function(win, doc) {
  'use strict';

  var tabs = doc.querySelector('paper-tabs');
  var pages = doc.querySelector('iron-pages');

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
      var data = JSON.parse(response);

      data.forEach(function(item, index) {
        var card = doc.createElement('info-card');
        card.heading = item.title;
        card.dataset.id = index;
        card.id = "info-" + index;

        card.addEventListener('click', function() {
          if (!card.classList.contains('expanded')) {
            collapseAllItems();
            history.replaceState(null, '', '?info="' + card.dataset.id + '"');
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
      var data = JSON.parse(response);

      data.forEach(function(item, index) {
        var card = doc.createElement('category-card');
        card.heading = item.title;
        card.dataset.id = index;
        card.id = "cat-" + index;

        card.style.color = item.textColor;
        card.style.backgroundColor = item.color;

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
