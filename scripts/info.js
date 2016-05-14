(function(win, doc) {
  'use strict';

  var info = {};
  var categories = {};
  var resources = {};

  var themes = [{
    title: 'Default',
    filename: 'fade'
  }, {
    title: 'Original',
    filename: 'old'
  }];

  var sortMethod = 'alphabet'; // One of 'random', 'alphabet', 'category'
  var currentTheme = themes[0]; // One of the options in themes

  var aboutCard = {
    title: 'About This Repository',
    text: [
      'This repository of information contains things that are known about the upcoming game No Man\'s Sky',
      'It is an open source project, and source code can be found on GitHub',
      'It was created by secret_online, but a full list of contributors can be found on GitHub',
      'If something is missing, please send me a message using one of the links below, or fork this project and add it yourself',
      'It is recommended that you read through these cards before posting to /r/NoMansSkyTheGame or asking questions on the Steam Community forum. This prevents the need for a lot of useless posts'
    ],
    sources: [
      'https://github.com/SecretOnline/NMS-Info',
      'https://secretonline.co'
    ],
    categories: []
  };

  /* INIT */

  /**
   * Create everything that is needed for normal page function
   */
  function initInfo() {
    addInitialListeners();
    // Retrieve sort preference
    if (win.localStorage) {
      try {
        var sortType = win.localStorage.getItem('info-sort');
        if (sortType) {
          sortMethod = sortType;
          var button = doc.querySelector('.sort-type');
          if (sortMethod === 'category') {
            button.classList.remove('alpha');
            button.classList.add('category');
          } else if (sortMethod === 'random') {
            button.classList.remove('alpha');
            button.classList.add('random');
          }
        } else
          win.localStorage.setItem('info-sort', sortMethod);

        var colorType = win.localStorage.getItem('info-color');
        if (colorType) {
          try {
            currentTheme = JSON.parse(colorType);
          } catch (e) {
            console.error('theme is not a valid object');
          }
        } else
          win.localStorage.setItem('info-color', currentTheme);
        changePaint(currentTheme);
      } catch (err) {
        console.error('Problem trying to access local storage');
        console.error(err);
      }
    }

    // TODO: Lots of error handling
    // Get categories and add to page
    var catPromise = get('data/categories.json')
      .then(JSON.parse)
      .then(createCategories);
    // Get elements and add to page
    var elementPromise = get('data/resources.json')
      .then(JSON.parse)
      .then(createResources);
    // Get links and add to page
    var linkPromise = get('data/links.json')
      .then(JSON.parse)
      .then(createLinks);
    // Wait for categories, get info, and add to page
    var infoPromise = Promise.all([get('data/info.json'), catPromise])
      .then(function(arr) {
        return arr[0];
      })
      .then(JSON.parse)
      .then(createInfo);
    // Wait for categories and info, get changes, and add to page
    var recentPromise = Promise.all([get('data/recent.json'), catPromise, infoPromise])
      .then(function(arr) {
        return arr[0];
      })
      .then(JSON.parse)
      .then(createRecents);
    // Wait for all aspects of the page to be complete before handling the url search parameters
    var initPromise = Promise.all([catPromise, elementPromise, linkPromise, infoPromise, recentPromise])
      .then(handleSearchParams);
  }

  /**
   * Adds event listeners to elements
   */
  function addInitialListeners() {
    // do navbar scoll stuff
    win.addEventListener("optimizedScroll", function() {
      var header = doc.querySelector('header');
      // If the header is out of view
      if (scrollY > 70) {
        header.classList.add('floating');
      } else {
        header.classList.remove('floating');
      }
      if (scrollX > 0)
        win.scroll(0, scrollY);
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
    doc.querySelector('.tab-recent').addEventListener('click', function() {
      changeTab('recent');
    });
    doc.querySelector('.tab-links').addEventListener('click', function() {
      changeTab('links');
    });

    doc.querySelector('.sort-type').addEventListener('click', changeSort);

    doc.querySelector('.paint-job').addEventListener('click', function() {
      var i = themes.indexOf(currentTheme) + 1;
      if (i >= themes.length) {
        i = 0;
      }
      changePaint(themes[i]);
    });

    var nav = doc.querySelector('nav');

    function closeNav() {
      nav.classList.remove('open');
    }

    function toggleNav() {
      nav.classList.toggle('open');
    }
    doc.querySelector('.menu').addEventListener('click', toggleNav);
    doc.querySelector('main').addEventListener('click', closeNav);

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
  }

  /**
   * Look at the parameters in the url, and do things based on them
   */
  function handleSearchParams() {
    var searchParams = {};
    try {
      // Thanks to https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/search for the following block of code
      if (win.location.search.length > 1) {
        for (var aItKey, nKeyId = 0, aCouples = win.location.search.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
          aItKey = aCouples[nKeyId].split("=");
          searchParams[decodeURIComponent(aItKey[0])] = aItKey.length > 1 ? decodeURIComponent(aItKey[1]).replace(/_/g, " ") : "";
        }
      }
    } catch (err) {
      console.error('Error trying to process search parameters');
      console.error(location.search);
      return;
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
        try {
          // Perform a search with the given parameter
          var query = decodeURIComponent(searchParams.search);
          generalSearch(query);
          doc.querySelector('.info-search-box').value = searchParams.search;
        } catch (err) {
          console.error('Error trying to search');
          console.error(searchParams.search);
        }
      }
    } else if (typeof searchParams.info !== 'undefined') {
      collapseAllItems();
      if (searchParams.info) {
        // Expand card
        try {
          var infoElement = doc.querySelector('.page-info .info-card[data-title="' + searchParams.info + '"]');
          infoElement.classList.add('expanded');
          ga('send', 'event', 'Info Card', 'open-from-param', info[searchParams.info].title);
          addCardInfo(infoElement, info[searchParams.info]);
          infoElement.scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
          try {
            if (searchParams.highlight) {
              var indicies = searchParams.highlight.split(',');
              indicies.forEach(function(index) {
                ga('send', 'event', 'Info Card Highlight', 'highlight-from-param', info[searchParams.info].title, Number.parseInt(index));
                var infoArray = infoElement.querySelectorAll('.information p');
                infoArray[index - 1].classList.add('highlighted');
              });
            }
          } catch (e) {
            console.error('Highlighting failed. ' + e);
          }
        } catch (err) {
          console.error('Failed to open card with title ' + searchParams.info + '. ' + err);
        }
      }
    } else if (typeof searchParams.element !== 'undefined') {
      // Go to the elements page
      changeTab('elements');
      if (searchParams.element) {
        // Expand the specified element
        try {
          var element = doc.querySelector('.page-elements .element-card[data-name="' + searchParams.element + '"]');
          element.classList.add('expanded');
          ga('send', 'event', 'Element Card', 'open-from-param', info[searchParams.element].title);
          addResourceInfo(element, resources[searchParams.element]);
          element.scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
        } catch (err) {
          console.error('Failed to open element with name ' + searchParams.element + '. ' + err);
        }
      }
    } else if (typeof searchParams.recent !== 'undefined') {
      // Go to the elements page
      changeTab('recent');
    } else if (typeof searchParams.links !== 'undefined') {
      // Go to the links page
      changeTab('links');
      if (searchParams.links) {
        try {
          var heading = doc.querySelector('h2[data-title="' + searchParams.links + '"]');
          heading.scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
        } catch (err) {
          console.error('Failed to open element with name ' + searchParams.element + '. ' + err);
        }
      }
    } else {
      changeTab('main'); // Just go to default spot
    }
  }

  /**
   * Change which page is currently visible
   * @param tab Name of the tab to switch to
   */
  function changeTab(tab) {
    doc.querySelector('nav').classList.remove('open');
    win.scroll(0, 0);
    var pageContainer = doc.querySelector('.page-container');

    // Add main as default tab
    tab = tab || 'main';

    ga('send', 'event', 'Tab', 'change', tab);

    if (tab === 'main') {
      // Go to main page
      pageContainer.classList.remove('cat');
      pageContainer.classList.remove('search');
      pageContainer.classList.remove('elements');
      pageContainer.classList.remove('recent');
      pageContainer.classList.remove('links');
      win.history.replaceState(null, '', '.');
    } else if (tab === 'categories') {
      // Go to categories list
      pageContainer.classList.add('cat');
      pageContainer.classList.remove('search');
      pageContainer.classList.remove('elements');
      pageContainer.classList.remove('recent');
      pageContainer.classList.remove('links');
      win.history.replaceState(null, '', '?cat');
    } else if (tab === 'search') {
      // Go to search
      pageContainer.classList.add('search');
      pageContainer.classList.remove('cat');
      pageContainer.classList.remove('elements');
      pageContainer.classList.remove('recent');
      pageContainer.classList.remove('links');
      win.history.replaceState(null, '', '?search');
      doc.querySelector('.info-search-box').focus();
    } else if (tab === 'elements') {
      // Go to elements
      pageContainer.classList.add('elements');
      pageContainer.classList.remove('search');
      pageContainer.classList.remove('cat');
      pageContainer.classList.remove('recent');
      pageContainer.classList.remove('links');
      win.history.replaceState(null, '', '?element');
    } else if (tab === 'recent') {
      // Go to elements
      pageContainer.classList.add('recent');
      pageContainer.classList.remove('search');
      pageContainer.classList.remove('cat');
      pageContainer.classList.remove('elements');
      pageContainer.classList.remove('links');
      win.history.replaceState(null, '', '?recent');
    } else if (tab === 'links') {
      // Go to elements
      pageContainer.classList.add('links');
      pageContainer.classList.remove('search');
      pageContainer.classList.remove('cat');
      pageContainer.classList.remove('elements');
      pageContainer.classList.remove('recent');
      win.history.replaceState(null, '', '?links');
    }
  }

  /* CARD CREATION */

  /**
   * Handles creation of info cards
   */
  function createInfo(data) {
    var cardList = doc.querySelector('.info-list');
    // Create cards for each of the pieces of information
    data.forEach(function(item) {
      info[item.title] = item;
    });

    cardList.appendChild(createInfoCard(aboutCard));

    var infoArr = sortItems();

    infoArr.forEach(function(item) {
      var card = createInfoCard(item);
      if (!card)
        return;
      cardList.appendChild(card);
    });
  }

  /**
   * Handles creation of category cards
   */
  function createCategories(data) {
    var cardList = doc.querySelector('.cat-list');
    // Create category cards for each of the categories
    data.forEach(function(item) {
      categories[item.title] = item;
    });

    var catArr = sortCategories();
    catArr.forEach(function(item) {
      var card = createCategoryCard(item);
      if (!card)
        return;
      cardList.appendChild(card);
    });
  }

  /**
   * Handles creation of resource cards
   */
  function createResources(data) {
    var cardList = doc.querySelector('.elements-list');
    var cardArr = [];
    // Create element cards
    data.forEach(function(item, index) {
      resources[item.name] = item;

      var card = createResourceCard(item);
      if (!card)
        return;
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

    cardArr.forEach(function(item) {
      cardList.appendChild(item);
    });
  }

  /**
   * Handles creation of link cards
   */
  function createLinks(data) {
    var container = doc.querySelector('.link-list');

    data.forEach(function(category) {
      // create title
      var title = doc.createElement('h2');
      title.textContent = category.title;
      title.dataset.title = category.title;
      container.appendChild(title);
      // Add link cards
      var cardList = doc.createElement('div');
      cardList.classList.add('card-list');

      category.items.forEach(function(item) {
        var card = createLinkCard(item);
        if (!card)
          return;
        cardList.appendChild(card);
      });

      container.appendChild(cardList);
    });
  }

  /**
   * Handles creation of recently changed cards
   */
  function createRecents(data) {
    var cardList = doc.querySelector('.recent-list');
    data.forEach(function(item) {
      var card;
      if (typeof item === 'string') {
        card = createInfoCard(info[item]);
        card.querySelector('.header').addEventListener('click', function() {
          card.querySelector('.card-content .information').classList.add('added');
        });
      } else {
        if (item.type && item.type === 'manual') {
          card = createInfoCard(item);
        } else {
          card = createInfoCard(info[item.title]);
          card.querySelector('.header').addEventListener('click', function() {
            var infoArray = card.querySelectorAll('.information p');
            if (item.additions)
              item.additions.forEach(function(added) {
                infoArray[added].classList.add('added');
              });
            if (item.edited)
              item.edited.forEach(function(edit) {
                infoArray[edit].classList.add('edited');
              });
            if (item.removals)
              item.removals.forEach(function(removed) {
                var removalBar = doc.createElement('p');
                removalBar.classList.add('removed');
                removalBar.innerHTML = '<em>Removed</em>';
                if (removed < infoArray.length)
                  card.querySelector('.information').insertBefore(removalBar, infoArray[removed]);
                else
                  card.querySelector('.information').appendChild(removalBar);
              });
          });
        }
      }
      if (!card)
        return;
      cardList.appendChild(card);
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
    card.classList.add('card');
    card.classList.add('info-card');
    // Store data values
    card.dataset.title = data.title;

    if (data.spoiler)
      card.classList.add('spoiler');

    // Create header
    var header = doc.createElement('div');
    header.classList.add('header');
    var headerTitle = doc.createElement('h3');
    headerTitle.classList.add('card-title');
    headerTitle.textContent = data.title;
    header.appendChild(headerTitle);
    card.appendChild(header);

    // Add empty content box
    var content = doc.createElement('div');
    content.classList.add('card-content');
    card.appendChild(content);

    // Add category list
    if (data.categories)
      if (data.categories.length) {
        try {
          var category = categories[data.categories[0]];
          card.classList.add('cat-' + category.class);
        } catch (err) {
          console.warn('Category ' + data.categories[0] + ' might not exist. Couldn\'t set header properties');
        }

        var cats = doc.createElement('div');
        cats.classList.add('categories');

        // Add all specified categories to a list
        var catList = doc.createElement('ul');
        data.categories.forEach(function(cat) {
          try {
            var catEl = doc.createElement('li');
            catEl.textContent = categories[cat].title;
            catEl.dataset.id = cat;
            catEl.style.color = category.textColor;

            catEl.addEventListener('click', function() {
              // Perform a category search on the clicked category
              categorySearch(catEl.dataset.id);
            });

            catList.appendChild(catEl);
          } catch (err) {
            console.warn('Countn\'n add category ' + cat + ', ignoring');
          }
        });
        cats.appendChild(catList);

        header.appendChild(cats);
      }

      // Open / close the card when the header is clicked
    header.addEventListener('click', function() {
      if (card.classList.contains('expanded')) {
        ga('send', 'event', 'Info Card', 'close', data.title);

        try {
          // See whether we need to do anything special to the url
          if (doc.querySelector('.page-container').classList.contains('search'))
          // Add search to the url
            if (doc.querySelector('.info-search-box').value)
              win.history.replaceState(null, '', '?search=' + encodeURIComponent(doc.querySelector('.info-search-box').value.replace(/\s/g, "_").toLowerCase()));
            else
              win.history.replaceState(null, '', '?search');
          else
            win.history.replaceState(null, '', '.');

          // Clear content after 0.5 seconds
          win.setTimeout(function() {
            if (!card.classList.contains('expanded'))
              content.innerHTML = '';
          }, 500);
        } catch (err) {
          console.error('Error while trying to expand card ' + data.title);
          console.error(err);
        }
      } else {
        ga('send', 'event', 'Info Card', 'open', data.title);
        // Expand the card
        collapseAllItems();
        win.history.replaceState(null, '', '?info=' + encodeURIComponent(card.dataset.title.replace(/\s/g, "_")));

        addCardInfo(card, data);
      }
      card.classList.toggle('expanded');
    });

    return card;
  }

  /**
   * Create a card for a category
   * @param data Object describing this category
   * @return Element to add to the page
   */
  function createCategoryCard(data) {
    // Create card element
    var card = doc.createElement('div');
    card.classList.add('card');
    card.classList.add('category-card');
    // Store data values
    card.dataset.title = data.title;

    if (data.darkText)
      card.classList.add('dark-text');

    // Create header
    var header = doc.createElement('div');
    header.classList.add('header');
    card.classList.add('cat-' + data.class);
    card.appendChild(header);

    var title = doc.createElement('h3');
    title.textContent = data.title;
    title.classList.add('card-title');
    header.appendChild(title);

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
    card.classList.add('card');
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
        ga('send', 'event', 'Element Card', 'close', data.title);

        try {
          if (doc.querySelector('.page-container').classList.contains('search'))
          // Add search to the url
            if (doc.querySelector('.info-search-box').value)
              win.history.replaceState(null, '', '?search=' + encodeURIComponent(doc.querySelector('.info-search-box').value.replace(/\s/g, "_").toLowerCase()));
            else
              win.history.replaceState(null, '', '?search');
          else
            win.history.replaceState(null, '', '.');

          // Clear content after 0.5 seconds
          win.setTimeout(function() {
            if (!card.classList.contains('expanded'))
              content.innerHTML = '';
          }, 500);
        } catch (err) {
          console.error('Error while trying to expand resource' + data.name);
          console.error(err);
        }
      } else {
        ga('send', 'event', 'Element Card', 'open', data.title);

        collapseAllItems();
        win.history.replaceState(null, '', '?element=' + card.dataset.name);

        addResourceInfo(card, data);
      }
      card.classList.toggle('expanded');
    });

    return card;
  }

  /**
   * Create a source card with the given data
   * @param data Object describing the information source
   * @return Element to add to page
   */
  function createLinkCard(data) {
    // Create card element
    var card = doc.createElement('div');
    card.classList.add('card');
    card.classList.add('link-card');

    if (data.darkText) {
      card.classList.add('dark-text');
    }
    // Store data values
    card.dataset.title = data.title;

    // Create header
    var header = doc.createElement('div');
    header.classList.add('header');
    header.style.backgroundColor = data.color;
    var headerTitle = doc.createElement('h3');
    headerTitle.classList.add('card-title');
    headerTitle.textContent = data.title;
    header.appendChild(headerTitle);
    card.appendChild(header);

    if (data.method === 'link') {
      var icon = doc.createElement('img');
      icon.src = (data.darkText) ? 'res/external-dark.svg' : 'res/external.svg';
      icon.alt = 'Open in new window / tab';
      icon.classList.add('external');
      header.appendChild(icon);
    }

    // Add empty content box
    var content = doc.createElement('div');
    content.classList.add('card-content');
    card.appendChild(content);

    // Open / close the card when the header is clicked
    header.addEventListener('click', function() {
      if (data.method === 'embed' || data.method === 'yt') {
        if (card.classList.contains('expanded')) {
          ga('send', 'event', 'Link Card', 'close', data.title);

          // Clear content after 0.5 seconds
          win.setTimeout(function() {
            if (!card.classList.contains('expanded'))
              content.innerHTML = '';
          }, 500);
        } else {
          ga('send', 'event', 'Link Card', 'open', data.title);

          // Expand the card
          collapseAllItems();
          addLinkInfo(card, data);
        }
        card.classList.toggle('expanded');
      } else if (data.method === 'link') {
        ga('send', 'event', 'Link Card', 'external', data.title);

        win.open(data.src, '_blank'); // Open link in new tab/window (user's broswer preference)
      }
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

        t.addEventListener('click', function() {
          function getHiglighted() {
            var arr = [];
            infoArr.forEach(function(item, index) {
              if (item.classList.contains('highlighted')) {
                arr[arr.length] = index + 1;
              }
            });
            return arr;
          }

          var infoArr = Array.prototype.slice.call(information.querySelectorAll('p:not(.removed)'));
          var i = infoArr.indexOf(t);

          if (!getSelection().toString()) {
            if (t.classList.contains('highlighted')) {
              t.classList.remove('highlighted');
              ga('send', 'event', 'Info Card Highlight', 'dehighlight', data.title, i + 1);
            } else {
              t.classList.add('highlighted');
              ga('send', 'event', 'Info Card Highlight', 'highlight', data.title, i + 1);
            }

            var highlighted = getHiglighted().sort();
            win.history.replaceState(null, '', '?info=' + encodeURIComponent(card.dataset.title.replace(/\s/g, "_")) + ((highlighted.length) ? '&highlight=' + highlighted.join() : ''));
          }
        });
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
            var anchor = doc.createElement('a');
            anchor.href = source;
            anchor.target = '_blank';
            anchor.textContent = truncateString(source, 10);
            appendHoverElement(anchor, [source]);
            sourceEl.appendChild(anchor);
            sourceList.appendChild(sourceEl);

            anchor.addEventListener('click', function() {
              ga('send', 'event', 'Info Card Source', 'source', data.title, sIndex + 1);
            });
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
              try {
                var otherCard = doc.querySelector('.info-card[data-title="' + rItem + '"]');
                // Expand the other card
                collapseAllItems();
                win.history.replaceState(null, '', '?info=' + encodeURIComponent(rItem.replace(/\s/g, "_")));

                ga('send', 'event', 'Info Card', 'open-from-related', info[rItem].title);

                addCardInfo(otherCard, info[rItem]);
                changeTab('main');
                otherCard.classList.add('expanded');
                otherCard.scrollIntoView({
                  block: 'start',
                  behavior: 'smooth'
                });
              } catch (err) {
                console.error('Failed to switch to card ' + rItem);
                console.error(err);
              } finally {

              }
            });
            relatedList.appendChild(itemEl);
          });
          related.appendChild(relatedList);

          content.appendChild(related);
        }
    }
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
              try {
                collapseAllItems();
                var otherElement = doc.querySelector('.element-card[data-name="' + element + '"]');
                otherElement.classList.add('expanded');
                addResourceInfo(otherElement, resources[element]);
              } catch (err) {
                console.error('Error while trying to expand resource ' + element);
                console.error(err);
              }
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
              try {
                collapseAllItems();
                var otherElement = doc.querySelector('.element-card[data-name="' + element + '"]');
                otherElement.classList.add('expanded');
                addResourceInfo(otherElement, resources[element]);
              } catch (err) {
                console.error('Error while trying to expand resource ' + element);
                console.error(err);
              }
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
   * Add content to the given card
   * This is so that inner elements are only present if needed
   * @param card Element to add the information to
   * @param data Object describing the piece of information
   */
  function addLinkInfo(card, data) {
    // Clear any pre-existing content
    var content = card.querySelector('.card-content');
    content.innerHTML = '';

    var container = doc.createElement('div');
    var link = doc.createElement('a');
    var t;

    if (data.method === 'embed') {
      link.href = data.src;
      t = 'Open in new window / tab';
    } else if (data.method === 'yt') {
      link.href = 'https://www.youtube.com/watch?v=' + data.src;
      t = 'Open in YouTube';
    }

    link.target = '_blank';
    var icon = doc.createElement('img');
    icon.src = 'res/external-dark.svg';
    icon.alt = t;
    icon.classList.add('external');
    link.appendChild(icon);
    var text = doc.createElement('span');
    text.textContent = t;
    link.appendChild(text);
    container.appendChild(link);
    content.appendChild(container);

    link.addEventListener('click', function() {
      ga('send', 'event', 'Link Card', 'external', data.title);
    });

    var frame = doc.createElement('iframe');

    if (data.method === 'embed') {
      frame.src = data.src;
    } else if (data.method === 'yt') {
      frame.src = 'https://www.youtube.com/embed/' + data.src;
    }

    frame.allowfullscreen = true;
    content.appendChild(frame);
  }

  /* SEARCH AND SORT */

  /**
   * Change the sort method used on the main page
   */
  function changeSort() {
    var button = document.querySelector('.sort-type');

    if (button.classList.contains('category')) {
      button.classList.remove('category');
      button.classList.add('random');
      sortMethod = 'random';
    } else if (button.classList.contains('random')) {
      button.classList.remove('random');
      button.classList.add('alpha');
      sortMethod = 'alphabet';
    } else {
      button.classList.remove('alpha');
      button.classList.add('category');
      sortMethod = 'category';
    }

    ga('send', 'event', 'Info Sort', 'sort', sortMethod);

    // Set stored sort type
    if (win.localStorage) {
      try {
        win.localStorage.setItem('info-sort', sortMethod);
      } catch (err) {
        console.error('Problem trying to access local storage');
        console.error(err);
      }
    }

    var infoArr = sortItems();

    var cardList = doc.querySelector('.info-list');
    cardList.innerHTML = '';
    cardList.appendChild(createInfoCard(aboutCard));

    infoArr.forEach(function(item) {
      var card = createInfoCard(item);
      if (!card)
        return;
      cardList.appendChild(card);
    });
  }

  /**
   * Change the color scheme used by the repository
   */
  function changePaint(theme) {
    currentTheme = theme;

    removeElement(document.head.querySelector('link[title=theme]'));

    var link = document.createElement('link');
    if (theme.custom) {
      link.href = theme.url;
    } else {
      link.href = '/styles/themes/' + theme.filename + '.css';
    }
    link.rel = 'stylesheet';
    link.title = 'theme';
    document.head.appendChild(link);

    ga('send', 'event', 'Paint Job', 'sort', theme);

    // Set stored sort type
    if (win.localStorage) {
      try {
        win.localStorage.setItem('info-color', JSON.stringify(theme));
      } catch (err) {
        console.error('Problem trying to access local storage');
        console.error(err);
      }
    }
  }

  /**
   * Sort items according to the current sort method
   * @return Array containing the sorted items
   */
  function sortItems() {
    var infoArr = [];
    var returnArr = [];

    // Get all info into an array
    var infoKeyArr = Object.keys(info);
    infoKeyArr.forEach(function(key) {
      infoArr.push(info[key]);
    });

    if (sortMethod === 'random') {
      returnArr = arrayRandomise(infoArr);
    } else if (sortMethod === 'alphabet') {
      returnArr = infoArr.sort(titleSort);
    } else if (sortMethod === 'category') {
      // Create object of arrays, each one corresponding to a category
      var catObj = {};
      Object.keys(categories).forEach(function(key) {
        catObj[key] = [];
      });

      // Addeach piee of info to it's category's array
      infoArr.forEach(function(item) {
        if (item.categories)
          if (item.categories[0])
            catObj[item.categories[0]].push(item);
      });

      // Sort categories
      var catKeys = Object.keys(catObj);
      catKeys.sort();
      // Add items to returned array
      catKeys.forEach(function(key) {
        catObj[key].sort(titleSort);
        returnArr = returnArr.concat(catObj[key]);
      });
    }
    return returnArr;
  }

  /**
   * Sorts the list of categories alphabetically
   */
  function sortCategories() {
    var catArr = [];
    var catKeyArr = Object.keys(categories);
    catKeyArr.forEach(function(key) {
      catArr.push(categories[key]);
    });

    catArr = catArr.sort(titleSort);
    return catArr;
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

    ga('send', 'event', 'Search', 'category', category.title);

    var infoIndexArr = Object.keys(info);

    container.innerHTML = '';
    infoIndexArr.forEach(function(index) {
      var item = info[index];
      // If info is in the category
      if (item.categories.indexOf(id) > -1) {
        // Create card and add to list
        var card = createInfoCard(item);
        container.appendChild(card);
      }
    });

    changeTab('search');

    win.history.replaceState(null, '', '?cat=' + id);
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

    ga('send', 'event', 'Search', 'search', query, cardArr.length);

    // Expand card if only one item returned in search
    if (cardArr.length === 1) {
      cardArr[0].classList.add('expanded');
      if (cardArr[0].classList.contains('info-card'))
        addCardInfo(cardArr[0], info[cardArr[0].dataset.title]);
      else if (cardArr[0].classList.contains('element-card'))
        addResourceInfo(cardArr[0], resources[cardArr[0].dataset.name]);
    }

    container.innerHTML = '';
    cardArr.forEach(function(item) {
      container.appendChild(item);
    });

    win.history.replaceState(null, '', '?search=' + (query.replace(/\s/g, "_")));
    win.scroll(0, 0);
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
    // Keywords
    if (info.keywords) {
      querySplit.forEach(function(word) {
        if (info.keywords.indexOf(word) > -1) {
          score += 4;
        }
      });
    }

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

  /* MISC DOM INTERACTIONS */

  /**
   * Close any expanded items
   */
  function collapseAllItems() {
    var cardArray = Array.prototype.slice.call(doc.querySelectorAll('.expanded'));
    cardArray.forEach(function(item) {
      item.classList.remove('expanded');
      var content = item.querySelector('.card-content');
      if (content) {
        setTimeout(function() {
          content.innerHTML = '';
        }, 500);
      }
    });
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
    var hoverContainer = doc.createElement('div');
    hoverContainer.classList.add('hoverable-container');
    element.appendChild(hoverContainer);

    textArray.forEach(function(item) {
      var itemElement = doc.createElement('p');
      itemElement.textContent = truncateString(item, 32);
      hoverContainer.appendChild(itemElement);
    });
  }

  function removeElement(element) {
    if (element) {
      element.parentNode.removeChild(element);
    }
  }

  /* HELPER */

  /**
   * Creates a Promise that resolves when a file is retrieved
   * @param url URL of file to retrieve
   * @return Promise
   */
  function get(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('load', function() {
        resolve(xhr.responseText);
      });
      xhr.addEventListener('error', function(e) {
        reject(e);
      });
      xhr.open('get', url, true);
      xhr.send();
    });
  }

  /**
   * Truncates a string if its length is greater than the maximum, otherwise returns the string
   * @param string String to Truncates
   * @param maxLength Maximum length of output string
   * @return A string of length no more than the given maximum
   */
  function truncateString(string, maxLength) {
    string = string.replace(/^https?:\/\/(?:www\.)?/i, '');

    if (string.length < maxLength)
      return string;
    else
      return string.substr(0, maxLength - 3) + '...';
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
   * Sort according to title
   * @param a Item 1
   * @param b Item 2
   * @return Integer describing relationship between items
   */
  function titleSort(a, b) {
    if (a.title < b.title)
      return -1;
    if (a.title > b.title)
      return 1;
    return 0;
  }

  function createLoadPromise() {
    if (!win.loadPromise) {
      win.loadPromise = new Promise(function(resolve, reject) {
        if (doc.readyState !== 'loading')
          resolve();
        else
          win.addEventListener('DOMContentLoaded', resolve);
      });
    }
    return win.loadPromise;
  }

  // Thanks to https://developer.mozilla.org/en-US/docs/Web/Events/scroll
  // For the following scroll event throtling.
  // Yay for making things go slightly slower for performance!
  (function() {
    var throttle = function(type, name, obj) {
      obj = obj || win;
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


  if (typeof Promise !== 'undefined') {
    createLoadPromise();
    win.loadPromise
      .then(initInfo);
  } else {
    var s = doc.createElement('script');
    s.src = 'scripts/Promise.min.js';
    s.addEventListener('load', function() {
      createLoadPromise();
      win.loadPromise
        .then(initInfo);
    });
    doc.head.appendChild(s);
  }

})(window, document);
