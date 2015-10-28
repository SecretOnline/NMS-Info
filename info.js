(function(win, doc) {
  'use strict';

  var info = [];
  var categories = [];

  var aboutCard = {
    title: 'About this Repository',
    index: -1,
    text: [
      'This repository of information contains things that are known about the upcoming game No Man\'s Sky',
      'It is an open source project, and source code can be found on GitHub',
      'It was created by secret_online, but a full list of contributors can be found on GitHub',
      'If something is missing, please tell someone, or fork this project and add it yourself'
    ],
    sources: [
      'https://github.com/SecretOnline/NMS-Info',
      'http://secretonline.co'
    ],
    categories: []
  };

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
      var colOne = doc.createElement('div');
      var colTwo = doc.createElement('div');
      colOne.classList.add('card-half');
      colTwo.classList.add('card-half');

      colOne.appendChild(createInfoCard(aboutCard));
      cardList.appendChild(colOne);
      cardList.appendChild(colTwo);

      info = JSON.parse(response);
      var cardArr = [];

      info.forEach(function(item, index) {
        item.index = index;
        var card = createInfoCard(item);
        cardArr.push(card);
      });

      cardArr = arrayRandomise(cardArr);

      cardArr.forEach(function(item, index) {
        if (index % 2)
          colOne.appendChild(item);
        else
          colTwo.appendChild(item);
      });

      handleSearchParams();
    });
  }

  function getCategories() {
    httpGet('data/categories.json', function(response) {
      var cardList = doc.querySelector('.cat-list');
      var colOne = doc.createElement('div');
      var colTwo = doc.createElement('div');
      colOne.classList.add('card-half');
      colTwo.classList.add('card-half');

      cardList.appendChild(colOne);
      cardList.appendChild(colTwo);

      categories = JSON.parse(response);

      categories.forEach(function(item, index) {
        item.index = index;
        var card = createCategoryCard(item);
        if (index % 2)
          colTwo.appendChild(card);
        else
          colOne.appendChild(card);
      });

      getItems();
    });
  }

  function createInfoCard(data) {

    // Create card element
    var card = doc.createElement('div');
    card.classList.add('info-card');
    card.classList.add("info-" + data.index);
    // Store data values
    card.dataset.id = data.index;

    if (data.spoiler)
      card.classList.add('spoiler');

    // Create header
    var header = doc.createElement('div');
    header.classList.add('header');
    var headerBg = doc.createElement('div');
    headerBg.classList.add('header-bg');
    var headerTitle = doc.createElement('h3');
    headerTitle.classList.add('card-title');
    headerTitle.textContent = data.title;
    header.appendChild(headerBg);
    header.appendChild(headerTitle);
    card.appendChild(header);

    if (data.categories.length) {
      var category = categories[data.categories[0]];
      if (category.darkText) {
        card.classList.add('dark-text');
      }
      headerBg.style.backgroundColor = category.color;

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

    header.addEventListener('click', function() {
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

    if (data.darkText)
      card.classList.add('dark-text');

    // Create header
    var header = doc.createElement('div');
    header.classList.add('header');
    var headerBg = doc.createElement('div');
    headerBg.classList.add('header-bg');

    var title = doc.createElement('h3');
    title.textContent = data.title;
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
    var colOne = doc.createElement('div');
    var colTwo = doc.createElement('div');
    colOne.classList.add('card-half');
    colTwo.classList.add('card-half');

    container.appendChild(colOne);
    container.appendChild(colTwo);

    var cardArr = [];

    info.forEach(function(item) {
      if (item.categories.indexOf(id) > -1) {
        var card = createInfoCard(item);
        cardArr.push(card);
      }
    });

    cardArr.forEach(function(item, index) {
      if (index % 2)
        colTwo.appendChild(item);
      else
        colOne.appendChild(item);
    });

    history.replaceState(null, '', '?cat=' + id);
    changeTab(2);
    scroll(0, 0);
  }

  function generalSearch(query) {
    var title = doc.querySelector('.search-title');
    title.textContent = 'Search: ' + query;
    var container = doc.querySelector('.search-list');
    container.innerHTML = '';
    var colOne = doc.createElement('div');
    var colTwo = doc.createElement('div');
    colOne.classList.add('card-half');
    colTwo.classList.add('card-half');
    container.appendChild(colOne);
    container.appendChild(colTwo);

    var scores = {};

    info.forEach(function(item) {
      var score = getSearchScore(query, item);
      var card = createInfoCard(item);

      if (!scores[score])
        scores[score] = [];

      scores[score].push(card);
    });

    console.log(scores);

    var cardArr = [];
    var values = Object.keys(scores);
    values.sort(function(one, two) {
      // Sort as integers, not strings
      var a = parseInt(one);
      var b = parseInt(two);
      if (a < b)
        return -1;
      if (a > b)
        return 1;
      return 0;
    });
    console.log(values);
    values.forEach(function(score) {
      if (score > 0)
        scores[score].forEach(function(card) {
          cardArr.unshift(card);
        });
    });

    cardArr.forEach(function(item, index) {
      if (index % 2)
        colTwo.appendChild(item);
      else
        colOne.appendChild(item);
    });

    history.replaceState(null, '', '?search=' + encodeURIComponent(query));
    changeTab(2);
    scroll(0, 0);
  }

  function getSearchScore(query, info) {
    query = query.toLowerCase();
    var score = 0;

    var querySplit = query.split(/\W+/);
    var lTitle = info.title.toLowerCase();

    // Title contains
    if (lTitle.indexOf(query) > -1)
      score += 8;
    // Title contains parts
    querySplit.forEach(function(word) {
      if (lTitle.indexOf(word) > -1)
        score += 5;
    });
    info.text.forEach(function(text) {
      var lText = text.toLowerCase();
      // Text contains
      if (lText.indexOf(query) > -1)
        score += 2;
      // Text contains parts
      querySplit.forEach(function(word) {
        if (lText.indexOf(word) > -1)
          score += 1;
      });
    });

    console.log(info.title + ' got ' + score);
    return score;
  }

  function collapseAllItems() {
    var cardArray = Array.prototype.slice.call(doc.querySelectorAll('.info-card.expanded'));
    cardArray.forEach(function(item) {
      item.classList.remove('expanded');
    });
  }

  function arrayRandomise(array) {
    var newArr = [];

    while (array.length > 0) {
      var index = Math.floor(Math.random() * array.length);
      newArr.push(array.splice(index, 1)[0]);
    }

    return newArr;
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
