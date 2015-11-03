(function(win, doc) {
  'use strict';

  var info = {};
  var categories = {};
  var resources = {};

  var aboutCard = {
    title: 'About this Repository',
    text: [
      'This repository of information contains things that are known about the upcoming game No Man\'s Sky',
      'It is an open source project, and source code can be found on GitHub',
      'It was created by secret_online, but a full list of contributors can be found on GitHub',
      'If something is missing, please send me a message using one of the link below, or fork this project and add it yourself',
      'It is recommended that you read through these cards before posting to /r/NoMansSkyTheGame. This prevents the need for a lot of useless posts'
    ],
    sources: [
      'https://github.com/SecretOnline/NMS-Info',
      'http://secretonline.co',
      'https://www.reddit.com/message/compose/?to=secret_online'
    ],
    categories: []
  };

  /**
   * Create everything that is needed for normal page function
   */
  function initInfo() {
    // do navbar scoll stuff
    window.addEventListener("optimizedScroll", function() {
      var nav = doc.querySelector('nav');
      // If the header is out of view
      if (scrollY > 70) {
        nav.classList.add('floating');
      } else {
        nav.classList.remove('floating');
      }
      if (scrollX > 0)
        scroll(0, scrollY);
    });

    // Add navigation event handlers
    doc.querySelector('.tab-info').addEventListener('click', function() {
      changeTab('main');
    });
    doc.querySelector('.tab-cat').addEventListener('click', function() {
      changeTab('categories');
    });
    doc.querySelector('.tab-search').addEventListener('click', function() {
      changeTab('search');
    });
    doc.querySelector('.tab-elements').addEventListener('click', function() {
      changeTab('elements');
    });

    function doInfoSearch() {
      changeTab(2);
      var query = doc.querySelector('.info-search-box').value;
      generalSearch(query);
    }
    // Main search box event handlers
    doc.querySelector('.info-search-button').addEventListener('click', doInfoSearch);
    doc.querySelector('.info-search-box').addEventListener('keyup', function(event) {
      if (event.keyCode === 13) {
        doInfoSearch();
      }
    });

    // Create cards for all the information
    getCategories();
    getResources();
  }

  /**
   * Change which page is currently visible
   * @param tab Name of the tab to switch to
   */
  function changeTab(tab) {
    scroll(0, 0);
    var pageContainer = doc.querySelector('.page-container');

    if (typeof tab === 'undefined' || tab === 'main') {
      // Go to main page
      pageContainer.classList.remove('cat');
      pageContainer.classList.remove('search');
      pageContainer.classList.remove('elements');
      history.replaceState(null, '', '?');
    } else if (tab === 'categories') {
      // Go to categories list
      pageContainer.classList.add('cat');
      pageContainer.classList.remove('search');
      pageContainer.classList.remove('elements');
      history.replaceState(null, '', '?cat');
    } else if (tab === 'search') {
      // Go to search
      pageContainer.classList.add('search');
      pageContainer.classList.remove('cat');
      pageContainer.classList.remove('elements');
      history.replaceState(null, '', '?search');
    } else if (tab === 'elements') {
      // Go to elements
      pageContainer.classList.add('elements');
      pageContainer.classList.remove('search');
      pageContainer.classList.remove('cat');
      history.replaceState(null, '', '?element');
    }
  }

  /**
   * Quick helper function to make an HTTP GET request and call a callback with the response
   * @param url URL of the resource to request
   * @param callback Callback function that takes a single parameter which hold the response of the request
   */
  function httpGet(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
      callback(xhr.responseText);
    });
    xhr.open('get', url, true);
    xhr.send();
  }

  /**
   * Look at the parameters in the url, and do things based on them
   */
  function handleSearchParams() {
    var searchParams = {};
    // Thanks to https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/search for the following block of code
    if (location.search.length > 1) {
      for (var aItKey, nKeyId = 0, aCouples = location.search.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
        aItKey = aCouples[nKeyId].split("=");
        searchParams[decodeURIComponent(aItKey[0])] = aItKey.length > 1 ? decodeURIComponent(aItKey[1]) : "";
      }
    }

    if (typeof searchParams.cat !== 'undefined') {
      // Go to the categories page
      changeTab('categories');
      if (searchParams.cat !== '') {
        // Go to the search page, but fill it with all info in the specified category
        categorySearch(searchParams.cat);
      }
    } else if (typeof searchParams.search !== 'undefined') {
      // Go to the search page
      changeTab('search');
      if (searchParams.search) {
        // Perform a search with the given parameter
        var query = decodeURIComponent(searchParams.search);
        generalSearch(query);
        document.querySelector('.info-search-box').value = searchParams.search;
      }
    } else if (typeof searchParams.info !== 'undefined') {
      collapseAllItems();
      // Expand card
      var infoElement = doc.querySelector('.info-card[data-title="' + searchParams.info + '"]');
      infoElement.classList.add('expanded');
      addCardInfo(infoElement, info[searchParams.info]);
      infoElement.scrollIntoView();
      // Make sure card isn't hidden behind the floating navigation bar
      scroll(scrollX, scrollY - 60);
    } else if (typeof searchParams.element !== 'undefined') {
      // Go to the elements page
      changeTab('elements');
      if (searchParams.element) {
        // Expand the specified element
        var element = document.querySelector('.element-card[data-name="' + searchParams.element + '"]');
        element.classList.add('expanded');
        addResourceInfo(element, resources[searchParams.element]);
        element.scrollIntoView();
        // Make sure card isn't hidden behind the floating navigation bar
        scroll(scrollX, scrollY - 60);
      }
    } else {
      changeTab('main'); // Just go to default spot
    }
  }

  /**
   * Retrieve information, and add cards to page
   */
  function getItems() {
    httpGet('data/info.json', function(response) {
      var cardList = doc.querySelector('.info-list');

      var infoArr = JSON.parse(response);
      var cardArr = [];

      // Create cards for each of the pieces of information
      infoArr.forEach(function(item) {
        info[item.title] = item;
        var card = createInfoCard(item);
        cardArr.push(card);
      });

      cardArr = arrayRandomise(cardArr);
      // Add "about" card to the top of the list
      cardArr.unshift(createInfoCard(aboutCard));

      distributeItems(cardArr, cardList);

      // Now that data is loaded, process the search parameters
      handleSearchParams();
    });
  }

  /**
   * Retrieve categories and create cards for them
   */
  function getCategories() {
    httpGet('data/categories.json', function(response) {
      var cardList = doc.querySelector('.cat-list');

      var categoriesArr = JSON.parse(response);

      // Create category cards for each of the categories
      var cardArr = [];
      categoriesArr.forEach(function(item) {
        categories[item.title] = item;
        var card = createCategoryCard(item);
        cardArr.push(card);
      });

      distributeItems(cardArr, cardList);

      // Load in information, now that categories are loaded
      getItems();
    });
  }

  /**
   * Retrieve element list and create cards
   */
  function getResources() {
    httpGet('data/resources.json', function(response) {
      var cardList = doc.querySelector('.elements-list');

      var resourcesArr = JSON.parse(response);

      var cardArr = [];

      // Create element cards
      resourcesArr.forEach(function(item, index) {
        resources[item.name] = item;

        var card = createResourceCard(item);
        cardArr.push(card);
      });

      // This must be done in a second loop, otherwise some things might not have been initialise
      var resIndexArr = Object.keys(resources);
      resIndexArr.forEach(function(index) {
        var item = resources[index];
        // Add entry back to this item if this one makes the other
        if (item.makes) {
          item.makes.forEach(function(compound) {
            if (resources[compound]) {
              if (!resources[compound].madeFrom)
                resources[compound].madeFrom = [];
              resources[compound].madeFrom.push(index);
            }
          });
        }
      });

      distributeItems(cardArr, cardList);
    });
  }

  /**
   * Create an information card with the given data
   * @param data Object describing the piece of information
   * @return Element to add to page
   */
  function createInfoCard(data) {
    // Create card element
    var card = doc.createElement('div');
    card.classList.add('info-card');
    // Store data values
    card.dataset.title = data.title;

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

    // Add empty content box
    var content = doc.createElement('div');
    content.classList.add('card-content');
    card.appendChild(content);

    // Add category list
    if (data.categories)
      if (data.categories.length) {
        var category = categories[data.categories[0]];
        if (category.darkText) {
          card.classList.add('dark-text');
        }
        headerBg.style.backgroundColor = category.color;

        var cats = doc.createElement('div');
        cats.classList.add('categories');

        // Add all specified categories to a list
        var catList = doc.createElement('ul');
        data.categories.forEach(function(cat) {
          var catEl = doc.createElement('li');
          catEl.textContent = categories[cat].title;
          catEl.dataset.id = cat;
          catEl.style.color = category.textColor;

          catEl.addEventListener('click', function() {
            // Perform a category search on the clicked category
            categorySearch(catEl.dataset.id);
          });

          catList.appendChild(catEl);
        });
        cats.appendChild(catList);

        header.appendChild(cats);
      }

      // Open / close the card when the header is clicked
    header.addEventListener('click', function() {
      if (card.classList.contains('expanded')) {
        // See whether we need to do anything special to the url
        if (document.querySelector('.page-container').classList.contains('search'))
        // Add search to the url
          if (document.querySelector('.info-search-box').value)
            history.replaceState(null, '', '?search=' + encodeURIComponent(document.querySelector('.info-search-box').value.toLowerCase()));
          else
            history.replaceState(null, '', '?search');
        else
          history.replaceState(null, '', '?');

        // Clear content after 0.5 seconds
        setTimeout(function() {
          if (!card.classList.contains('expanded'))
            content.innerHTML = '';
        }, 500);
      } else {
        // Expand the card
        collapseAllItems();
        history.replaceState(null, '', '?info=' + encodeURIComponent(card.dataset.title));

        addCardInfo(card, data);
      }
      card.classList.toggle('expanded');
    });

    return card;
  }

  /**
   * Add content to the given card
   * This is so that inner elements are only present if needed
   * @param card Element to add the information to
   * @param data Object describing the piece of information
   */
  function addCardInfo(card, data) {
    if (typeof data === 'undefined')
      data = aboutCard;

    // Clear any pre-existing content
    var content = card.querySelector('.card-content');
    content.innerHTML = '';

    // Add information text
    var information = doc.createElement('div');
    information.classList.add('information');
    if (data.text)
      data.text.forEach(function(text) {
        var t = doc.createElement('p');
        t.textContent = text;
        information.appendChild(t);
      });
    content.appendChild(information);

    // If another section is required
    if (data.sources || data.related) {
      var separator = doc.createElement('div');
      separator.classList.add('separator');
      content.appendChild(separator);

      // If there are sources to show
      if (data.sources)
        if (data.sources.length) {
          var sources = doc.createElement('div');
          sources.classList.add('sources');
          var sourceTitle = doc.createElement('h4');
          sourceTitle.textContent = 'Sources';
          sources.appendChild(sourceTitle);

          // Add sources to list
          var sourceList = doc.createElement('ul');
          data.sources.forEach(function(source, sIndex) {
            var sourceEl = doc.createElement('li');
            var anchor = document.createElement('a');
            anchor.href = source;
            anchor.textContent = sIndex + 1;
            appendHoverElement(anchor, [source]);
            sourceEl.appendChild(anchor);
            sourceList.appendChild(sourceEl);
          });
          sources.appendChild(sourceList);

          content.appendChild(sources);
        }

        // If there are related items to link to
        // Unfinished, do not use at this stage
      if (data.related)
        if (data.related.length) {
          var related = doc.createElement('div');
          related.classList.add('related');
          var relatedTitle = doc.createElement('h4');
          relatedTitle.textContent = 'Related';
          related.appendChild(relatedTitle);

          // Add related items to list
          var relatedList = doc.createElement('ul');
          data.related.forEach(function(rItem) {
            var itemEl = doc.createElement('li');
            itemEl.textContent = rItem;
            itemEl.addEventListener('click', function() {
              var otherCard = document.querySelector('.info-card[data-title="' + rItem + '"]');
              // Expand the other card
              collapseAllItems();
              history.replaceState(null, '', '?info=' + encodeURIComponent(rItem));

              addCardInfo(otherCard, info[rItem]);
              otherCard.classList.add('expanded');
              otherCard.scrollIntoView();
              // Make sure card isn't hidden behind the floating navigation bar
              scroll(scrollX, scrollY - 60);
            });
            relatedList.appendChild(itemEl);
          });
          related.appendChild(relatedList);

          content.appendChild(related);
        }
    }
  }

  /**
   * Create a card for a category
   * @param data Object describing this category
   * @return Element to add to the page
   */
  function createCategoryCard(data) {
    // Create card element
    var card = doc.createElement('div');
    card.classList.add('category-card');
    // Store data values
    card.dataset.title = data.title;
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

    // Do a category search when clicked
    card.addEventListener('click', function() {
      categorySearch(data.title);
    });

    return card;
  }

  /**
   * Create an element card
   * @param data Object describing this element
   * @return Element to add to the page
   */
  function createResourceCard(data) {
    // Create card element
    var card = doc.createElement('div');
    card.classList.add('element-card');
    // Store data values
    card.dataset.name = data.name;

    // Create header
    var header = doc.createElement('div');
    header.classList.add('header');
    var headerBg = doc.createElement('div');
    headerBg.classList.add('header-bg');
    headerBg.style.backgroundColor = data.color;
    var headerSymbol = doc.createElement('h3');
    headerSymbol.classList.add('element-symbol');
    if (data.symbol)
      headerSymbol.textContent = data.symbol;
    else
      headerSymbol.textContent = '??';
    var headerTitle = doc.createElement('h3');
    headerTitle.classList.add('card-title');
    if (data.name)
      headerTitle.textContent = data.name;
    else
      headerTitle.textContent = '???';
    header.appendChild(headerBg);
    header.appendChild(headerSymbol);
    header.appendChild(headerTitle);
    card.appendChild(header);

    // Add empty content box
    var content = doc.createElement('div');
    content.classList.add('card-content');
    card.appendChild(content);

    // Expand card when clicked
    header.addEventListener('click', function() {
      if (card.classList.contains('expanded')) { // See whether we need to do anything special to the url
        if (document.querySelector('.page-container').classList.contains('search'))
        // Add search to the url
          if (document.querySelector('.info-search-box').value)
            history.replaceState(null, '', '?search=' + encodeURIComponent(document.querySelector('.info-search-box').value.toLowerCase()));
          else
            history.replaceState(null, '', '?search');
        else
          history.replaceState(null, '', '?');

        // Clear content after 0.5 seconds
        setTimeout(function() {
          if (!card.classList.contains('expanded'))
            content.innerHTML = '';
        }, 500);
      } else {
        collapseAllItems();
        history.replaceState(null, '', '?element=' + card.dataset.name);

        addResourceInfo(card, data);
      }
      card.classList.toggle('expanded');
    });

    return card;
  }

  /**
   * Add information to resource card
   * This is so that inner elements are only present if needed
   * @param card Element to add the information to
   * @param data Object describing the element
   */
  function addResourceInfo(card, data) {
    var content = card.querySelector('.card-content');
    content.innerHTML = '';

    // Add element description
    var information = doc.createElement('div');
    information.classList.add('information');
    content.appendChild(information);
    var description = doc.createElement('p');
    description.classList.add('element-description');
    if (data.description)
      description.textContent = data.description;
    else
      description.textContent = 'No description for this element has been found yet';
    information.appendChild(description);

    // If another area is needed
    if (data.makes || data.madeFrom) {
      //Add a separator
      var separator = doc.createElement('div');
      separator.classList.add('separator');
      content.appendChild(separator);

      if (data.makes) {
        // Add list of resources this one can make
        var makes = doc.createElement('div');
        makes.classList.add('element-makes');
        var makesTitle = doc.createElement('h4');
        makesTitle.textContent = 'Makes';
        makes.appendChild(makesTitle);

        var makesList = doc.createElement('ul');
        data.makes.forEach(function(element) {
          var elementEl = doc.createElement('li');
          if (resources[element]) {
            elementEl.textContent = resources[element].name;

            // Expand other item when clicked
            elementEl.addEventListener('click', function() {
              collapseAllItems();
              var otherElement = document.querySelector('.element-card[data-name="' + element + '"]');
              otherElement.classList.add('expanded');
              addResourceInfo(otherElement, resources[element]);
            });
          } else
            elementEl.textContent = element;
          makesList.appendChild(elementEl);
        });
        makes.appendChild(makesList);

        content.appendChild(makes);
      }
      if (data.madeFrom) {
        // Add list fo resource this one can be made from
        var madeFrom = doc.createElement('div');
        madeFrom.classList.add('element-made-from');
        var madeFromTitle = doc.createElement('h4');
        madeFromTitle.textContent = 'Made From';
        madeFrom.appendChild(madeFromTitle);

        var madeFromList = doc.createElement('ul');
        data.madeFrom.forEach(function(element) {
          var elementEl = doc.createElement('li');
          if (resources[element]) {
            elementEl.textContent = resources[element].name;

            // Expand other item when clicked
            elementEl.addEventListener('click', function() {
              collapseAllItems();
              var otherElement = document.querySelector('.element-card[data-name="' + element + '"]');
              otherElement.classList.add('expanded');
              addResourceInfo(otherElement, resources[element]);
            });
          } else
            elementEl.textContent = element;
          madeFromList.appendChild(elementEl);
        });
        madeFrom.appendChild(madeFromList);

        content.appendChild(madeFrom);
      }
    }
  }

  /**
   * Search by category
   * Lists all pieces of information in the category
   * @param id ID of a category to search for
   */
  function categorySearch(id) {
    var category = categories[id];
    var title = doc.querySelector('.search-title');
    title.textContent = 'Category: ' + category.title;
    var container = doc.querySelector('.search-list');

    var cardArr = [];
    var infoIndexArr = Object.keys(info);

    infoIndexArr.forEach(function(index) {
      var item = info[index];
      // If info is in the category
      if (item.categories.indexOf(id) > -1) {
        // Create card and add to list
        var card = createInfoCard(item);
        cardArr.push(card);
      }
    });

    distributeItems(cardArr, container);
    changeTab('search');

    history.replaceState(null, '', '?cat=' + id);
  }

  /**
   * Perform a search
   * @param query String to search for
   */
  function generalSearch(query) {
    var title = doc.querySelector('.search-title');
    title.textContent = 'Search: ' + query;
    var container = doc.querySelector('.search-list');

    var scores = {};
    var infoIndexArr = Object.keys(info);

    // Get the score for a aprticulat piece of information
    infoIndexArr.forEach(function(index) {
      var item = info[index];
      var score = getSearchScore(query, item);
      var card = createInfoCard(item);

      // Don't add anything with a score of 0
      if (score > 0) {
        if (!scores[score])
          scores[score] = [];

        scores[score].push(card);
      }
    });
    // Search elements as well
    var resIndexArr = Object.keys(resources);
    // Get the score for an element
    resIndexArr.forEach(function(index) {
      var item = resources[index];
      var score = getElementSearchScore(query, item);

      // Don't add anything with a score of 0
      if (score > 0) {
        if (!scores[score])
          scores[score] = [];

        var card = createResourceCard(item);
        scores[score].push(card);
      }
    });

    var cardArr = [];
    var values = Object.keys(scores);
    // Sort using integers, not strings
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

    // Add information backwards (so highest score is at top)
    values.forEach(function(score) {
      var arr = [];
      scores[score].forEach(function(card) {
        arr.push(card);
      });
      cardArr = arr.concat(cardArr);
    });

    // Expand card if only one item returned in search
    if (cardArr.length === 1) {
      cardArr[0].classList.add('expanded');
      if (cardArr[0].classList.contains('info-card'))
        addCardInfo(cardArr[0], info[cardArr[0].dataset.title]);
      else if (cardArr[0].classList.contains('element-card'))
        addResourceInfo(cardArr[0], resources[cardArr[0].dataset.name]);
    }

    distributeItems(cardArr, container);

    history.replaceState(null, '', '?search=' + encodeURIComponent(query));
    scroll(0, 0);
  }

  /**
   * Calculate search score based on query
   * @param query String to search for
   * @param info Object describing a piece of information
   * @return Integer score for this piece of information. Higher means better match
   */
  function getSearchScore(query, info) {
    query = query.toLowerCase();
    var score = 0;

    var querySplit = query.split(/\W+/);
    var lTitle = info.title.toLowerCase();

    // Title contains
    if (lTitle.indexOf(query) > -1)
      score += 3;
    // Title contains parts
    querySplit.forEach(function(word) {
      if (lTitle.match(new RegExp('\\s' + word + '\\s')))
        score += 5;
      if (lTitle.indexOf(word) > -1)
        score += 2;
    });
    info.text.forEach(function(text) {
      var lText = text.toLowerCase();
      // Text contains
      if (lText.indexOf(query) > -1)
        score += 2;
      // Text contains parts
      querySplit.forEach(function(word) {
        if (lText.match(new RegExp('\\s' + word + '\\s')))
          score += 1;
        if (lText.indexOf(word) > -1)
          score += 1;
      });
    });

    return score;
  }

  /**
   * Calculate search score based on query
   * @param query String to search for
   * @param element Object describing an element
   * @return Integer score for this element. Higher means better match
   */
  function getElementSearchScore(query, element) {
    query = query.toLowerCase();
    var score = 0;

    var querySplit = query.split(/\W+/);

    // Name contains
    if (element.name) {
      var lName = element.name.toLowerCase();
      if (lName.indexOf(query) > -1)
        score += 8;
      // Name contains parts
      querySplit.forEach(function(word) {
        if (lName.match(new RegExp('\\s' + word + '\\s')))
          score += 6;
        if (lName.indexOf(word) > -1)
          score += 2;
      });
    }

    // Symbol
    if (element.symbol)
      if (query.match(new RegExp('\\b' + element.symbol + '\\b', 'i')))
        score += 9;

      // Text contains
    if (element.description) {
      var lText = element.description.toLowerCase();
      if (lText.indexOf(query) > -1)
        score += 2;
      // Text contains parts
      querySplit.forEach(function(word) {
        if (lText.match(new RegExp('\\s' + word + '\\s')))
          score += 2;
        if (lText.indexOf(word) > -1)
          score += 1;
      });
    }

    return score;
  }

  /**
   * Organise items into one or two columns depending on screen size
   * @param array Array containin Elements that should be added
   * @param container Element that the Elements in the array should be added to
   */
  function distributeItems(array, container) {
    var twoColThreshold = 920; // Should match class
    var threeColThreshold = 1300; // Should match class

    container.innerHTML = '';
    if (innerWidth <= twoColThreshold) {
      // Just add to container
      array.forEach(function(item) {
        container.appendChild(item);
      });
    } else if (innerWidth <= threeColThreshold) {
      // Create columns
      var colOne = doc.createElement('div');
      var colTwo = doc.createElement('div');
      colOne.classList.add('card-column');
      colTwo.classList.add('card-column');
      container.appendChild(colOne);
      container.appendChild(colTwo);

      array.forEach(function(item, index) {
        // Add to column based on index
        if (index % 2)
          colTwo.appendChild(item);
        else
          colOne.appendChild(item);
      });
    } else {
      // Create columns
      var colOne = doc.createElement('div');
      var colTwo = doc.createElement('div');
      var colThree = doc.createElement('div');
      colOne.classList.add('card-column');
      colTwo.classList.add('card-column');
      colThree.classList.add('card-column');
      container.appendChild(colOne);
      container.appendChild(colTwo);
      container.appendChild(colThree);

      array.forEach(function(item, index) {
        // Add to column based on index
        var mod = index % 3;
        if (mod === 0)
          colOne.appendChild(item);
        else if (mod === 1)
          colTwo.appendChild(item);
        else
          colThree.appendChild(item);
      });
    }
  }

  /**
   * Close any expanded items
   */
  function collapseAllItems() {
    var cardArray = Array.prototype.slice.call(doc.querySelectorAll('.expanded'));
    cardArray.forEach(function(item) {
      item.classList.remove('expanded');
    });
  }

  /**
   * Helper function to reorder an array in a random order
   * @param array Array to mix up. Is not modified in this process
   * @return New array with same data, but in a random order
   */
  function arrayRandomise(array) {
    var newArr = [];

    while (array.length > 0) {
      var index = Math.floor(Math.random() * array.length);
      newArr.push(array.splice(index, 1)[0]);
    }

    return newArr;
  }

  /**
   * Creates a link that has special hover powers
   * @param element Element to add hover box to
   * @param textArray Array of text to place in hover box
   */
  function appendHoverElement(element, textArray) {
    if (textArray.length === 0)
      return;
    // Create elements
    element.classList.add('hoverable');
    var hoverContainer = document.createElement('div');
    hoverContainer.classList.add('hoverable-container');
    element.appendChild(hoverContainer);

    textArray.forEach(function(item) {
      var itemElement = document.createElement('p');
      itemElement.textContent = truncateString(item, 32);
      hoverContainer.appendChild(itemElement);
    });
  }

  function truncateString(string, maxLength) {
    if (string.length < maxLength)
      return string;
    else
      return string.substr(0, maxLength - 3) + '...';
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
